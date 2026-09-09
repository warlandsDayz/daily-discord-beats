import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/rsa-logo.png";

export const Route = createFileRoute("/auth/")({
  validateSearch: z.object({ erreur: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Connexion — RSA" },
      { name: "description", content: "Connexion à l'espace membres des Racailles Sans Avenir." },
      { property: "og:title", content: "Connexion — RSA" },
      { property: "og:description", content: "Connexion à l'espace membres des Racailles Sans Avenir." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { erreur } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/panel", replace: true });
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center">
        <img src={logo} alt="Emblème RSA" width={80} height={80} className="mx-auto h-20 w-20" />
        <h1 className="mt-5 text-3xl">Espace membres</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Réservé aux membres des Racailles Sans Avenir.
        </p>

        {erreur ? (
          <p className="mt-5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
            {erreur}
          </p>
        ) : null}

        <a
          href="/api/public/auth/discord/login"
          className="mt-6 block rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          Se connecter avec Discord
        </a>

        <Link to="/" className="mt-6 block text-xs text-muted-foreground hover:text-foreground">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
