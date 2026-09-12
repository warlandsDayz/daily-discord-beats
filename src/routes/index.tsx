import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Archive,
  ChevronDown,
  CircleDot,
  Discord,
  MapPin,
  Shield,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/rsa-logo.png";
import { ArmaStatus } from "@/components/ArmaStatus";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dossier de présentation RSA — Altis" },
      {
        name: "description",
        content:
          "Dossier de présentation des Racailles Sans Avenir, famille indépendante de quinze membres implantée sur Altis.",
      },
      { property: "og:title", content: "Dossier de présentation RSA — Altis" },
      {
        property: "og:description",
        content:
          "Identité, organisation, activités et ambitions des Racailles Sans Avenir sur l’île d’Altis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SOMMAIRE = [
  ["01", "Présentation générale"],
  ["02", "Notre histoire"],
  ["03", "Organisation interne"],
  ["04", "Nos activités"],
  ["05", "Méthode de travail"],
  ["06", "Code de la famille"],
  ["07", "Nos objectifs"],
  ["08", "Fiche de synthèse"],
];

const ACTIVITES = [
  {
    numero: "A.01",
    titre: "Soufre",
    nature: "Extraction & transformation",
    texte:
      "Le soufre constitue l’un des piliers de notre activité. Son exploitation mobilise plusieurs membres sur toute la chaîne : extraction, traitement, chargement et transport. Nous privilégions des équipes réduites, capables de s’adapter rapidement à la situation.",
  },
  {
    numero: "A.02",
    titre: "Tabac",
    nature: "Culture & acheminement",
    texte:
      "Le tabac complète notre économie et demande une présence régulière sur le terrain. La récolte, le conditionnement et l’acheminement sont répartis entre les membres disponibles afin de ne jamais faire reposer une opération sur une seule personne.",
  },
  {
    numero: "A.03",
    titre: "Logistique",
    nature: "Transport & stockage",
    texte:
      "Nos activités reposent sur une logistique simple, mobile et maîtrisée. Les véhicules, les trajets et les stocks sont organisés collectivement. Chaque déplacement est préparé pour protéger les ressources autant que les personnes qui les transportent.",
  },
];

const REGLES = [
  ["La famille avant l’intérêt personnel", "Aucun gain ne justifie de laisser un membre seul ou exposé."],
  ["La parole est donnée à tous", "Une décision importante se discute. L’expérience compte, le grade n’existe pas."],
  ["La confiance se prouve", "Elle se construit sur le terrain, par la présence, la franchise et les actes."],
  ["La discrétion protège le groupe", "Les informations de la famille restent dans la famille."],
  ["Chacun assume sa part", "Les réussites se partagent, les erreurs aussi. Personne ne porte seul le poids du groupe."],
];

function SectionHeader({ number, eyebrow, title }: { number: string; eyebrow: string; title: string }) {
  return (
    <header className="mb-8 grid gap-3 border-b border-border pb-5 sm:grid-cols-[5rem_1fr] sm:items-end">
      <span className="font-mono text-4xl font-bold text-primary/70">{number}</span>
      <div>
        <p className="dossier-label">{eyebrow}</p>
        <h2 className="mt-2 font-mono text-2xl font-bold uppercase sm:text-4xl">{title}</h2>
      </div>
    </header>
  );
}

