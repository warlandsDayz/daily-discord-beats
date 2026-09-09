// Embeds partagés du bot RSA — un seul endroit pour garder un style propre.
import { EmbedBuilder } from "discord.js";

export const RSA_RED = 0xc1121f;
export const RSA_DARK = 0x1a1a1a;
export const RSA_GREEN = 0x3fa34d;

const SITE = (process.env.RSA_API_URL || "https://rsa.baccuarnaud.dev").replace(/\/$/, "");
export const LOGO_URL = `${SITE}/favicon.png`;

function base(color) {
  return new EmbedBuilder()
    .setColor(color)
    .setThumbnail(LOGO_URL)
    .setFooter({ text: "RSA • Racailles Sans Avenir", iconURL: LOGO_URL })
    .setTimestamp(new Date());
}

export function radioEmbed(frequency, { title, note } = {}) {
  const freq = Number(frequency).toFixed(1);
  return base(RSA_RED)
    .setAuthor({ name: "Réseau radio RSA" })
    .setTitle(title ?? "📻 Fréquence en cours")
    .setDescription(`\`\`\`ansi\n\u001b[1;31m${freq}\u001b[0m\n\`\`\``)
    .addFields(
      { name: "Fréquence", value: `**${freq}**`, inline: true },
      { name: "Plage", value: "30.0 – 512.0", inline: true },
      ...(note ? [{ name: "Info", value: note }] : []),
    );
}

export function newRadioEmbed(frequency, { actor, posted } = {}) {
  const embed = radioEmbed(frequency, { title: "🔴 Nouvelle fréquence RSA" }).setDescription(
    `La fréquence a été régénérée. Passez tous sur **${Number(frequency).toFixed(1)}**.\n\n` +
      `\`\`\`ansi\n\u001b[1;31m${Number(frequency).toFixed(1)}\u001b[0m\n\`\`\``,
  );
  if (actor) embed.addFields({ name: "Demandée par", value: actor, inline: true });
  if (posted === false) {
    embed.addFields({ name: "⚠️ Attention", value: "Publication dans le salon impossible." });
  }
  return embed;
}

export function emptyRadioEmbed() {
  return base(RSA_DARK)
    .setAuthor({ name: "Réseau radio RSA" })
    .setTitle("📻 Aucune fréquence")
    .setDescription("Aucune fréquence n'a encore été enregistrée. Lance `/radio` pour en générer une.");
}

export function welcomeEmbed(member) {
  return base(RSA_RED)
    .setAuthor({ name: "Nouvelle recrue" })
    .setTitle(`Bienvenue chez les Racailles Sans Avenir`)
    .setDescription(
      `${member} vient de rejoindre le crew.\nRang de départ : **Recrue**. Fais tes preuves.`,
    )
    .setImage(null)
    .addFields(
      { name: "📻 Radio", value: "Tape `/radio-actuelle` pour la fréquence du jour.", inline: false },
      { name: "🔗 Espace membre", value: `[Se connecter](${SITE}/auth)`, inline: false },
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }));
}

export function errorEmbed(message) {
  return base(RSA_DARK).setTitle("❌ Erreur").setDescription(message);
}

export function infoEmbed(title, description) {
  return base(RSA_DARK).setTitle(title).setDescription(description);
}
