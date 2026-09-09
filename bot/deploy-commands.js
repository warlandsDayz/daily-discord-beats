// Enregistre les commandes /radio et /radio-actuelle sur le serveur Discord.
// A lancer une fois : npm run deploy
import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const { DISCORD_BOT_TOKEN, DISCORD_APPLICATION_ID, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_APPLICATION_ID || !DISCORD_GUILD_ID) {
  console.error("Il manque DISCORD_BOT_TOKEN, DISCORD_APPLICATION_ID ou DISCORD_GUILD_ID dans .env");
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName("radio")
    .setDescription("Genere une nouvelle frequence radio RSA")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("radio-actuelle")
    .setDescription("Affiche la frequence radio RSA en cours")
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

await rest.put(
  Routes.applicationGuildCommands(DISCORD_APPLICATION_ID, DISCORD_GUILD_ID),
  { body: commands },
);

console.log("Commandes installees sur le serveur.");
