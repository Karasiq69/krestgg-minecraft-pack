import { ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, PermissionsBitField } from 'discord.js';
import { config } from '../config.js';
import { sendCommand } from '../rcon.js';
import { sendAudit } from '../audit.js';

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
    await interaction.reply({ content: '❌ Нет прав', ephemeral: true });
    return;
  }

  const sub = interaction.options.getSubcommand();

  if (sub === 'list') {
    try {
      const raw = await sendCommand('whitelist list');
      await interaction.reply({ content: `\`\`\`\n${raw}\n\`\`\``, ephemeral: true });
    } catch {
      await interaction.reply({ content: '⚠️ RCON временно недоступен', ephemeral: true });
    }
    return;
  }

  const name = interaction.options.getString('name', true);
  if (!NICK_PATTERN.test(name)) {
    await interaction.reply({ content: '❌ Невалидный ник', ephemeral: true });
    return;
  }

  const cmd = sub === 'add' ? `easywhitelist add ${name}` : `easywhitelist remove ${name}`;
  try {
    const raw = await sendCommand(cmd);
    await interaction.reply({ content: `\`${raw}\``, ephemeral: true });

    const emoji = sub === 'add' ? '✅' : '❌';
    const verb = sub === 'add' ? 'добавил' : 'удалил';
    const prep = sub === 'add' ? 'в whitelist' : 'из whitelist';
    await sendAudit(
      interaction.client,
      `${emoji} <@${interaction.user.id}> ${verb} \`${name}\` ${prep}`,
    );
  } catch {
    await interaction.reply({ content: '⚠️ RCON временно недоступен', ephemeral: true });
  }
}
