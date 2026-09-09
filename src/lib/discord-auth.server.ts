// Server-only: Discord OAuth2 login -> Lovable Cloud session.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const CHEF_DISCORD_ID = "494628972013944837";
export const CALLBACK_PATH = "/api/public/auth/discord/callback";

export function callbackUrl(request: Request): string {
  const url = new URL(request.url);
  return `${url.origin}${CALLBACK_PATH}`;
}

export type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
};

export async function exchangeCode(code: string, redirectUri: string): Promise<string> {
  const clientId = process.env["DISCORD_APPLICATION_ID"];
  const clientSecret = process.env["DISCORD_CLIENT_SECRET"];
  if (!clientId || !clientSecret) throw new Error("Identifiants OAuth Discord manquants");

  const res = await fetch("https://discord.com/api/v10/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) throw new Error(`Échec de l'échange OAuth : ${await res.text()}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
  const res = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Profil Discord illisible : ${await res.text()}`);
  return (await res.json()) as DiscordUser;
}

function syntheticEmail(discordId: string) {
  return `${discordId}@discord.rsa.local`;
}

export function avatarUrl(user: DiscordUser): string | null {
  return user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : null;
}

/** Creates or updates the Cloud account + profile, then returns a session. */
export async function signInDiscordUser(user: DiscordUser): Promise<{
  access_token: string;
  refresh_token: string;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const email = syntheticEmail(user.id);

  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("discord_id", user.id)
    .maybeSingle();

  let userId = existingProfile?.id ?? null;

  if (!userId) {
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { discord_id: user.id, username: user.username },
    });
    if (createError || !created?.user) {
      throw new Error(createError?.message ?? "Création du compte impossible");
    }
    userId = created.user.id;
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: userId,
      discord_id: user.id,
      username: user.username,
      global_name: user.global_name ?? null,
      avatar_url: avatarUrl(user),
    },
    { onConflict: "id" },
  );
  if (profileError) throw new Error(profileError.message);

  const isChef = user.id === CHEF_DISCORD_ID;
  await supabaseAdmin
    .from("user_roles")
    .upsert(
      { user_id: userId, role: isChef ? "chef" : "membre" },
      { onConflict: "user_id,role", ignoreDuplicates: true },
    );

  // Magic-link handshake: generate a one-time token server-side and verify it
  // immediately to obtain a real session for this user.
  const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError || !link?.properties?.hashed_token) {
    throw new Error(linkError?.message ?? "Session impossible à ouvrir");
  }

  const anon = createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data: verified, error: verifyError } = await anon.auth.verifyOtp({
    type: "magiclink",
    token_hash: link.properties.hashed_token,
  });
  if (verifyError || !verified.session) {
    throw new Error(verifyError?.message ?? "Session impossible à ouvrir");
  }

  return {
    access_token: verified.session.access_token,
    refresh_token: verified.session.refresh_token,
  };
}
