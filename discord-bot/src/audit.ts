import { Client, TextChannel } from 'discord.js';
import { config } from './config.js';

export async function sendAudit(client: Client, text: string): Promise<void> {
  try {
    const channel = await client.channels.fetch(config.discord.auditChannelId);
    if (channel && channel.isTextBased() && 'send' in channel) {
      // allowedMentions parse:[] — render <@id> as a styled name but never ping.
      await (channel as TextChannel).send({
        content: text,
        allowedMentions: { parse: [] },
      });
    }
  } catch {
    // silent fail — auditing is best-effort
  }
}
