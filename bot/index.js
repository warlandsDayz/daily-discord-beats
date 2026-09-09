// Bot Discord RSA — connecté en permanence, parle au site RSA.
import "dotenv/config";
import { Client, Events, GatewayIntentBits, MessageFlags, Partials } from "discord.js";
import {
  emptyRadioEmbed,
  errorEmbed,
  infoEmbed,
  newRadioEmbed,
  radioEmbed,
  welcomeEmbed,
} from "./embeds.js";

const {
  DISCORD_BOT_TOKEN,
  RSA_API_URL = "https://rsa.baccuarnaud.dev",
  RSA_BOT_SECRET,
  DISCORD_WELCOME_CHANNEL_ID,
} = process.env;

if (!DISCORD_BOT_TOKEN || !RSA_BOT_SECRET) {
  console.error("Il manque DISCORD_BOT_TOKEN ou RSA_BOT_SECRET dans .env");
  process.exit(1);
}

const SITE = RSA_API_URL.replace(/\/$/, "");

const api = async (method, body) => {
  const res = await fetch(`${SITE}/api/public/bot/radio`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-rsa-bot-secret": RSA_BOT_SECRET,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`API ${res.status}: ${text}`);
  return JSON.parse(text);
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.GuildMember],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Bot connecté en tant que ${c.user.tag}`);
  c.user.setPresence({
    activities: [{ name: "les ondes RSA 📻", type: 3 }],
    status: "online",
  });
});

// --- Bienvenue ---------------------------------------------------------------
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channel =
      (DISCORD_WELCOME_CHANNEL_ID &&
        (await member.guild.channels.fetch(DISCORD_WELCOME_CHANNEL_ID).catch(() => null))) ||
      member.guild.systemChannel;
    if (!channel?.isTextBased()) return;
    await channel.send({ content: `${member}`, embeds: [welcomeEmbed(member)] });
  } catch (error) {
    console.error("[welcome]", error);
  }
});

// --- Commandes ---------------------------------------------------------------
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const actor = `${interaction.user.username} (${interaction.user.id})`;

  try {
    if (interaction.commandName === "radio-actuelle") {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const data = await api("GET");
      await interaction.editReply({
        embeds: [
          data.frequency
            ? radioEmbed(data.frequency, {
                note: data.for_date ? `Générée le ${data.for_date}` : undefined,
              })
            : emptyRadioEmbed(),
        ],
      });
      return;
    }

    if (interaction.commandName === "radio") {
      await interaction.deferReply();
      const data = await api("POST", { actor });
      await interaction.editReply({
        embeds: [
          newRadioEmbed(data.frequency, { actor: `<@${interaction.user.id}>`, posted: data.posted }),
        ],
      });
      return;
    }

    if (interaction.commandName === "rsa") {
      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        embeds: [
          infoEmbed(
            "🖤 Racailles Sans Avenir",
            [
              "**Commandes disponibles**",
              "`/radio` — génère et annonce une nouvelle fréquence",
              "`/radio-actuelle` — affiche la fréquence en cours",
              "`/rsa` — ce message",
              "",
              `**Site du crew** : ${SITE}`,
              `**Espace membre** : ${SITE}/auth`,
            ].join("\n"),
          ),
        ],
      });
      return;
    }
  } catch (error) {
    console.error(error);
    const payload = {
      embeds: [errorEmbed("Une erreur est survenue, réessaie dans un instant.")],
      flags: MessageFlags.Ephemeral,
    };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: payload.embeds }).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.login(DISCORD_BOT_TOKEN);
