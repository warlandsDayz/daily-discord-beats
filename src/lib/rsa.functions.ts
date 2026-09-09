import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertChef(context: {
  supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }> };
  userId: string;
}) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "chef",
  });
  if (data !== true) throw new Error("Accès réservé aux chefs");
}

async function actorLabel(userId: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("username, discord_id")
    .eq("id", userId)
    .maybeSingle();
  return data ? `${data.username} (${data.discord_id})` : userId;
}

export const forceRadio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertChef(context);
    const { generateAndAnnounce } = await import("@/lib/radio.server");
    const actor = await actorLabel(context.userId);
    const result = await generateAndAnnounce({ source: "panel", actor });
    return { frequency: result.frequency, posted: result.posted };
  });

export const renameBot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { username: string }) =>
    z.object({ username: z.string().min(2).max(32) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertChef(context);
    const { patchBotUser } = await import("@/lib/discord.server");
    const { logBot } = await import("@/lib/radio.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const actor = await actorLabel(context.userId);
    await patchBotUser({ username: data.username });
    await supabaseAdmin
      .from("bot_settings")
      .update({ bot_username: data.username, updated_at: new Date().toISOString() })
      .eq("id", true);
    await logBot("bot", `Nom du bot changé en « ${data.username} »`, actor);
    return { ok: true };
  });

export const setBotAvatar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { dataUrl: string }) =>
    z
      .object({ dataUrl: z.string().regex(/^data:image\/(png|jpeg|gif);base64,/).max(3_000_000) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertChef(context);
    const { patchBotUser } = await import("@/lib/discord.server");
    const { logBot } = await import("@/lib/radio.server");
    const actor = await actorLabel(context.userId);
    await patchBotUser({ avatar: data.dataUrl });
    await logBot("bot", "Avatar du bot mis à jour", actor);
    return { ok: true };
  });

export const saveBotSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { guildId: string; channelId: string }) =>
    z
      .object({
        guildId: z.string().regex(/^\d{5,25}$/).or(z.literal("")),
        channelId: z.string().regex(/^\d{5,25}$/).or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertChef(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logBot } = await import("@/lib/radio.server");
    const actor = await actorLabel(context.userId);
    await supabaseAdmin
      .from("bot_settings")
      .update({
        guild_id: data.guildId || null,
        channel_id: data.channelId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", true);
    await logBot("bot", `Salon de publication mis à jour (${data.channelId || "aucun"})`, actor);
    return { ok: true };
  });

export const registerCommands = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertChef(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { registerGuildCommands } = await import("@/lib/discord.server");
    const { logBot } = await import("@/lib/radio.server");
    const actor = await actorLabel(context.userId);
    const { data: settings } = await supabaseAdmin
      .from("bot_settings")
      .select("guild_id")
      .eq("id", true)
      .maybeSingle();
    const guildId = settings?.guild_id ?? process.env["DISCORD_GUILD_ID"];
    const applicationId = process.env["DISCORD_APPLICATION_ID"];
    if (!guildId || !applicationId) throw new Error("Serveur Discord non configuré");
    await registerGuildCommands(applicationId, guildId);
    await logBot("bot", "Commandes /radio et /radio-actuelle installées", actor);
    return { ok: true };
  });

export const updateMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { userId: string; rank?: string; isChef?: boolean; isActive?: boolean }) =>
      z
        .object({
          userId: z.string().uuid(),
          rank: z.string().min(1).max(40).optional(),
          isChef: z.boolean().optional(),
          isActive: z.boolean().optional(),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertChef(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logBot } = await import("@/lib/radio.server");
    const actor = await actorLabel(context.userId);

    const patch: Record<string, unknown> = {};
    if (data.rank !== undefined) patch["rank"] = data.rank;
    if (data.isActive !== undefined) patch["is_active"] = data.isActive;
    if (Object.keys(patch).length > 0) {
      const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", data.userId);
      if (error) throw new Error(error.message);
    }

    if (data.isChef !== undefined) {
      if (data.userId === context.userId && data.isChef === false) {
        throw new Error("Tu ne peux pas retirer ton propre accès chef");
      }
      if (data.isChef) {
        await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: data.userId, role: "chef" }, { onConflict: "user_id,role", ignoreDuplicates: true });
      } else {
        await supabaseAdmin
          .from("user_roles")
          .delete()
          .eq("user_id", data.userId)
          .eq("role", "chef");
      }
    }

    await logBot("membres", `Fiche membre mise à jour (${data.userId})`, actor);
    return { ok: true };
  });
