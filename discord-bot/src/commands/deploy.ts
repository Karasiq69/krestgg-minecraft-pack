import { REST, Routes, Client } from 'discord.js';
import { config } from '../config.js';
import { commands } from './definitions.js';

export async function deployCommands(client: Client): Promise<void> {
  const clientId = client.user?.id;
  if (!clientId) throw new Error('Client not ready: no user id');

  const rest = new REST({ version: '10' }).setToken(config.discord.token);
  await rest.put(
    Routes.applicationGuildCommands(clientId, config.discord.guildId),
    { body: commands },
  );
  console.log(`[bot] deployed ${commands.length} slash commands to guild ${config.discord.guildId}`);
}
