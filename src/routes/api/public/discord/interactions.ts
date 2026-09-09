import { createFileRoute } from "@tanstack/react-router";

const PONG = 1;
const APPLICATION_COMMAND = 2;
const CHANNEL_MESSAGE_WITH_SOURCE = 4;
const EPHEMERAL = 64;

type Interaction = {
  type: number;
  data?: { name?: string };
  member?: { user?: { id?: string; username?: string } };
  user?: { id?: string; username?: string };
};

export const Route = createFileRoute("/api/public/discord/interactions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        const { verifyDiscordSignature } = await import("@/lib/discord.server");
        const valid = await verifyDiscordSignature(
          request.headers.get("x-signature-ed25519"),
          request.headers.get("x-signature-timestamp"),
          body,
        );
        if (!valid) return new Response("invalid request signature", { status: 401 });

        const interaction = JSON.parse(body) as Interaction;
        if (interaction.type === 1) return Response.json({ type: PONG });

        if (interaction.type !== APPLICATION_COMMAND) {
          return Response.json({ type: PONG });
        }

        const user = interaction.member?.user ?? interaction.user;
        const actor = user ? `${user.username ?? "?"} (${user.id ?? "?"})` : "inconnu";
        const name = interaction.data?.name;

        const { generateAndAnnounce, latestFrequency, logBot } = await import(
          "@/lib/radio.server"
        );

        const reply = (content: string, ephemeral = true) =>
          Response.json({
            type: CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content, ...(ephemeral ? { flags: EPHEMERAL } : {}) },
          });

        try {
          if (name === "radio-actuelle") {
            const current = await latestFrequency();
            return reply(
              current
                ? `📻 Fréquence en cours : \`${Number(current.frequency).toFixed(1)}\``
                : "Aucune fréquence enregistrée pour le moment.",
            );
          }

          if (name === "radio") {
            const result = await generateAndAnnounce({ source: "commande", actor });
            return reply(
              `Nouvelle fréquence générée : \`${result.frequency.toFixed(1)}\`${
                result.posted ? "" : " (publication dans le salon impossible)"
              }`,
            );
          }

          return reply("Commande inconnue.");
        } catch (error) {
          await logBot("commande", `Échec de /${name} : ${String(error)}`, actor, "error");
          return reply("Une erreur est survenue, réessaie dans un instant.");
        }
      },
    },
  },
});
