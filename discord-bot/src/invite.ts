import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Client,
  EmbedBuilder,
  GuildMember,
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
  TextChannel,
} from 'discord.js';
import { config } from './config.js';
import { sendCommand } from './rcon.js';
import { sendAudit } from './audit.js';
import { stripColors } from './format.js';

export const NICK_PATTERN = /^[A-Za-z0-9_]{3,16}$/;

export type InviteRequest = { nick: string; discord?: string };
export type SubmitResult =
  | { status: 'ok' }
  | { status: 'duplicate' }
  | { status: 'whitelisted' }
  | { status: 'unavailable' };

// In-memory dedup: every nick that ever reached the admin channel this process
// lifetime (case-insensitive — избегаем второй заявки "karasiq"/"Karasiq", хотя
// offline-UUID регистрозависим, вайтлистится ровно то написание, что в заявке).
// Свойство «переживает редеплой» здесь не нужно: после рестарта бота дубль
// просто снова попадёт к админам, а не в вайтлист.
const seen = new Map<string, { nick: string; decidedBy?: string }>();

/** Check the live whitelist over RCON; on RCON failure assume not whitelisted. */
async function isWhitelisted(nick: string): Promise<boolean> {
  try {
    const raw = stripColors(await sendCommand('whitelist list'));
    const idx = raw.indexOf(':');
    if (idx === -1) return false;
    return raw
      .slice(idx + 1)
      .split(',')
      .some((p) => p.trim().toLowerCase() === nick.toLowerCase());
  } catch {
    return false;
  }
}

function inviteButtons(nick: string, disabled = false) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`invite:approve:${nick}`)
      .setLabel('Одобрить')
      .setStyle(ButtonStyle.Success)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId(`invite:decline:${nick}`)
      .setLabel('Отклонить')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(disabled),
  );
}

function inviteEmbed(req: InviteRequest): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle('Заявка на вайтлист')
    .setColor(0x4dd4a4)
    .addFields({ name: 'Ник', value: `\`${req.nick}\``, inline: true })
    .setTimestamp(new Date());
  if (req.discord) {
    embed.addFields({ name: 'Discord', value: req.discord.slice(0, 64), inline: true });
  }
  return embed;
}

/**
 * Post an invite application to the admin channel with Approve/Decline buttons.
 * The nick is expected to be pre-validated against NICK_PATTERN by the caller.
 */
export async function submitInvite(
  client: Client,
  req: InviteRequest,
): Promise<SubmitResult> {
  const key = req.nick.toLowerCase();
  if (seen.has(key)) return { status: 'duplicate' };
  if (await isWhitelisted(req.nick)) return { status: 'whitelisted' };

  try {
    const channel = await client.channels.fetch(config.discord.inviteChannelId);
    if (!channel || !channel.isTextBased() || !('send' in channel)) {
      return { status: 'unavailable' };
    }
    await (channel as TextChannel).send({
      embeds: [inviteEmbed(req)],
      components: [inviteButtons(req.nick)],
    });
    seen.set(key, { nick: req.nick });
    return { status: 'ok' };
  } catch (err) {
    console.error('[invite] failed to post application:', err);
    return { status: 'unavailable' };
  }
}

function isAuthorized(member: unknown): boolean {
  if (!member || typeof member !== 'object') return false;
  const gm = member as GuildMember;
  const perms = gm.permissions;
  if (perms instanceof PermissionsBitField && perms.has(PermissionFlagsBits.Administrator)) {
    return true;
  }
  return gm.roles?.cache?.has(config.discord.modRoleId) ?? false;
}

/** Handle a click on the Approve/Decline buttons of an invite message. */
export async function handleInviteButton(interaction: ButtonInteraction): Promise<void> {
  const [, action, nick] = interaction.customId.split(':');
  if (!NICK_PATTERN.test(nick ?? '') || (action !== 'approve' && action !== 'decline')) {
    await interaction.reply({ content: '⚠️ Битая кнопка', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!isAuthorized(interaction.member)) {
    await interaction.reply({ content: '❌ Нет прав', flags: MessageFlags.Ephemeral });
    return;
  }

  // RCON round-trip может уйти за 3с окно ack — сначала подтверждаем интеракцию.
  await interaction.deferUpdate();

  let footer: string;
  if (action === 'approve') {
    try {
      const raw = await sendCommand(`${config.whitelistCmd} add ${nick}`);
      footer = `✅ Одобрено · ${interaction.user.username} · ${stripColors(raw).trim() || 'ok'}`;
      await sendAudit(
        interaction.client,
        `✅ <@${interaction.user.id}> одобрил заявку \`${nick}\` (whitelist add)`,
      );
    } catch {
      await interaction.followUp({
        content: '⚠️ RCON недоступен — заявка осталась открытой, попробуй позже',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  } else {
    footer = `❌ Отклонено · ${interaction.user.username}`;
    await sendAudit(interaction.client, `❌ <@${interaction.user.id}> отклонил заявку \`${nick}\``);
  }

  const entry = seen.get(nick.toLowerCase());
  if (entry) entry.decidedBy = interaction.user.id;

  const embed = EmbedBuilder.from(interaction.message.embeds[0])
    .setColor(action === 'approve' ? 0x34b88b : 0xc44a4a)
    .setFooter({ text: footer });
  await interaction.message.edit({
    embeds: [embed],
    components: [inviteButtons(nick, true)],
  });
}
