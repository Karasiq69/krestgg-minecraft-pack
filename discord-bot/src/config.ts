import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
}

export const config = {
  discord: {
    token: required('DISCORD_TOKEN'),
    guildId: required('DISCORD_GUILD_ID'),
    modRoleId: required('DISCORD_MOD_ROLE_ID'),
    auditChannelId: required('DISCORD_AUDIT_CHANNEL_ID'),
    // Канал для заявок с лендинга; по умолчанию — тот же аудит-канал.
    inviteChannelId: process.env.DISCORD_INVITE_CHANNEL_ID || required('DISCORD_AUDIT_CHANNEL_ID'),
  },
  rcon: {
    password: required('RCON_PASSWORD'),
  },
  // Вайтлист пишется файлом, а не командой `whitelist add` — она резолвит ник через
  // Mojang и пишет premium-UUID, с которым оффлайновый игрок не зайдёт (MC-063).
  // Каталог данных сервера монтируется в контейнер бота: -v /srv/krestmc-fabric/data:/mcdata
  whitelistFile: process.env.WHITELIST_FILE || '/mcdata/whitelist.json',
  // Опциональный shared secret между лендингом и ботом (:8080 торчит наружу).
  // Если задан — POST /invite без заголовка x-invite-token отбивается.
  inviteToken: process.env.INVITE_TOKEN || null,
};

export const HOST = 'krestmc';
export const PUBLIC_ADDRESS = 'mc.krest.gg';
export const RCON_PORT = 25575;
export const SLP_PORT = 25565;
export const PRESENCE_INTERVAL_MS = 30_000;
export const SLP_CACHE_TTL_MS = 10_000;
export const RCON_RECONNECT_BASE_MS = 1_000;
export const RCON_RECONNECT_MAX_MS = 30_000;
