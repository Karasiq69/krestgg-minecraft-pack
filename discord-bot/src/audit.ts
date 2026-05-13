import { Client, TextChannel } from 'discord.js';
import { config } from './config.js';

export async function sendAudit(client: Client, text: string): Promise<void> {
  try {
    const channel = await client.channels.fetch(config.discord.auditChannelId);
    if (channel && channel.isTextBased() && 'send' in channel) {
      await (channel as TextChannel).send(text);
    }
  } catch {
    // silent fail — auditing is best-effort
  }
}
