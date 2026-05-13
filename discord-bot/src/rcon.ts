import { Rcon } from 'rcon-client';
import {
  HOST,
  RCON_PORT,
  config,
  RCON_RECONNECT_BASE_MS,
  RCON_RECONNECT_MAX_MS,
} from './config.js';

let client: Rcon | null = null;
let connected = false;
let reconnectDelay = RCON_RECONNECT_BASE_MS;
let reconnectTimer: NodeJS.Timeout | null = null;

async function tryConnect(): Promise<void> {
  try {
    const c = new Rcon({
      host: HOST,
      port: RCON_PORT,
      password: config.rcon.password,
      timeout: 5000,
    });

    c.on('end', () => {
      connected = false;
      client = null;
      scheduleReconnect();
    });

    c.on('error', (err) => {
      console.warn('[rcon] error:', err.message);
    });

    await c.connect();
    client = c;
    connected = true;
    reconnectDelay = RCON_RECONNECT_BASE_MS;
    console.log('[rcon] connected');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[rcon] connect failed:', msg);
    scheduleReconnect();
  }
}

function scheduleReconnect(): void {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    tryConnect();
  }, reconnectDelay);
  reconnectDelay = Math.min(reconnectDelay * 2, RCON_RECONNECT_MAX_MS);
}

export async function connectRcon(): Promise<void> {
  await tryConnect();
}

export async function disconnectRcon(): Promise<void> {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (client) {
    try {
      await client.end();
    } catch {
      // ignore
    }
    client = null;
    connected = false;
  }
}

export async function sendCommand(cmd: string): Promise<string> {
  if (!connected || !client) {
    throw new Error('RCON unavailable');
  }
  return client.send(cmd);
}

export function isConnected(): boolean {
  return connected;
}
