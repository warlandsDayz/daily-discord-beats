import { createFileRoute } from "@tanstack/react-router";

async function checkSecret(request: Request) {
  const expected = process.env["RSA_CRON_SECRET"];
  const provided =
    request.headers.get("x-rsa-cron-secret") ?? request.headers.get("x-rsa-bot-secret");
  if (!expected) return false;
  if (!provided || provided.length !== expected.length) return false;
  const { timingSafeEqual } = await import("node:crypto");
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export const Route = createFileRoute("/api/public/arma/status")({
  server: {
    handlers: {
      // Lecture publique du dernier relevé (site + bot).
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("arma_status")
          .select("*")
          .order("checked_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return Response.json({ ok: true, status: data });
      },
      // Relevé forcé (cron ou bot), protégé par le secret partagé.
      POST: async ({ request }) => {
        if (!(await checkSecret(request))) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { pollArmaStatus } = await import("@/lib/arma.server");
        try {
          const result = await pollArmaStatus();
          return Response.json({ ok: true, ...result });
        } catch (error) {
          return Response.json({ ok: false, error: String(error) }, { status: 500 });
        }
      },
    },
  },
});
