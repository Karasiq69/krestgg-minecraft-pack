import { createServer, type IncomingMessage, type Server } from 'node:http';
import { pingServer } from './slp.js';
import { getPlayerList } from './player-list.js';
import { NICK_PATTERN, submitInvite } from './invite.js';
import { getClient } from './bot.js';
import { config } from './config.js';

const PORT = Number(process.env.HTTP_PORT ?? 8080);
const BODY_LIMIT = 4096;

let server: Server | null = null;

// Naive per-IP throttle for POST /invite: the port is public, this keeps a
// spammer from flooding the admin channel. Landing проксирует со своего IP —
// лимит должен быть просторнее человеческого потока заявок.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string, now = Date.now()): boolean {
  const h = hits.get(ip);
  if (!h || now > h.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  h.count += 1;
  return h.count > RATE_MAX;
}

function readBody(req: IncomingMessage): Promise<string | null> {
  return new Promise((resolve) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > BODY_LIMIT) {
        resolve(null);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => resolve(null));
  });
}

function sendJson(
  res: import('node:http').ServerResponse,
  body: unknown,
  statusCode = 200,
): void {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

async function handleInvitePost(
  req: IncomingMessage,
  res: import('node:http').ServerResponse,
): Promise<void> {
  if (config.inviteToken && req.headers['x-invite-token'] !== config.inviteToken) {
    sendJson(res, { error: 'forbidden' }, 403);
    return;
  }
  const ip = req.socket.remoteAddress ?? 'unknown';
  if (rateLimited(ip)) {
    sendJson(res, { error: 'rate_limited' }, 429);
    return;
  }

  const raw = await readBody(req);
  if (raw === null) {
    sendJson(res, { error: 'bad_request' }, 400);
    return;
  }
  let body: { nick?: unknown; discord?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    sendJson(res, { error: 'bad_request' }, 400);
    return;
  }

  const nick = typeof body.nick === 'string' ? body.nick.trim() : '';
  if (!NICK_PATTERN.test(nick)) {
    sendJson(res, { error: 'invalid_nick' }, 400);
    return;
  }
  // Discord-ник — свободный текст: режем длину и управляющие символы.
  const discord =
    typeof body.discord === 'string'
      ? body.discord.replace(/[\p{Cc}\p{Cf}]/gu, '').trim().slice(0, 64) || undefined
      : undefined;

  const client = getClient();
  if (!client) {
    sendJson(res, { error: 'unavailable' }, 503);
    return;
  }

  const result = await submitInvite(client, { nick, discord });
  switch (result.status) {
    case 'ok':
      sendJson(res, { ok: true });
      return;
    case 'duplicate':
      sendJson(res, { error: 'duplicate' }, 409);
      return;
    case 'whitelisted':
      sendJson(res, { error: 'already_whitelisted' }, 409);
      return;
    default:
      sendJson(res, { error: 'unavailable' }, 503);
  }
}

export function startHttp(): void {
  server = createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/invite') {
      try {
        await handleInvitePost(req, res);
      } catch (err) {
        console.error('[http] /invite error:', err);
        if (!res.headersSent) sendJson(res, { error: 'internal' }, 500);
      }
      return;
    }

    if (req.method !== 'GET') {
      res.statusCode = 404;
      res.end();
      return;
    }

    // Online count/max from the Server List Ping (same number the status pill shows).
    if (req.url === '/status') {
      const slp = await pingServer();
      sendJson(
        res,
        slp
          ? { online: true, players: { current: slp.online, max: slp.max } }
          : { online: false, players: { current: 0, max: 0 } },
      );
      return;
    }

    // Online player NAMES. The SLP sample is empty on this server (Velocity proxy
    // does not pass it through and the backend has it disabled), so names can only
    // come from RCON `/list`. Used by the landing's player pills.
    if (req.url === '/players') {
      try {
        const { count, max, players } = await getPlayerList();
        sendJson(res, {
          online: true,
          players: { current: count, max, sample: players },
        });
      } catch {
        // RCON unavailable — report offline, fail-soft (landing hides the list).
        sendJson(res, { online: false, players: { current: 0, max: 0, sample: [] } });
      }
      return;
    }

    res.statusCode = 404;
    res.end();
  });

  server.on('error', (err) => {
    console.error('[http] server error:', err);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[http] listening on :${PORT}`);
  });
}

export async function stopHttp(): Promise<void> {
  if (!server) return;
  await new Promise<void>((resolve) => server!.close(() => resolve()));
  server = null;
}
