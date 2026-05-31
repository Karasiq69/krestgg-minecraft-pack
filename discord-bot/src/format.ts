/**
 * Strip colour/formatting codes from RCON output before showing it in Discord.
 * Covers Minecraft section-sign (§) codes (used by Paper/EssentialsX) and ANSI
 * escapes (in case some tooling pre-translates them). MC names never contain '§'
 * or ESC, so this is safe to apply to player/whitelist listings.
 */
export function stripColors(raw: string): string {
  return raw
    .replace(/\[[0-9;]*m/g, '')
    .replace(/§./g, '');
}
