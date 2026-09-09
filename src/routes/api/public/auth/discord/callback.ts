import { createFileRoute } from "@tanstack/react-router";

function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export const Route = createFileRoute("/api/public/auth/discord/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const expectedState = readCookie(request, "rsa_oauth_state");

        const fail = (reason: string) =>
          new Response(null, {
            status: 302,
            headers: { Location: `/auth?erreur=${encodeURIComponent(reason)}` },
          });

        if (!code) return fail("Connexion annulée");
        if (!state || !expectedState || state !== expectedState) {
          return fail("Session de connexion expirée, réessaie");
        }

        try {
          const { exchangeCode, fetchDiscordUser, signInDiscordUser, callbackUrl } =
            await import("@/lib/discord-auth.server");
          const accessToken = await exchangeCode(code, callbackUrl(request));
          const discordUser = await fetchDiscordUser(accessToken);
          const session = await signInDiscordUser(discordUser);

          const fragment = new URLSearchParams({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
          return new Response(null, {
            status: 302,
            headers: {
              Location: `/auth/session#${fragment.toString()}`,
              "Set-Cookie": "rsa_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0",
            },
          });
        } catch (error) {
          console.error("[auth] discord callback failed", error);
          return fail("Connexion impossible pour le moment");
        }
      },
    },
  },
});
