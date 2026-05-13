import { ChatInputCommandInteraction } from 'discord.js';
import { sendCommand } from '../rcon.js';

function parsePlayerList(raw: string): { count: number; players: string[] } {
  // MC RCON `list` typical: "There are 2 of a max of 30 players online: Notch, Herobrine"
  const match = raw.match(/There are (\d+) of a max of (\d+) players online:?\s*(.*)/);
  if (!match) return { count: 0, players: [] };
  const count = parseInt(match[1], 10);
  const list = match[3]?.trim() ?? '';
  const players = list ? list.split(',').map((s) => s.trim()).filter(Boolean) : [];
  return { count, players };
}

export async function handlePlayers(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  try {
    const raw = await sendCommand('list');
    const { count, players } = parsePlayerList(raw);
    if (count === 0) {
      await interaction.reply('На сервере никого нет');
      return;
    }
    await interaction.reply(`Онлайн (${count}): ${players.join(', ')}`);
  } catch {
    await interaction.reply({
      content: '⚠️ RCON временно недоступен',
      ephemeral: true,
    });
  }
}
