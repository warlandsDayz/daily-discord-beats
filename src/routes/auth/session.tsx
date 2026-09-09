import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/session")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Connexion en cours — RSA" },
      { name: "description", content: "Finalisation de la connexion Discord." },
      { property: "og:title", content: "Connexion en cours — RSA" },
      { property: "og:description", content: "Finalisation de la connexion Discord." },
    ],
  }),
  component: SessionPage,
});

function SessionPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Connexion en cours…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    window.history.replaceState(null, "", window.location.pathname);

    if (!access_token || !refresh_token) {
      navigate({ to: "/auth", search: { erreur: "Connexion incomplète" }, replace: true });
      return;
    }

    supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) {
        setMessage("Connexion impossible.");
        navigate({ to: "/auth", search: { erreur: error.message }, replace: true });
        return;
      }
      navigate({ to: "/panel", replace: true });
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
