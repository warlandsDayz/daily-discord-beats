// Bot Discord RSA - se connecte a Discord en permanence et parle au site RSA.
import "dotenv/config";
import { Client, GatewayIntentBits, MessageFlags } from "discord.js";

const {
  DISCORD_BOT_TOKEN,
  RSA_API_URL = "https://rsa.baccuarnaud.dev",
  RSA_BOT_SECRET,
} = process.env;

if (!DISCORD_BOT_TOKEN || !RSA_BOT_SECRET) {
  console.error("Il manque DISCORD_BOT_TOKEN ou RSA_BOT_SECRET dans .env");
  process.exit(1);
}

const api = async (method, body) => {
  const res = await fetch(`${RSA_API_URL.replace(/\/$/, "")}/api/public/bot/radio`, {
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

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("clientReady", (c) => {
  console.log(`Bot connecte en tant que ${c.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const actor = `${interaction.user.username} (${interaction.user.id})`;

  try {
    if (interaction.commandName === "radio-actuelle") {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const data = await api("GET");
      await interaction.editReply(
        data.frequency
          ? `📻 Frequence en cours : \`${Number(data.frequency).toFixed(1)}\``
          : "Aucune frequence enregistree pour le moment.",
      );
      return;
    }

    if (interaction.commandName === "radio") {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const data = await api("POST", { actor });
      await interaction.editReply(
        `Nouvelle frequence generee : \`${Number(data.frequency).toFixed(1)}\`${
          data.posted ? "" : " (publication dans le salon impossible)"
        }`,
      );
      return;
    }
  } catch (error) {
    console.error(error);
    const message = "Une erreur est survenue, reessaie dans un instant.";
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(message).catch(() => {});
    } else {
      await interaction
        .reply({ content: message, flags: MessageFlags.Ephemeral })
        .catch(() => {});
    }
  }
});

client.login(DISCORD_BOT_TOKEN);
