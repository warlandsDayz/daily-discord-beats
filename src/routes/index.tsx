import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/rsa-logo.png";
import { ArmaStatus } from "@/components/ArmaStatus";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dossier RSA — Racailles Sans Avenir" },
      {
        name: "description",
        content:
          "Dossier RP des Racailles Sans Avenir : une famille de 15 membres implantée sur l’île d’Altis.",
      },
      { property: "og:title", content: "Dossier RSA — Racailles Sans Avenir" },
      {
        property: "og:description",
        content: "Une famille de 15 membres, sans chef, soudée dans l’ombre de l’île d’Altis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const ACTIVITES = [
  {
    code: "01 / EXTRACTION",
    titre: "Soufre",
    zone: "Zones minières d’Altis",
    texte: "Extraction, traitement et acheminement. Un travail ingrat que la famille transforme en ressource durable.",
  },
  {
    code: "02 / CULTURE",
    titre: "Tabac",
    zone: "Terres agricoles isolées",
    texte: "Production régulière, itinéraires changeants et équipes réduites pour rester sous les radars.",
  },
  {
    code: "03 / TRANSIT",
    titre: "Logistique",
    zone: "Réseau routier insulaire",
    texte: "Véhicules, stockage et déplacements coordonnés : chacun connaît la route et protège les autres.",
  },
];

function DiscordMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.08.08 0 0 0-.08.04c-.21.38-.44.86-.61 1.25a18.3 18.3 0 0 0-5.48 0 12.6 12.6 0 0 0-.62-1.25.08.08 0 0 0-.08-.04A19.7 19.7 0 0 0 3.68 4.37a.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.05 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .09-.03c.46-.63.87-1.3 1.22-1.99a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13l.37-.29a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01l.37.29a.08.08 0 0 1 0 .13c-.6.35-1.23.65-1.88.89a.08.08 0 0 0-.04.11c.36.7.77 1.36 1.23 1.99a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03ZM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.09 2.16 2.42 0 1.33-.96 2.42-2.16 2.42Zm7.98 0c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.09 2.16 2.42 0 1.33-.95 2.42-2.16 2.42Z" />
    </svg>
  );
}

function Index() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setConnected(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      setConnected(Boolean(session)),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <main className="dossier-shell min-h-screen bg-background px-4 py-5 font-dossier-body text-foreground sm:px-6 sm:py-10">
      <article className="dossier-page relative mx-auto w-full max-w-5xl overflow-hidden border border-border bg-card shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary/70" />
        <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-muted-foreground/50" />
        <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-muted-foreground/50" />

        <div className="px-5 pb-7 pt-9 sm:px-10 sm:pb-10 sm:pt-12 lg:px-16 lg:pb-14">
          <header className="flex items-start justify-between gap-5 border-b border-border pb-6">
            <div className="flex items-center gap-4">
              <img
                src={logo}
                alt="Emblème des Racailles Sans Avenir"
                width={72}
                height={72}
                className="h-14 w-14 object-contain sm:h-18 sm:w-18"
              />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Altis / Archive active
                </p>
                <p className="mt-1 font-mono text-xs font-bold uppercase text-primary">
                  Dossier RSA-15
                </p>
              </div>
            </div>
            <div className="max-w-36 text-right font-mono text-[9px] uppercase leading-4 text-muted-foreground sm:max-w-none">
              <p>Classification</p>
              <p className="text-foreground">Famille clandestine</p>
            </div>
          </header>

          <section className="relative py-14 sm:py-20">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
              Rapport de terrain / Île d’Altis
            </p>
            <h1 className="mt-5 max-w-4xl font-mono text-5xl font-bold uppercase leading-[0.95] sm:text-7xl lg:text-8xl">
              Racailles
              <span className="block text-primary">Sans Avenir</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Quinze personnes réunies par les routes d’Altis. Pas de chef, pas de couronne : une
              famille où chaque voix compte et où personne ne reste derrière.
            </p>
            <div className="mt-9 grid max-w-2xl grid-cols-3 border-y border-border">
              <div className="py-4 pr-3">
                <span className="block font-mono text-2xl font-bold text-foreground">15</span>
                <span className="text-[10px] uppercase text-muted-foreground">Membres</span>
              </div>
              <div className="border-x border-border px-3 py-4 sm:px-6">
                <span className="block font-mono text-2xl font-bold text-foreground">0</span>
                <span className="text-[10px] uppercase text-muted-foreground">Chef</span>
              </div>
              <div className="py-4 pl-3 sm:pl-6">
                <span className="block font-mono text-2xl font-bold text-primary">1</span>
                <span className="text-[10px] uppercase text-muted-foreground">Famille</span>
              </div>
            </div>
          </section>

          <section className="border-l-2 border-primary/60 pl-5 sm:pl-8">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
              <div>
                <p className="dossier-label">Note de synthèse</p>
                <h2 className="mt-3 font-mono text-2xl font-bold uppercase sm:text-3xl">
                  Une famille avant tout
                </h2>
                <p className="mt-5 leading-7 text-muted-foreground">
                  RSA ne fonctionne ni par grades, ni par ordres. Les décisions se prennent
                  ensemble, selon la situation et l’expérience de chacun. Sur le terrain, celui qui
                  sait parle, les autres écoutent. Le lendemain, les rôles peuvent s’inverser.
                </p>
                <p className="mt-4 leading-7 text-muted-foreground">
                  Ce qui nous tient n’est pas un uniforme. C’est la confiance gagnée, les heures de
                  route et les mauvais jours traversés côte à côte.
                </p>
              </div>

              <div>
                <p className="dossier-label">Secteurs d’activité</p>
                <ol className="mt-4 space-y-3">
                  {ACTIVITES.map((activite, index) => (
                    <li
                      key={activite.titre}
                      className="group grid grid-cols-[4px_1fr] gap-4 border border-border bg-secondary/35 p-4 transition-colors hover:border-primary/50"
                    >
                      <span className={index === 0 ? "bg-primary" : "bg-muted-foreground/45"} />
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                          {activite.code} · {activite.zone}
                        </p>
                        <h3 className="mt-1 font-mono text-lg font-bold uppercase text-foreground">
                          {activite.titre}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{activite.texte}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <section className="mt-16 grid gap-8 border-y border-border py-10 sm:mt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="dossier-label">Principe interne / 04</p>
              <blockquote className="mt-4 font-mono text-2xl font-bold leading-tight sm:text-3xl">
                « On ne suit pas un chef. On veille les uns sur les autres. »
              </blockquote>
              <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
                Sur Altis, la force d’un groupe ne se mesure pas à celui qui commande, mais au
                nombre de personnes prêtes à revenir chercher la dernière.
              </p>
            </div>
            <ArmaStatus className="border-border bg-background/50" />
          </section>

          <footer className="flex items-end justify-between gap-5 pt-10">
            <div className="font-mono text-[8px] uppercase leading-4 tracking-[0.12em] text-muted-foreground/60 sm:text-[9px]">
              <p>Univers fictif de jeu de rôle</p>
              <p>Archive RSA / Altis / {new Date().getFullYear()}</p>
            </div>
            <Link
              to={connected ? "/panel" : "/auth"}
              aria-label={connected ? "Ouvrir l’espace membre" : "Connexion Discord"}
              title={connected ? "Espace membre" : "Connexion Discord"}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-secondary text-muted-foreground opacity-25 transition-all hover:border-primary/50 hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <DiscordMark />
            </Link>
          </footer>
        </div>

        <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-muted-foreground/50" />
        <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-muted-foreground/50" />
      </article>
    </main>
  );
}