// Enregistre les commandes du bot sur le serveur Discord.
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
    .setDescription("Génère et annonce une nouvelle fréquence radio RSA")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("radio-actuelle")
    .setDescription("Affiche la fréquence radio RSA en cours")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("rsa")
    .setDescription("Infos du crew et liste des commandes")
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

await rest.put(
  Routes.applicationGuildCommands(DISCORD_APPLICATION_ID, DISCORD_GUILD_ID),
  { body: commands },
);

console.log("Commandes installées sur le serveur.");
