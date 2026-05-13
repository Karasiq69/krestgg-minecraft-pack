import {
  Client,
  IntentsBitField,
  ActivityType,
  Events,
} from 'discord.js';
import { config, PRESENCE_INTERVAL_MS } from './config.js';
import { pingServer } from './slp.js';
import { deployCommands } from './commands/deploy.js';
import { handleStatus } from './commands/status.js';
import { handlePlayers } from './commands/players.js';
import { handleWhitelist } from './commands/whitelist.js';

let client: Client | null = null;
let presenceTimer: NodeJS.Timeout | null = null;

async function updatePresence(): Promise<void> {
  if (!client?.user) return;
  const r = await pingServer();
  const text = r ? `${r.online}/${r.max}` : 'Сервер офлайн';
  client.user.setActivity(text, { type: ActivityType.Custom });
}

export async function startBot(): Promise<void> {
  client = new Client({ intents: [IntentsBitField.Flags.Guilds] });

  client.once(Events.ClientReady, async (c) => {
    console.log(`[bot] logged in as ${c.user.tag}`);
    try {
      await deployCommands(c);
    } catch (err) {
      console.error('[bot] command deploy failed:', err);
    }
    await updatePresence();
    presenceTimer = setInterval(() => {
      updatePresence().catch((err) => console.warn('[bot] presence update failed:', err));
    }, PRESENCE_INTERVAL_MS);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'mc') return;

    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand();

    try {
      if (group === 'whitelist') {
        await handleWhitelist(interaction);
      } else if (sub === 'status') {
        await handleStatus(interaction);
      } else if (sub === 'players') {
        await handlePlayers(interaction);
      }
    } catch (err) {
      console.error('[bot] handler error:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '⚠️ Внутренняя ошибка', ephemeral: true }).catch(() => {});
      }
    }
  });

  client.on(Events.Error, (err) => console.error('[bot] client error:', err));

  await client.login(config.discord.token);
}

export async function stopBot(): Promise<void> {
  if (presenceTimer) {
    clearInterval(presenceTimer);
    presenceTimer = null;
  }
  if (client) {
    await client.destroy();
    client = null;
  }
}
