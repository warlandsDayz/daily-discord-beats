import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/rsa-logo.png";
import hero from "@/assets/hero-street.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RSA — Racailles Sans Avenir" },
      {
        name: "description",
        content:
          "Racailles Sans Avenir : un groupe soudé, discret et organisé. Présentation du crew et accès à l'espace membres.",
      },
      { property: "og:title", content: "RSA — Racailles Sans Avenir" },
      {
        property: "og:description",
        content: "Un groupe soudé, discret et organisé. Découvre les Racailles Sans Avenir.",
      },
    ],
  }),
  component: Index,
});

const VALEURS = [
  {
    titre: "Discrétion",
    texte: "On ne parle pas de ce qu'on fait. La fréquence change tous les jours, jamais deux fois la même.",
  },
  {
    titre: "Loyauté",
    texte: "On ne laisse personne derrière. Un membre du crew, c'est un membre pour de bon.",
  },
  {
    titre: "Organisation",
    texte: "Des rangs clairs, des consignes claires. Chacun sait ce qu'il a à faire.",
  },
];

function Index() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setConnected(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_e, session) =>
      setConnected(Boolean(session)),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5">
        <span className="flex items-center gap-3">
          <img src={logo} alt="Emblème des Racailles Sans Avenir" width={40} height={40} className="h-10 w-10" />
          <span className="font-display text-2xl tracking-widest">RSA</span>
        </span>
        {connected ? (
          <Link
            to="/panel"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Mon espace
          </Link>
        ) : (
          <Link
            to="/auth"
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
          >
            Connexion
          </Link>
        )}
      </header>

      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <img
          src={hero}
          alt="Ruelle sombre éclairée de néons rouges"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-primary">
            Depuis la rue, pour la rue
          </p>
          <h1 className="mt-4 text-6xl leading-[0.95] sm:text-8xl">
            Racailles
            <br />
            <span className="text-primary">Sans Avenir</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            On n'a pas d'avenir, on a un présent. Un crew soudé, une fréquence qui change chaque
            jour, et personne pour nous suivre à la trace.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Se connecter avec Discord
            </Link>
            <a
              href="#crew"
              className="rounded-md border border-border px-6 py-3 font-semibold transition-colors hover:bg-accent"
            >
              Découvrir le crew
            </a>
          </div>
        </div>
      </section>

      <section id="crew" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-4xl">Qui sommes-nous</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Les Racailles Sans Avenir, c'est une bande organisée qui préfère l'ombre au bruit. On
          bouge ensemble, on communique sur une fréquence radio renouvelée chaque jour, et chaque
          membre connaît son rôle. Ici, pas de promesses : que du concret.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {VALEURS.map((v) => (
            <article key={v.titre} className="grain rounded-lg border border-border bg-card p-6">
              <h3 className="text-2xl text-primary">{v.titre}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{v.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl">Tu es du crew ?</h2>
            <p className="mt-2 text-muted-foreground">
              Connecte-toi avec ton compte Discord pour voir la fréquence du jour et ton rang.
            </p>
          </div>
          <Link
            to="/auth"
            className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Accéder à l'espace membres
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-10 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Racailles Sans Avenir — Univers fictif de jeu de rôle.
      </footer>
    </div>
  );
}
