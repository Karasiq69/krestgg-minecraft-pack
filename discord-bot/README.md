# KrestGG Minecraft Discord Bot

Discord-бот для MC-сервера сообщества Кресты. Показывает онлайн в presence, отдаёт slash-команды `/mc status`, `/mc players`, `/mc whitelist`.

## Архитектура

Деплоится docker-сервисом рядом с `krestmc` в `/srv/krestmc/docker-compose.yaml`. Ходит на RCON через docker DNS `krestmc:25575` (порт не публикуется). SLP — тоже внутри сети.

## Env

Скопировать `.env.example` → `.env` рядом с `/srv/krestmc/docker-compose.yaml`:

```
DISCORD_TOKEN=<bot token>
DISCORD_GUILD_ID=<guild id>
DISCORD_MOD_ROLE_ID=<role id who can whitelist>
DISCORD_AUDIT_CHANNEL_ID=<channel id for audit log>
RCON_PASSWORD=<same as in server.properties>
```

## Локально

```bash
cd discord-bot
npm install
cp .env.example .env  # заполнить
npm start
```

## Build образа

```bash
docker build -t krestgg-mcbot:latest discord-bot/
```
