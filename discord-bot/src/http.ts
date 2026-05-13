import { createServer, type Server } from 'node:http';
import { pingServer } from './slp.js';

const PORT = Number(process.env.HTTP_PORT ?? 8080);

let server: Server | null = null;

export function startHttp(): void {
  server = createServer(async (req, res) => {
    if (req.method !== 'GET' || req.url !== '/status') {
      res.statusCode = 404;
      res.end();
      return;
    }
    const slp = await pingServer();
    const body = slp
      ? { online: true, players: { current: slp.online, max: slp.max } }
      : { online: false, players: { current: 0, max: 0 } };
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    res.end(JSON.stringify(body));
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
