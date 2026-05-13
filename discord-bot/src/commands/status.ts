import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { pingServer } from '../slp.js';

const PUBLIC_ADDRESS = '185.207.214.12:37465';

export async function handleStatus(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const result = await pingServer();
  if (!result) {
    await interaction.reply('🔴 Сервер недоступен');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x55ff55)
    .setTitle('KrestGG Minecraft')
    .setDescription(result.motd)
    .addFields(
      { name: 'Игроки', value: `${result.online}/${result.max}`, inline: true },
      { name: 'Версия', value: result.version, inline: true },
      { name: 'Ping', value: `${result.latencyMs}ms`, inline: true },
      { name: 'Адрес', value: `\`${PUBLIC_ADDRESS}\``, inline: false },
    );

  await interaction.reply({ embeds: [embed] });
}
