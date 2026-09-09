import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/cron/daily-radio")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["RSA_CRON_SECRET"];
        const provided = request.headers.get("x-rsa-cron-secret");
        if (!expected) return new Response("Server configuration error", { status: 500 });
        if (!provided || provided.length !== expected.length) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { timingSafeEqual } = await import("node:crypto");
        if (!timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
          return new Response("Unauthorized", { status: 401 });
        }


        const { generateAndAnnounce } = await import("@/lib/radio.server");
        try {
          const result = await generateAndAnnounce({
            source: "cron",
            actor: "cron",
            skipIfExistsToday: true,
          });
          return Response.json({ ok: true, ...result });
        } catch (error) {
          console.error("[cron] daily radio failed", error);
          return Response.json({ ok: false, error: String(error) }, { status: 500 });
        }
      },
    },
  },
});
