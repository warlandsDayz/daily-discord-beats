import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/rsa-logo.png";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Mon espace — RSA" },
      { name: "description", content: "Espace membre des Racailles Sans Avenir." },
      { property: "og:title", content: "Mon espace — RSA" },
      { property: "og:description", content: "Espace membre des Racailles Sans Avenir." },
    ],
  }),
  component: Panel,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">{error.message}</div>
  ),
});

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Non connecté");
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", uid),
      ]);
      return {
        profile,
        isChef: (roles ?? []).some((r) => r.role === "chef"),
      };
    },
  });
}

function nextChangeLabel() {
  const now = new Date();
  const paris = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  const next = new Date(paris);
  next.setHours(6, 0, 0, 0);
  if (paris >= next) next.setDate(next.getDate() + 1);
  const diff = next.getTime() - paris.getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h} h ${String(m).padStart(2, "0")}`;
}

export function Header({ isChef }: { isChef: boolean }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
      <Link to="/" className="flex items-center gap-3">
        <img src={logo} alt="Emblème RSA" width={36} height={36} className="h-9 w-9" loading="lazy" />
        <span className="font-display text-xl tracking-widest">RSA</span>
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        <Link
          to="/panel"
          className="rounded-md px-3 py-2 hover:bg-accent [&.active]:bg-accent"
        >
          Mon espace
        </Link>
        {isChef ? (
          <Link to="/chef" className="rounded-md px-3 py-2 hover:bg-accent [&.active]:bg-accent">
            Panel chef
          </Link>
        ) : null}
        <button
          onClick={signOut}
          className="rounded-md border border-border px-3 py-2 hover:bg-accent"
        >
          Déconnexion
        </button>
      </nav>
    </header>
  );
}

function Panel() {
  const { data, isLoading } = useMe();
  const frequencies = useQuery({
    queryKey: ["frequencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("radio_frequencies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const current = frequencies.data?.[0];

  return (
    <div className="min-h-screen bg-background">
      <Header isChef={Boolean(data?.isChef)} />

      <main className="mx-auto max-w-4xl px-6 py-10">
        {isLoading ? (
          <p className="text-muted-foreground">Chargement…</p>
        ) : (
          <>
            <div className="flex items-center gap-4">
              {data?.profile?.avatar_url ? (
                <img
                  src={data.profile.avatar_url}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  className="h-16 w-16 rounded-full border border-border"
                />
              ) : null}
              <div>
                <h1 className="text-4xl">{data?.profile?.global_name || data?.profile?.username}</h1>
                <p className="text-sm text-muted-foreground">
                  Rang :{" "}
                  <span className="font-semibold text-primary">{data?.profile?.rank}</span>
                  {data?.isChef ? " · Chef" : ""}
                </p>
              </div>
            </div>

            <section className="mt-10 rounded-xl border border-border bg-card p-8 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Fréquence du jour
              </p>
              <p className="mt-3 font-mono text-6xl font-bold text-primary">
                {current ? Number(current.frequency).toFixed(1) : "—"}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Prochain changement dans environ {nextChangeLabel()}
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl">Dernières fréquences</h2>
              <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
                {(frequencies.data ?? []).slice(1).map((f) => (
                  <li key={f.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-muted-foreground">
                      {new Date(f.created_at).toLocaleDateString("fr-FR")}
                    </span>
                    <span className="font-mono">{Number(f.frequency).toFixed(1)}</span>
                  </li>
                ))}
                {(frequencies.data ?? []).length <= 1 ? (
                  <li className="px-4 py-3 text-sm text-muted-foreground">
                    Pas encore d'historique.
                  </li>
                ) : null}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
