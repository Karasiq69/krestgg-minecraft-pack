import { connectRcon, disconnectRcon } from './rcon.js';
import { startBot, stopBot } from './bot.js';

async function main(): Promise<void> {
  console.log('[main] starting mcbot');
  await connectRcon();
  await startBot();
  console.log('[main] mcbot up');
}

async function shutdown(signal: string): Promise<void> {
  console.log(`[main] received ${signal}, shutting down`);
  await stopBot().catch((err) => console.error('[main] stopBot error:', err));
  await disconnectRcon().catch((err) => console.error('[main] disconnectRcon error:', err));
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

main().catch((err) => {
  console.error('[main] fatal:', err);
  process.exit(1);
});
