import { createServer, type Server } from 'node:http';
import { pingServer } from './slp.js';
import { getPlayerList } from './player-list.js';

const PORT = Number(process.env.HTTP_PORT ?? 8080);

let server: Server | null = null;

function sendJson(res: import('node:http').ServerResponse, body: unknown): void {
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

export function startHttp(): void {
  server = createServer(async (req, res) => {
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