function DossierPage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`dossier-sheet relative border-x border-b border-border px-5 py-12 sm:px-10 lg:px-16 lg:py-16 ${className}`}>
      <span className="absolute right-5 top-5 font-mono text-[9px] uppercase text-muted-foreground/50">RSA // Altis</span>
      {children}
    </section>
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
    <main className="dossier-shell min-h-screen bg-background px-3 py-4 font-dossier-body text-foreground sm:px-6 sm:py-10">
      <article className="mx-auto w-full max-w-6xl shadow-2xl">
        <section className="dossier-cover relative flex min-h-[calc(100svh-2rem)] flex-col overflow-hidden border border-border bg-card px-6 py-7 sm:min-h-[820px] sm:px-12 sm:py-10 lg:px-20">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
          <div className="flex items-start justify-between gap-5 border-b border-border pb-5 font-mono text-[9px] uppercase leading-4 text-muted-foreground sm:text-[10px]">
            <div>
              <p className="text-primary">Dossier de présentation</p>
              <p>Référence RSA / ALTIS / 15</p>
            </div>
            <div className="text-right">
              <p>Document interne</p>
              <p className="text-foreground">Diffusion contrôlée</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <img
              src={logo}
              alt="Emblème des Racailles Sans Avenir"
              width={220}
              height={220}
              className="h-40 w-40 object-contain sm:h-56 sm:w-56"
            />
            <p className="mt-8 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-primary sm:text-xs">
              Famille indépendante · Île d’Altis
            </p>
            <h1 className="mt-5 max-w-4xl font-mono text-4xl font-bold uppercase leading-none sm:text-7xl lg:text-8xl">
              Racailles
              <span className="mt-2 block text-primary">Sans Avenir</span>
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-lg">
              Présentation de notre identité, de notre fonctionnement et de la place que nous voulons construire sur Altis.
            </p>
          </div>

          <div className="grid grid-cols-3 border-y border-border text-center">
            <div className="py-4"><strong className="block font-mono text-2xl">15</strong><span className="text-[9px] uppercase text-muted-foreground">Membres</span></div>
            <div className="border-x border-border py-4"><strong className="block font-mono text-2xl">0</strong><span className="text-[9px] uppercase text-muted-foreground">Hiérarchie</span></div>
            <div className="py-4"><strong className="block font-mono text-2xl text-primary">1</strong><span className="text-[9px] uppercase text-muted-foreground">Famille</span></div>
          </div>
          <a href="#sommaire" aria-label="Ouvrir le dossier" className="mx-auto mt-6 text-muted-foreground transition-colors hover:text-primary">
            <ChevronDown className="h-5 w-5" />
          </a>
        </section>

        <DossierPage className="bg-card" >
          <div id="sommaire" className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="dossier-label">Table des matières</p>
              <h2 className="mt-3 font-mono text-4xl font-bold uppercase sm:text-5xl">Le dossier</h2>
              <p className="mt-5 max-w-sm leading-7 text-muted-foreground">
                Ce document expose ce que nous sommes aujourd’hui et ce que nous cherchons à bâtir ensemble sur Altis.
              </p>
            </div>
            <ol className="border-t border-border">
              {SOMMAIRE.map(([numero, titre]) => (
                <li key={numero} className="flex items-center gap-5 border-b border-border py-3.5">
                  <span className="font-mono text-xs font-bold text-primary">{numero}</span>
                  <span className="text-sm font-medium uppercase">{titre}</span>
                </li>
              ))}
            </ol>
          </div>
        </DossierPage>

        <DossierPage className="bg-card">
          <SectionHeader number="01" eyebrow="Identité" title="Présentation générale" />
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              <p className="text-xl font-medium leading-8 text-foreground">
                Les Racailles Sans Avenir sont une famille de quinze personnes réunies sur l’île d’Altis par une même volonté : avancer ensemble sans dépendre de personne.
              </p>
              <p>
                Nous ne cherchons pas à ressembler aux organisations traditionnelles. Il n’y a chez nous ni chef permanent, ni titres destinés à placer certains au-dessus des autres. Chacun apporte son caractère, son expérience et ses compétences au collectif.
              </p>
              <p>
                Nous nous considérons comme une famille avant de nous considérer comme un groupe. Cela signifie que notre unité ne repose pas seulement sur les activités que nous partageons, mais sur la confiance construite au fil du temps, les risques traversés ensemble et l’engagement de ne laisser personne de côté.
              </p>
            </div>
            <aside className="border-l-2 border-primary pl-6">
              <p className="dossier-label">Positionnement</p>
              <dl className="mt-5 space-y-5 text-sm">
                <div><dt className="text-muted-foreground">Dénomination</dt><dd className="mt-1 font-mono font-bold uppercase">Racailles Sans Avenir</dd></div>
                <div><dt className="text-muted-foreground">Nature</dt><dd className="mt-1 font-mono font-bold uppercase">Famille indépendante</dd></div>
                <div><dt className="text-muted-foreground">Territoire</dt><dd className="mt-1 font-mono font-bold uppercase">Île d’Altis</dd></div>
                <div><dt className="text-muted-foreground">Effectif</dt><dd className="mt-1 font-mono font-bold uppercase">15 membres</dd></div>
              </dl>
            </aside>
          </div>
        </DossierPage>

        <DossierPage className="bg-secondary/40">
          <SectionHeader number="02" eyebrow="Origine" title="Notre histoire" />
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="font-mono text-lg font-bold uppercase text-primary">Une rencontre, pas un recrutement</p>
              <p className="mt-4 leading-8 text-muted-foreground">
                RSA ne s’est pas construite autour d’un poste à prendre ou d’une autorité à suivre. La famille s’est formée au fil des rencontres, des journées de travail et des situations où la confiance valait davantage qu’un discours. Les liens sont venus avant le nom.
              </p>
            </div>
            <div>
              <p className="font-mono text-lg font-bold uppercase text-primary">Une place à bâtir sur Altis</p>
              <p className="mt-4 leading-8 text-muted-foreground">
                Sur une île où chacun cherche à défendre son territoire et ses intérêts, nous avons choisi de construire notre propre voie. Notre histoire n’est pas celle d’une conquête rapide : elle s’écrit par le travail, la régularité et la capacité à rester soudés lorsque les circonstances changent.
              </p>
            </div>
          </div>
          <blockquote className="mt-12 border-y border-border py-8 text-center font-mono text-xl font-bold uppercase leading-relaxed sm:text-3xl">
            « Les liens sont venus avant le nom.<br /><span className="text-primary">La famille est venue avant le reste.</span> »
          </blockquote>
        </DossierPage>

        <DossierPage className="bg-card">
          <SectionHeader number="03" eyebrow="Fonctionnement" title="Organisation interne" />
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-3"><Users className="h-6 w-6 text-primary" /><h3 className="font-mono text-xl font-bold uppercase">Quinze voix égales</h3></div>
              <p className="mt-5 leading-8 text-muted-foreground">
                Nous n’avons pas de chef. Les décisions qui engagent la famille sont discutées entre les membres concernés. Chacun peut proposer, contester et participer. Le respect vient de ce que l’on fait pour les autres, jamais d’un titre.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3"><Shield className="h-6 w-6 text-primary" /><h3 className="font-mono text-xl font-bold uppercase">Des rôles selon le besoin</h3></div>
              <p className="mt-5 leading-8 text-muted-foreground">
                Sur le terrain, une personne peut coordonner une tâche parce qu’elle connaît mieux la route, la ressource ou le risque. Cette responsabilité reste liée à la mission : elle ne devient jamais un pouvoir permanent sur la famille.
              </p>
            </div>
          </div>
          <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-3">
            {["Décider ensemble", "Répartir selon les forces", "Rester responsables"].map((item, index) => (
              <div key={item} className="bg-card p-6">
                <span className="font-mono text-xs text-primary">0{index + 1}</span>
                <p className="mt-3 font-mono text-sm font-bold uppercase">{item}</p>
              </div>
            ))}
          </div>
        </DossierPage>

        <DossierPage className="bg-secondary/40">
          <SectionHeader number="04" eyebrow="Économie" title="Nos activités" />
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            Notre économie repose sur des activités que nous pouvons organiser et assurer nous-mêmes. Le travail est collectif : aucune étape n’est considérée comme secondaire, de la récolte au dernier trajet.
          </p>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {ACTIVITES.map((activite) => (
              <article key={activite.numero} className="grid gap-4 py-8 sm:grid-cols-[6rem_1fr] lg:grid-cols-[6rem_14rem_1fr] lg:gap-8">
                <span className="font-mono text-sm font-bold text-primary">{activite.numero}</span>
                <div><h3 className="font-mono text-2xl font-bold uppercase">{activite.titre}</h3><p className="mt-1 text-xs uppercase text-muted-foreground">{activite.nature}</p></div>
                <p className="leading-7 text-muted-foreground sm:col-start-2 lg:col-start-3">{activite.texte}</p>
              </article>
            ))}
          </div>
        </DossierPage>

        <DossierPage className="bg-card">
          <SectionHeader number="05" eyebrow="Terrain" title="Méthode de travail" />
          <div className="grid gap-8 sm:grid-cols-2">
            {[
              ["Préparer", "Avant chaque activité, nous définissons les besoins, les personnes disponibles et la façon de rester en contact."],
              ["Répartir", "Les tâches suivent les capacités et l’expérience de chacun. Celui qui sait transmet, celui qui apprend participe."],
              ["Protéger", "La sécurité d’un membre passe avant la cargaison. En cas de difficulté, le groupe se rassemble et s’adapte."],
              ["Partager", "Les résultats appartiennent à l’effort collectif. Le travail visible et le soutien discret ont la même valeur."],
            ].map(([titre, texte], index) => (
              <div key={titre} className="border-t-2 border-primary pt-5">
                <div className="flex items-center gap-3"><CircleDot className="h-4 w-4 text-primary" /><span className="font-mono text-xs text-muted-foreground">PROCÉDURE 0{index + 1}</span></div>
                <h3 className="mt-4 font-mono text-xl font-bold uppercase">{titre}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{texte}</p>
              </div>
            ))}
          </div>
        </DossierPage>

        <DossierPage className="bg-secondary/40">
          <SectionHeader number="06" eyebrow="Engagement" title="Code de la famille" />
          <ol className="divide-y divide-border border-y border-border">
            {REGLES.map(([titre, texte], index) => (
              <li key={titre} className="grid gap-3 py-6 sm:grid-cols-[4rem_1fr_1.25fr] sm:items-start sm:gap-6">
                <span className="font-mono text-2xl font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
                <strong className="font-mono text-sm uppercase leading-6">{titre}</strong>
                <p className="text-sm leading-6 text-muted-foreground">{texte}</p>
              </li>
            ))}
          </ol>
        </DossierPage>

        <DossierPage className="bg-card">
          <SectionHeader number="07" eyebrow="Projection" title="Nos objectifs" />
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="dossier-label">À court terme</p>
              <ul className="mt-5 space-y-4 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary">—</span><span>Stabiliser nos activités autour du soufre et du tabac.</span></li>
                <li className="flex gap-3"><span className="text-primary">—</span><span>Renforcer notre organisation sans créer de hiérarchie.</span></li>
                <li className="flex gap-3"><span className="text-primary">—</span><span>Permettre à chaque membre de trouver sa place dans les opérations.</span></li>
              </ul>
            </div>
            <div>
              <p className="dossier-label">À long terme</p>
              <ul className="mt-5 space-y-4 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary">—</span><span>Faire de RSA une famille connue pour sa parole et sa cohésion.</span></li>
                <li className="flex gap-3"><span className="text-primary">—</span><span>Développer notre autonomie et diversifier nos possibilités sur Altis.</span></li>
                <li className="flex gap-3"><span className="text-primary">—</span><span>Grandir sans perdre l’égalité et la proximité qui nous définissent.</span></li>
              </ul>
            </div>
          </div>
        </DossierPage>

        <DossierPage className="bg-secondary/40">
          <SectionHeader number="08" eyebrow="Annexe" title="Fiche de synthèse" />
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border border-border bg-card p-6">
              <div className="flex items-center gap-3 border-b border-border pb-4"><Archive className="h-5 w-5 text-primary" /><p className="font-mono text-sm font-bold uppercase">RSA / Identité collective</p></div>
              <dl className="mt-5 grid grid-cols-[7rem_1fr] gap-y-4 text-sm">
                <dt className="text-muted-foreground">Nom</dt><dd className="font-medium">Racailles Sans Avenir</dd>
                <dt className="text-muted-foreground">Abréviation</dt><dd className="font-medium">RSA</dd>
                <dt className="text-muted-foreground">Implantation</dt><dd className="flex items-center gap-2 font-medium"><MapPin className="h-3.5 w-3.5 text-primary" /> Altis</dd>
                <dt className="text-muted-foreground">Effectif</dt><dd className="font-medium">15 membres</dd>
                <dt className="text-muted-foreground">Direction</dt><dd className="font-medium">Aucune</dd>
                <dt className="text-muted-foreground">Activités</dt><dd className="font-medium">Soufre, tabac, logistique</dd>
              </dl>
            </div>
            <ArmaStatus className="rounded-none bg-card" />
          </div>
        </DossierPage>

        <section className="dossier-sheet relative border border-t-0 border-border bg-card px-6 py-14 text-center sm:px-12 sm:py-20">
          <img src={logo} alt="Sceau RSA" width={96} height={96} className="mx-auto h-20 w-20 object-contain opacity-80" />
          <p className="mt-7 font-mono text-2xl font-bold uppercase sm:text-4xl">Pas de chef. Pas d’abandon.</p>
          <p className="mt-3 font-mono text-sm font-bold uppercase text-primary">Une famille, quinze voix.</p>
          <p className="mx-auto mt-6 max-w-2xl leading-7 text-muted-foreground">
            Nous ne promettons pas d’être les plus nombreux ni les plus puissants. Nous promettons d’être présents les uns pour les autres et de construire notre avenir ensemble sur Altis.
          </p>
          <div className="mt-12 flex items-end justify-between border-t border-border pt-6">
            <div className="text-left font-mono text-[8px] uppercase leading-4 text-muted-foreground/60 sm:text-[9px]">
              <p>Fin du dossier</p><p>RSA / Altis / {new Date().getFullYear()}</p>
            </div>
            <Link
              to={connected ? "/panel" : "/auth"}
              aria-label={connected ? "Ouvrir l’espace membre" : "Connexion Discord"}
              title={connected ? "Espace membre" : "Connexion Discord"}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground/20 transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
            >
              <Discord className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}