import { ChatInputCommandInteraction } from 'discord.js';
import { sendCommand } from '../rcon.js';
import { parsePlayerList } from '../player-list.js';

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
