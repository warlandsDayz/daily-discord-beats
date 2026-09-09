import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/cron/daily-radio")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = await authenticateCronRequest(request);
        if (unauthorized) return unauthorized;

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
