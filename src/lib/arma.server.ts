// Server-only logic for the Arma 3 server tracking (Steam Web API).
import { postChannelEmbed } from "./discord.server";
import { logBot } from "./radio.server";

export const ARMA_ADDR = process.env["ARMA_SERVER_ADDR"] ?? "51.254.243.130:2302";

export type ArmaStatus = {
  online: boolean;
  players: number;
  max_players: number;
  server_name: string | null;
  map: string | null;
  addr: string;
};

type SteamServer = {
  addr?: string;
  name?: string;
  players?: number;
  max_players?: number;
  map?: string;
  gameport?: number;
};

/** Interroge la liste des serveurs Steam pour l'adresse suivie. */
export async function fetchArmaStatus(): Promise<ArmaStatus> {
  const key = process.env["STEAM_API_KEY"];
  if (!key) throw new Error("STEAM_API_KEY manquant");

  const [ip, portRaw] = ARMA_ADDR.split(":");
  const port = Number(portRaw ?? 2302);

  const url =
    `https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${encodeURIComponent(key)}` +
    `&limit=50&filter=${encodeURIComponent(`\\appid\\107410\\gameaddr\\${ip}`)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Steam ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as { response?: { servers?: SteamServer[] } };
  const servers = json.response?.servers ?? [];

  const match =
    servers.find((s) => s.gameport === port || s.addr === `${ip}:${port}`) ?? servers[0];

  if (!match) {
    return { online: false, players: 0, max_players: 0, server_name: null, map: null, addr: ARMA_ADDR };
  }

  return {
    online: true,
    players: match.players ?? 0,
    max_players: match.max_players ?? 0,
    server_name: match.name ?? null,
    map: match.map ?? null,
    addr: ARMA_ADDR,
  };
}

export async function lastStatus() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("arma_status")
    .select("*")
    .order("checked_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

const GREEN = 0x3fb950;
const RED = 0xc1121f;
const SITE_URL = "https://rsa.baccuarnaud.dev";

function statusEmbed(status: ArmaStatus, event: "up" | "down") {
  const online = event === "up";
  return {
    author: { name: "Serveur Arma 3 · RSA" },
    title: online ? "🟢 Le serveur est de retour en ligne" : "🔴 Le serveur est hors ligne",
    description: online
      ? "Vous pouvez rejoindre, la partie tourne."
      : "Plus de réponse du serveur. Redémarrage probable en cours.",
    color: online ? GREEN : RED,
    fields: [
      { name: "Serveur", value: status.server_name ?? ARMA_ADDR, inline: false },
      { name: "Joueurs", value: `${status.players}/${status.max_players || "?"}`, inline: true },
      ...(status.map ? [{ name: "Carte", value: status.map, inline: true }] : []),
      { name: "Adresse", value: `\`${status.addr}\``, inline: true },
    ],
    footer: { text: "RSA • Racailles Sans Avenir", icon_url: `${SITE_URL}/favicon.png` },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Relève l'état du serveur, l'enregistre si quelque chose a changé
 * et prévient sur Discord quand il tombe ou revient.
 */
export async function pollArmaStatus(): Promise<{
  status: ArmaStatus;
  changed: boolean;
  announced: boolean;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let status: ArmaStatus;
  try {
    status = await fetchArmaStatus();
  } catch (error) {
    await logBot("arma", `Relevé serveur Arma impossible : ${String(error)}`, "cron", "error");
    throw error;
  }

  const previous = await lastStatus();
  const stateChanged = !previous || previous.online !== status.online;
  const playersChanged = previous ? previous.players !== status.players : true;

  let announced = false;
  if (stateChanged) {
    try {
      let channelId = process.env["DISCORD_REBOOT_CHANNEL_ID"] ?? null;
      if (!channelId) {
        const { data: settings } = await supabaseAdmin
          .from("bot_settings")
          .select("channel_id")
          .eq("id", true)
          .maybeSingle();
        channelId = settings?.channel_id ?? process.env["DISCORD_CHANNEL_ID"] ?? null;
      }
      if (channelId && previous) {
        await postChannelEmbed(channelId, statusEmbed(status, status.online ? "up" : "down"));
        announced = true;
      }
    } catch (error) {
      await logBot("arma", `Alerte Discord échouée : ${String(error)}`, "cron", "error");
    }
    await logBot(
      "arma",
      status.online
        ? `Serveur Arma en ligne (${status.players}/${status.max_players})`
        : "Serveur Arma hors ligne",
      "cron",
    );
  }

  if (stateChanged || playersChanged) {
    await supabaseAdmin.from("arma_status").insert({
      online: status.online,
      players: status.players,
      max_players: status.max_players,
      server_name: status.server_name,
      map: status.map,
      addr: status.addr,
      event: stateChanged ? (status.online ? "up" : "down") : "poll",
    });
  }

  return { status, changed: stateChanged, announced };
}
