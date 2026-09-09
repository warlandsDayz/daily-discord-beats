// Server-only helpers to talk to the Discord API.
const DISCORD_API = "https://discord.com/api/v10";

export function botToken(): string {
  const token = process.env["DISCORD_BOT_TOKEN"];
  if (!token) throw new Error("DISCORD_BOT_TOKEN manquant");
  return token;
}

export async function discordFetch(
  path: string,
  init: RequestInit = {},
): Promise<unknown> {
  const res = await fetch(`${DISCORD_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bot ${botToken()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Discord ${res.status}: ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
}

export async function postChannelMessage(channelId: string, content: string) {
  return discordFetch(`/channels/${channelId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function patchBotUser(payload: {
  username?: string;
  avatar?: string | null;
}) {
  return discordFetch(`/users/@me`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function registerGuildCommands(applicationId: string, guildId: string) {
  return discordFetch(`/applications/${applicationId}/guilds/${guildId}/commands`, {
    method: "PUT",
    body: JSON.stringify([
      {
        name: "radio",
        description: "Génère une nouvelle fréquence radio pour le groupe",
        type: 1,
      },
      {
        name: "radio-actuelle",
        description: "Affiche la fréquence radio en cours",
        type: 1,
      },
    ]),
  });
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export async function verifyDiscordSignature(
  signature: string | null,
  timestamp: string | null,
  body: string,
): Promise<boolean> {
  const publicKey = process.env["DISCORD_PUBLIC_KEY"];
  if (!publicKey || !signature || !timestamp) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      hexToBytes(publicKey),
      { name: "Ed25519" },
      false,
      ["verify"],
    );
    return await crypto.subtle.verify(
      { name: "Ed25519" },
      key,
      hexToBytes(signature),
      new TextEncoder().encode(timestamp + body),
    );
  } catch (error) {
    console.error("[discord] signature verification failed", error);
    return false;
  }
}
