import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/auth/discord/login")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clientId = process.env["DISCORD_APPLICATION_ID"];
        if (!clientId) {
          return new Response("Connexion Discord non configurée.", { status: 500 });
        }
        const { callbackUrl } = await import("@/lib/discord-auth.server");
        const state = crypto.randomUUID();
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: callbackUrl(request),
          response_type: "code",
          scope: "identify",
          state,
          prompt: "consent",
        });
        return new Response(null, {
          status: 302,
          headers: {
            Location: `https://discord.com/oauth2/authorize?${params.toString()}`,
            "Set-Cookie": `rsa_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=600`,
          },
        });
      },
    },
  },
});
