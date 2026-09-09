import { createFileRoute } from "@tanstack/react-router";

/**
 * Endpoint utilisé par le bot auto-hébergé (VPS).
 * GET  -> fréquence en cours
 * POST -> génère une nouvelle fréquence et l'annonce sur Discord
 * Protégé par le header `x-rsa-bot-secret` (valeur = RSA_CRON_SECRET).
 */
async function authorize(request: Request): Promise<Response | null> {
  const expected = process.env["RSA_CRON_SECRET"];
  const provided = request.headers.get("x-rsa-bot-secret");
  if (!expected) return new Response("Server configuration error", { status: 500 });
  if (!provided || provided.length !== expected.length) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { timingSafeEqual } = await import("node:crypto");
  if (!timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

export const Route = createFileRoute("/api/public/bot/radio")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const denied = await authorize(request);
        if (denied) return denied;
        const { latestFrequency } = await import("@/lib/radio.server");
        const current = await latestFrequency();
        return Response.json({
          ok: true,
          frequency: current ? Number(current.frequency) : null,
          for_date: current?.for_date ?? null,
        });
      },
      POST: async ({ request }) => {
        const denied = await authorize(request);
        if (denied) return denied;
        let actor: string | null = null;
        try {
          const body = (await request.json()) as { actor?: string };
          actor = body?.actor ?? null;
        } catch {
          actor = null;
        }
        const { generateAndAnnounce } = await import("@/lib/radio.server");
        try {
          const result = await generateAndAnnounce({ source: "commande", actor });
          return Response.json({ ok: true, ...result });
        } catch (error) {
          return Response.json({ ok: false, error: String(error) }, { status: 500 });
        }
      },
    },
  },
});
