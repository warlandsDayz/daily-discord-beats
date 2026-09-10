import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function ArmaStatus({ className = "" }: { className?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["arma-status"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("arma_status")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const online = Boolean(data?.online);

  return (
    <div className={`rounded-xl border border-border bg-card p-6 ${className}`}>
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground">
        Serveur Arma 3
      </p>
      {isLoading ? (
        <p className="mt-3 text-muted-foreground">Relevé en cours…</p>
      ) : !data ? (
        <p className="mt-3 text-muted-foreground">Aucun relevé pour le moment.</p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${
                online
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${online ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
              />
              {online ? "En ligne" : "Hors ligne"}
            </span>
            <span className="font-mono text-2xl font-bold">
              {data.players}/{data.max_players || "?"}
            </span>
            <span className="text-sm text-muted-foreground">connectés</span>
          </div>
          <p className="mt-3 truncate text-sm text-muted-foreground">
            {data.server_name ?? data.addr}
            {data.map ? ` · ${data.map}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Dernier relevé :{" "}
            {new Date(data.checked_at).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </>
      )}
    </div>
  );
}
