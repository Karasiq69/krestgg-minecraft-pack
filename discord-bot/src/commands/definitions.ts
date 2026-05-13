import { SlashCommandBuilder } from 'discord.js';

export const commands = [
  new SlashCommandBuilder()
    .setName('mc')
    .setDescription('Команды для Minecraft-сервера')
    .addSubcommand((sc) =>
      sc.setName('status').setDescription('Статус MC-сервера'),
    )
    .addSubcommand((sc) =>
      sc.setName('players').setDescription('Список игроков онлайн'),
    )
    .addSubcommandGroup((sg) =>
      sg
        .setName('whitelist')
        .setDescription('Управление whitelist')
        .addSubcommand((sc) =>
          sc
            .setName('list')
            .setDescription('Показать whitelist'),
        )
        .addSubcommand((sc) =>
          sc
            .setName('add')
            .setDescription('Добавить ник в whitelist')
            .addStringOption((o) =>
              o.setName('name').setDescription('Minecraft ник').setRequired(true),
            ),
        )
        .addSubcommand((sc) =>
          sc
            .setName('remove')
            .setDescription('Убрать ник из whitelist')
            .addStringOption((o) =>
              o.setName('name').setDescription('Minecraft ник').setRequired(true),
            ),
        ),
    )
    .toJSON(),
];
