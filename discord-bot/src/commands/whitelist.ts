import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
} from 'discord.js';
import { config } from '../config.js';
import { sendCommand } from '../rcon.js';
import { sendAudit } from '../audit.js';
import { stripColors } from '../format.js';

const NICK_PATTERN = /^[A-Za-z0-9_]{3,16}$/;

function isAuthorized(member: unknown): boolean {
  if (!member || typeof member !== 'object') return false;
  const gm = member as GuildMember;

  const perms = gm.permissions;
  if (perms instanceof PermissionsBitField && perms.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  return gm.roles?.cache?.has(config.discord.modRoleId) ?? false;
}

export async function handleWhitelist(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!isAuthorized(interaction.member)) {
    await interaction.reply({ content: '❌ Нет прав', flags: MessageFlags.Ephemeral });
    return;
  }

  const sub = interaction.options.getSubcommand();

  // RCON round-trip может уйти за 3-секундное окно ack у Discord, поэтому подтверждаем
  // interaction сразу — поздний ответ идёт через editReply, а не падает с 10062 Unknown interaction.
  // NB: `easywhitelist add` в Mojang НЕ ходит — сервер offline-mode, пишет offline-UUID (v3) локально
  // и мгновенно. Совпадение whitelist↔вход держит LimboAuth `force-offline-uuid: true` на прокси (MC-037).
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  if (sub === 'list') {
    try {
      const raw = await sendCommand('whitelist list');
      await interaction.editReply({ content: `\`\`\`\n${stripColors(raw)}\n\`\`\`` });
    } catch {
      await interaction.editReply({ content: '⚠️ RCON временно недоступен' });
    }
    return;
  }

  const name = interaction.options.getString('name', true);
  if (!NICK_PATTERN.test(name)) {
    await interaction.editReply({ content: '❌ Невалидный ник' });
    return;
  }

  const cmd = sub === 'add' ? `easywhitelist add ${name}` : `easywhitelist remove ${name}`;
  try {
    const raw = await sendCommand(cmd);
    await interaction.editReply({ content: `\`${stripColors(raw)}\`` });

    const emoji = sub === 'add' ? '✅' : '❌';
    const verb = sub === 'add' ? 'добавил' : 'удалил';
    const prep = sub === 'add' ? 'в whitelist' : 'из whitelist';
    await sendAudit(
      interaction.client,
      `${emoji} <@${interaction.user.id}> ${verb} \`${name}\` ${prep}`,
    );
  } catch {
    await interaction.editReply({ content: '⚠️ RCON временно недоступен' });
  }
}
