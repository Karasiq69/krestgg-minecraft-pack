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
import {
  WhitelistFileError,
  addToWhitelist,
  removeFromWhitelist,
} from '../whitelist-store.js';

import { NICK_PATTERN } from '../invite.js';

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
  // NB: add/remove пишут whitelist.json напрямую с offline-UUID; ванильный `whitelist add`
  // не используется, он резолвит ник через Mojang и пишет premium-UUID (MC-063).
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

  try {
    const stale = (reloaded: boolean) =>
      reloaded ? '' : '\n⚠️ RCON недоступен — применится при следующем reload сервера';

    if (sub === 'add') {
      const { outcome, reloaded } = await addToWhitelist(name);
      const note =
        outcome === 'exists'
          ? 'уже в whitelist'
          : outcome === 'repaired'
            ? 'запись перезаписана с корректным offline-UUID'
            : 'добавлен';
      await interaction.editReply({ content: `✅ \`${name}\` — ${note}${stale(reloaded)}` });
      if (outcome !== 'exists') {
        await sendAudit(
          interaction.client,
          `✅ <@${interaction.user.id}> добавил \`${name}\` в whitelist`,
        );
      }
    } else {
      const { outcome, reloaded } = await removeFromWhitelist(name);
      if (outcome === 'missing') {
        await interaction.editReply({ content: `\`${name}\` не найден в whitelist` });
        return;
      }
      await interaction.editReply({
        content: `❌ \`${name}\` удалён из whitelist${stale(reloaded)}`,
      });
      await sendAudit(
        interaction.client,
        `❌ <@${interaction.user.id}> удалил \`${name}\` из whitelist`,
      );
    }
  } catch (err) {
    if (err instanceof WhitelistFileError) {
      console.error('[whitelist]', err.message, err.cause ?? '');
      await interaction.editReply({
        content: `⚠️ Не получилось записать whitelist: ${err.message}`,
      });
      return;
    }
    await interaction.editReply({ content: '⚠️ RCON временно недоступен' });
  }
}
