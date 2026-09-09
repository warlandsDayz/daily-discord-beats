import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header, useMe } from "./panel";
import {
  forceRadio,
  registerCommands,
  renameBot,
  saveBotSettings,
  setBotAvatar,
  updateMember,
} from "@/lib/rsa.functions";

export const Route = createFileRoute("/_authenticated/chef")({
  head: () => ({
    meta: [
      { title: "Panel chef — RSA" },
      { name: "description", content: "Administration du crew et du bot RSA." },
      { property: "og:title", content: "Panel chef — RSA" },
      { property: "og:description", content: "Administration du crew et du bot RSA." },
    ],
  }),
  component: ChefPanel,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">{error.message}</div>
  ),
});

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-2xl">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const btnClass =
  "rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50";

function ChefPanel() {
  const me = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [botName, setBotName] = useState("");
  const [guildId, setGuildId] = useState("");
  const [channelId, setChannelId] = useState("");

  const callForceRadio = useServerFn(forceRadio);
  const callRename = useServerFn(renameBot);
  const callAvatar = useServerFn(setBotAvatar);
  const callSettings = useServerFn(saveBotSettings);
  const callRegister = useServerFn(registerCommands);
  const callUpdateMember = useServerFn(updateMember);

  useEffect(() => {
    if (me.data && !me.data.isChef) navigate({ to: "/panel", replace: true });
  }, [me.data, navigate]);

  const members = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const [{ data: profiles, error }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (error) throw new Error(error.message);
      return (profiles ?? []).map((p) => ({
        ...p,
        isChef: (roles ?? []).some((r) => r.user_id === p.id && r.role === "chef"),
      }));
    },
    enabled: Boolean(me.data?.isChef),
  });

  const settings = useQuery({
    queryKey: ["bot-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_settings")
        .select("*")
        .eq("id", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: Boolean(me.data?.isChef),
  });

  const logs = useQuery({
    queryKey: ["bot-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: Boolean(me.data?.isChef),
  });

  useEffect(() => {
    if (settings.data) {
      setGuildId(settings.data.guild_id ?? "");
      setChannelId(settings.data.channel_id ?? "");
      setBotName(settings.data.bot_username ?? "");
    }
  }, [settings.data]);

  const run = async (key: string, fn: () => Promise<unknown>, success: string) => {
    setBusy(key);
    try {
      await fn();
      toast.success(success);
      await queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setBusy(null);
    }
  };

  const onAvatarFile = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Image illisible"));
      reader.readAsDataURL(file);
    });
    await run("avatar", () => callAvatar({ data: { dataUrl } }), "Avatar du bot mis à jour");
  };

  if (!me.data?.isChef) {
    return <div className="p-10 text-center text-muted-foreground">Chargement…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isChef />
      <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
        <h1 className="text-4xl">Panel chef</h1>

        <Card title="Radio">
          <p className="text-sm text-muted-foreground">
            Force une nouvelle fréquence immédiatement et la publie dans le salon configuré.
          </p>
          <button
            className={btnClass}
            disabled={busy === "radio"}
            onClick={() =>
              run("radio", () => callForceRadio({ data: undefined }), "Nouvelle fréquence générée")
            }
          >
            {busy === "radio" ? "Génération…" : "Générer une nouvelle fréquence"}
          </button>
        </Card>

        <Card title="Bot Discord">
          <label className="block text-sm">
            Nom du bot
            <div className="mt-2 flex gap-2">
              <input
                className={inputClass}
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="RSA Radio"
              />
              <button
                className={btnClass}
                disabled={busy === "rename" || botName.trim().length < 2}
                onClick={() =>
                  run("rename", () => callRename({ data: { username: botName.trim() } }), "Nom du bot mis à jour")
                }
              >
                Renommer
              </button>
            </div>
          </label>

          <label className="block text-sm">
            Avatar du bot
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif"
              className="mt-2 block w-full text-sm text-muted-foreground"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onAvatarFile(file);
              }}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              ID du serveur Discord
              <input
                className={`${inputClass} mt-2`}
                value={guildId}
                onChange={(e) => setGuildId(e.target.value)}
                placeholder="123456789012345678"
              />
            </label>
            <label className="block text-sm">
              ID du salon de publication
              <input
                className={`${inputClass} mt-2`}
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder="123456789012345678"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={btnClass}
              disabled={busy === "settings"}
              onClick={() =>
                run(
                  "settings",
                  () => callSettings({ data: { guildId: guildId.trim(), channelId: channelId.trim() } }),
                  "Réglages enregistrés",
                )
              }
            >
              Enregistrer les réglages
            </button>
            <button
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-accent disabled:opacity-50"
              disabled={busy === "commands"}
              onClick={() =>
                run("commands", () => callRegister({ data: undefined }), "Commandes installées sur le serveur")
              }
            >
              Installer les commandes /radio
            </button>
          </div>
        </Card>

        <Card title="Membres">
          <div className="space-y-3">
            {(members.data ?? []).map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3"
              >
                {m.avatar_url ? (
                  <img
                    src={m.avatar_url}
                    alt=""
                    width={36}
                    height={36}
                    loading="lazy"
                    className="h-9 w-9 rounded-full"
                  />
                ) : null}
                <div className="min-w-40 flex-1">
                  <p className="font-semibold">{m.global_name || m.username}</p>
                  <p className="font-mono text-xs text-muted-foreground">{m.discord_id}</p>
                </div>
                <input
                  className={`${inputClass} max-w-40`}
                  defaultValue={m.rank}
                  onBlur={(e) => {
                    const rank = e.target.value.trim();
                    if (rank && rank !== m.rank) {
                      void run("member", () => callUpdateMember({ data: { userId: m.id, rank } }), "Rang mis à jour");
                    }
                  }}
                />
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={m.isChef}
                    onChange={(e) =>
                      run(
                        "member",
                        () => callUpdateMember({ data: { userId: m.id, isChef: e.target.checked } }),
                        "Accès chef mis à jour",
                      )
                    }
                  />
                  Chef
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={m.is_active}
                    onChange={(e) =>
                      run(
                        "member",
                        () => callUpdateMember({ data: { userId: m.id, isActive: e.target.checked } }),
                        "Accès mis à jour",
                      )
                    }
                  />
                  Actif
                </label>
              </div>
            ))}
            {(members.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun membre connecté pour l'instant.</p>
            ) : null}
          </div>
        </Card>

        <Card title="Journal du bot">
          <ul className="max-h-96 space-y-2 overflow-y-auto text-sm">
            {(logs.data ?? []).map((l) => (
              <li key={l.id} className="rounded-md border border-border p-3">
                <div className="flex justify-between gap-3">
                  <span className={l.level === "error" ? "text-destructive" : "text-primary"}>
                    {l.action}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleString("fr-FR")}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{l.message}</p>
                {l.actor ? <p className="mt-1 text-xs text-muted-foreground">par {l.actor}</p> : null}
              </li>
            ))}
            {(logs.data ?? []).length === 0 ? (
              <li className="text-muted-foreground">Rien à signaler pour le moment.</li>
            ) : null}
          </ul>
        </Card>
      </main>
    </div>
  );
}
