// Server-only logic for the daily radio frequency.
import { buildRadioEmbed, deleteChannelMessage, postChannelEmbed } from "./discord.server";

export type RadioRow = {
  id: string;
  frequency: number;
  for_date: string;
  source: string;
  created_by: string | null;
  created_at: string;
  discord_message_id?: string | null;
  discord_channel_id?: string | null;
};

/** Salon où sont publiées les fréquences radio. */
export async function radioChannelId(): Promise<string | null> {
  const fromEnv = process.env["DISCORD_RADIO_CHANNEL_ID"];
  if (fromEnv) return fromEnv;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("bot_settings")
    .select("channel_id")
    .eq("id", true)
    .maybeSingle();
  return data?.channel_id ?? process.env["DISCORD_CHANNEL_ID"] ?? null;
}

export function randomFrequency(exclude?: number | null): number {
  let value = 0;
  for (let i = 0; i < 20; i++) {
    value = Math.round((30 + Math.random() * (512 - 30)) * 10) / 10;
    if (value !== exclude) break;
  }
  return value;
}

export function parisDate(now = new Date()): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export async function logBot(
  action: string,
  message: string,
  actor: string | null = null,
  level: "info" | "error" = "info",
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("bot_logs").insert({ action, message, actor, level });
}

export async function latestFrequency(): Promise<RadioRow | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("radio_frequencies")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as RadioRow | null) ?? null;
}

/**
 * Creates a new frequency, stores it and announces it on Discord.
 * `force` = triggered manually (slash command or chef panel).
 */
export async function generateAndAnnounce(opts: {
  source: "cron" | "commande" | "panel";
  actor?: string | null;
  skipIfExistsToday?: boolean;
}): Promise<{ created: boolean; frequency: number; posted: boolean }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const today = parisDate();
  const previous = await latestFrequency();

  if (opts.skipIfExistsToday && previous && previous.for_date === today) {
    return { created: false, frequency: Number(previous.frequency), posted: false };
  }

  const frequency = randomFrequency(previous ? Number(previous.frequency) : null);
  const { data: inserted, error } = await supabaseAdmin
    .from("radio_frequencies")
    .insert({
      frequency,
      for_date: today,
      source: opts.source,
      created_by: opts.actor ?? null,
    })
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);

  let posted = false;
  try {
    const channelId = await radioChannelId();
    if (channelId) {
      // On efface l'annonce précédente pour ne garder qu'un seul message radio.
      if (previous?.discord_message_id) {
        await deleteChannelMessage(
          previous.discord_channel_id ?? channelId,
          previous.discord_message_id,
        ).catch(() => {});
      }
      const message = (await postChannelEmbed(
        channelId,
        buildRadioEmbed(frequency, {
          title:
            opts.source === "cron"
              ? "📻 Fréquence RSA du jour"
              : "🔴 Nouvelle fréquence RSA",
          source:
            opts.source === "cron"
              ? "Génération quotidienne"
              : opts.source === "panel"
                ? "Panel chef"
                : "Commande Discord",
          actor: opts.actor ?? null,
        }),
      );
      posted = true;
    }
    await logBot(
      "radio",
      `Fréquence ${frequency.toFixed(1)} (${opts.source})${posted ? " publiée sur Discord" : " — aucun salon configuré"}`,
      opts.actor ?? null,
      posted ? "info" : "error",
    );
  } catch (err) {
    await logBot(
      "radio",
      `Fréquence ${frequency.toFixed(1)} enregistrée mais publication Discord échouée : ${String(err)}`,
      opts.actor ?? null,
      "error",
    );
  }

  return { created: true, frequency, posted };
}
