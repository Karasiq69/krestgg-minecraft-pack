import { ChatInputCommandInteraction } from 'discord.js';
import { sendCommand } from '../rcon.js';

function parsePlayerList(raw: string): { count: number; players: string[] } {
  // The server runs EssentialsX, which overrides `/list`. Its RCON output carries
  // Minecraft section-sign (§) colour codes and groups players by permission group
  // on separate lines, e.g.:
  //   "§6There are §c13§6 out of maximum §c40§6 players online.\n§6default§r: a, b, c"
  // The vanilla format ("There are 2 of a max of 30 players online: Notch, Herobrine")
  // is still handled. Strip colour codes (§-codes and any ANSI escapes) before parsing.
  const clean = raw
    .replace(/\[[0-9;]*m/g, '')
    .replace(/§./g, '');

  // Count line: matches both "of a max of" (vanilla) and "out of maximum" (EssentialsX).
  const countMatch = clean.match(/There are (\d+)\D+?(\d+) players online/i);
  const count = countMatch ? parseInt(countMatch[1], 10) : 0;

  // Names follow a colon: inline after "online:" (vanilla) or on per-group lines
  // like "default: a, b" (EssentialsX). The bare count line has no colon and is
  // skipped. Minecraft usernames never contain ':', so this split is safe.
  const players: string[] = [];
  for (const line of clean.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    for (const part of line.slice(idx + 1).split(',')) {
      const name = part.trim();
      if (name && !players.includes(name)) players.push(name);
    }
  }
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
