// Server-only logic for the daily radio frequencies (farmeur + bandit).
import { buildRadioEmbed, deleteChannelMessage, postChannelEmbed } from "./discord.server";

export type RadioKind = "farmeur" | "bandit";

export const RADIO_KINDS: RadioKind[] = ["farmeur", "bandit"];

export const RADIO_LABELS: Record<RadioKind, string> = {
  farmeur: "Farmeurs",
  bandit: "Bandits",
};

export type RadioRow = {
  id: string;
  frequency: number;
  for_date: string;
  source: string;
  kind: RadioKind;
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

export function randomFrequency(exclude: (number | null | undefined)[] = []): number {
  const blocked = exclude.filter((v): v is number => typeof v === "number");
  let value = 0;
  for (let i = 0; i < 30; i++) {
    value = Math.round((30 + Math.random() * (512 - 30)) * 10) / 10;
    if (!blocked.includes(value)) break;
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

/** Dernière fréquence enregistrée, éventuellement filtrée par type. */
export async function latestFrequency(kind?: RadioKind): Promise<RadioRow | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let query = supabaseAdmin
    .from("radio_frequencies")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);
  if (kind) query = query.eq("kind", kind);
  const { data } = await query.maybeSingle();
  return (data as RadioRow | null) ?? null;
}

/** Les deux fréquences en cours. */
export async function currentFrequencies(): Promise<Record<RadioKind, RadioRow | null>> {
  const [farmeur, bandit] = await Promise.all([
    latestFrequency("farmeur"),
    latestFrequency("bandit"),
  ]);
  return { farmeur, bandit };
}

/**
 * Génère les deux fréquences du jour (farmeurs + bandits), les enregistre
 * et publie une annonce unique sur Discord (l'ancienne est supprimée).
 */
export async function generateAndAnnounce(opts: {
  source: "cron" | "commande" | "panel";
  actor?: string | null;
  skipIfExistsToday?: boolean;
}): Promise<{
  created: boolean;
  posted: boolean;
  frequencies: Record<RadioKind, number>;
  /** Compat : fréquence farmeur. */
  frequency: number;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const today = parisDate();
  const previous = await currentFrequencies();

  const alreadyToday =
    previous.farmeur?.for_date === today && previous.bandit?.for_date === today;
  if (opts.skipIfExistsToday && alreadyToday) {
    return {
      created: false,
      posted: false,
      frequency: Number(previous.farmeur!.frequency),
      frequencies: {
        farmeur: Number(previous.farmeur!.frequency),
        bandit: Number(previous.bandit!.frequency),
      },
    };
  }

  const farmeurFreq = randomFrequency([previous.farmeur?.frequency, previous.bandit?.frequency]);
  const banditFreq = randomFrequency([
    previous.farmeur?.frequency,
    previous.bandit?.frequency,
    farmeurFreq,
  ]);
  const frequencies: Record<RadioKind, number> = { farmeur: farmeurFreq, bandit: banditFreq };

  const { data: inserted, error } = await supabaseAdmin
    .from("radio_frequencies")
    .insert(
      RADIO_KINDS.map((kind) => ({
        frequency: frequencies[kind],
        for_date: today,
        source: opts.source,
        kind,
        created_by: opts.actor ?? null,
      })),
    )
    .select("id, kind");
  if (error) throw new Error(error.message);

  let posted = false;
  try {
    const channelId = await radioChannelId();
    if (channelId) {
      // On efface les annonces précédentes pour ne garder qu'un seul message radio.
      const seen = new Set<string>();
      for (const row of [previous.farmeur, previous.bandit]) {
        if (row?.discord_message_id && !seen.has(row.discord_message_id)) {
          seen.add(row.discord_message_id);
          await deleteChannelMessage(
            row.discord_channel_id ?? channelId,
            row.discord_message_id,
          ).catch(() => {});
        }
      }

      const message = (await postChannelEmbed(
        channelId,
        buildRadioEmbed(frequencies, {
          title:
            opts.source === "cron" ? "📻 Fréquences RSA du jour" : "🔴 Nouvelles fréquences RSA",
          source:
            opts.source === "cron"
              ? "Génération quotidienne"
              : opts.source === "panel"
                ? "Panel chef"
                : "Commande Discord",
          actor: opts.actor ?? null,
        }),
      )) as { id?: string } | null;
      posted = true;

      const ids = (inserted ?? []).map((row) => row.id);
      if (ids.length > 0 && message?.id) {
        await supabaseAdmin
          .from("radio_frequencies")
          .update({ discord_message_id: message.id, discord_channel_id: channelId })
          .in("id", ids);
      }
    }
    await logBot(
      "radio",
      `Fréquences farmeurs ${farmeurFreq.toFixed(1)} / bandits ${banditFreq.toFixed(1)} (${opts.source})${
        posted ? " publiées sur Discord" : " — aucun salon configuré"
      }`,
      opts.actor ?? null,
      posted ? "info" : "error",
    );
  } catch (err) {
    await logBot(
      "radio",
      `Fréquences enregistrées mais publication Discord échouée : ${String(err)}`,
      opts.actor ?? null,
      "error",
    );
  }

  return { created: true, posted, frequency: farmeurFreq, frequencies };
}
