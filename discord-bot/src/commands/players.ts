import { ChatInputCommandInteraction } from 'discord.js';
import { sendCommand } from '../rcon.js';
import { parsePlayerList } from '../player-list.js';

export async function handlePlayers(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  // RCON round-trip can exceed Discord's 3s ack window → defer first.
  await interaction.deferReply();
  try {
    const raw = await sendCommand('list');
    const { count, players } = parsePlayerList(raw);
    if (count === 0) {
      await interaction.editReply('На сервере никого нет');
      return;
    }
    await interaction.editReply(`Онлайн (${count}): ${players.join(', ')}`);
  } catch {
    await interaction.editReply('⚠️ RCON временно недоступен');
  }
}
