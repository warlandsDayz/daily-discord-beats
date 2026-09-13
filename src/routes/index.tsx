import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Archive,
  ChevronDown,
  CircleDot,
  Crosshair,
  Fingerprint,
  MapPin,
  PackageSearch,
  Shield,
  Syringe,
  Truck,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/rsa-logo.png";
import { ArmaStatus } from "@/components/ArmaStatus";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dossier RSA — Racailles Sans Avenir" },
      {
        name: "description",
        content: "Dossier de présentation RP des Racailles Sans Avenir, famille indépendante implantée sur Altis.",
      },
      { property: "og:title", content: "Dossier RSA — Racailles Sans Avenir" },
      {
        property: "og:description",
        content: "Identité, organisation, activités et ambitions de la famille RSA sur l’île d’Altis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SOMMAIRE = [
  ["01", "Note de synthèse"],
  ["02", "Origines & implantation"],
  ["03", "Structure familiale"],
  ["04", "Domaines d’activité"],
  ["05", "Doctrine opérationnelle"],
  ["06", "Code de la famille"],
  ["07", "Projection sur Altis"],
  ["08", "Annexe de situation"],
];

const ACTIVITES = [
  {
    numero: "PIÈCE 04-A",
    icon: Syringe,
    titre: "Héroïne",
    nature: "Production · conditionnement · distribution",
    texte: "L’héroïne constitue l’activité appelée à devenir le centre de notre économie. La famille souhaite maîtriser chaque étape avec régularité et discrétion, sans dépendre d’intermédiaires extérieurs. Les rôles tournent selon les disponibilités : production, surveillance, transport et mise à l’abri.",
  },
  {
    numero: "PIÈCE 04-B",
    icon: Truck,
    titre: "Go-fast",
    nature: "Convoyage rapide · opérations fréquentes",
    texte: "Les go-fast seront menés régulièrement pour acheminer les marchandises et maintenir nos réseaux. Chaque départ engage plusieurs membres : éclaireurs, conducteurs et soutien. La cargaison compte, mais aucune marchandise ne passe avant le retour de la famille au complet.",
  },
  {
    numero: "PIÈCE 04-C",
    icon: PackageSearch,
    titre: "Soufre & tabac",
    nature: "Récolte · transformation · revente",
    texte: "Le soufre et le tabac restent les fondations stables de notre activité. Ils assurent des revenus constants, entretiennent nos habitudes de travail collectif et permettent à chaque membre de participer selon son expérience du terrain.",
  },
];

const REGLES = [
  ["La famille passe avant la marchandise", "Aucun bénéfice ne justifie de laisser un membre isolé, exposé ou abandonné."],
  ["Quinze membres, quinze voix", "Les décisions majeures sont discutées ensemble. L’expérience guide, elle ne commande pas."],
  ["La confiance se gagne sur le terrain", "La parole compte, mais la présence, la franchise et les actes comptent davantage."],
  ["La discrétion protège chacun", "Les affaires, les lieux et les habitudes de la famille ne quittent jamais son cercle."],
  ["Les réussites comme les erreurs sont communes", "Les profits se partagent et les conséquences ne reposent jamais sur une seule personne."],
];

function DiscordMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.08.08 0 0 0-.08.04c-.21.38-.44.86-.61 1.25a18.3 18.3 0 0 0-5.48 0 12.6 12.6 0 0 0-.62-1.25.08.08 0 0 0-.08-.04A19.7 19.7 0 0 0 3.68 4.37a.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.05 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .09-.03c.46-.63.87-1.3 1.22-1.99a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13l.37-.29a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01l.37.29a.08.08 0 0 1 0 .13c-.6.35-1.23.65-1.88.89a.08.08 0 0 0-.04.11c.36.7.77 1.36 1.23 1.99a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03ZM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.09 2.16 2.42 0 1.33-.96 2.42-2.16 2.42Zm7.98 0c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.09 2.16 2.42 0 1.33-.95 2.42-2.16 2.42Z" />
    </svg>
  );
}

function Classification({ children }: { children: ReactNode }) {
  return <span className="inline-flex border border-primary/45 bg-primary/10 px-2 py-1 font-mono text-[9px] font-bold uppercase text-primary">{children}</span>;
}

function SectionHeader({ number, label, title }: { number: string; label: string; title: string }) {
  return (
    <header className="mb-9 grid gap-4 border-b border-border pb-6 sm:grid-cols-[4rem_1fr] sm:items-end">
      <span className="font-mono text-3xl text-primary">{number}</span>
      <div>
        <p className="dossier-label">{label}</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-5xl">{title}</h2>
      </div>
    </header>
  );
}

function DossierPage({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <section className={`dossier-sheet relative border-x border-b border-border px-6 py-12 sm:px-12 lg:px-16 lg:py-16 ${muted ? "bg-secondary/35" : "bg-card"}`}>
      <span className="absolute right-6 top-5 font-mono text-[8px] uppercase text-muted-foreground/45">RSA // usage interne</span>
      {children}
    </section>
  );
}

function Index() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setConnected(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setConnected(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <main className="dossier-shell min-h-screen bg-background px-3 py-5 font-dossier-body text-foreground sm:px-7 sm:py-12">
      <article className="mx-auto w-full max-w-5xl shadow-2xl">
        <section className="dossier-cover relative flex min-h-[calc(100svh-2.5rem)] flex-col overflow-hidden border border-border bg-card px-6 py-7 sm:min-h-[790px] sm:px-12 sm:py-10 lg:px-16">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
          <div className="flex items-start justify-between gap-5 border-b border-border pb-5 font-mono text-[9px] uppercase leading-4 text-muted-foreground">
            <div><Classification>Confidentiel</Classification><p className="mt-2">Réf. RSA–ALTIS–015</p></div>
            <div className="text-right"><p>Dossier de présentation</p><p className="text-primary">Sujet sous surveillance</p></div>
          </div>

          <div className="grid flex-1 items-center gap-10 py-12 md:grid-cols-[1fr_13rem]">
            <div>
              <p className="dossier-label">Organisation indépendante · Altis</p>
              <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[0.95] sm:text-7xl lg:text-8xl">Racailles<br /><span className="text-primary">Sans Avenir</span></h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Rapport d’identification d’une famille de quinze individus liés par le travail, la confiance et une volonté commune d’imposer leur propre voie sur Altis.</p>
            </div>
            <div className="relative mx-auto w-full max-w-[13rem] border border-border bg-background/40 p-5">
              <div className="absolute -right-4 -top-4 border border-primary/40 px-3 py-2 font-mono text-[9px] font-bold uppercase text-primary rotate-3">Pièce A-01</div>
              <img src={logo} alt="Emblème des Racailles Sans Avenir" width={220} height={220} className="aspect-square w-full object-contain" />
              <p className="mt-4 border-t border-border pt-3 text-center font-mono text-[8px] uppercase text-muted-foreground">Emblème authentifié</p>
            </div>
          </div>

          <div className="grid grid-cols-3 border-y border-border text-center">
            <div className="py-4"><strong className="block text-2xl">15</strong><span className="font-mono text-[8px] uppercase text-muted-foreground">Membres</span></div>
            <div className="border-x border-border py-4"><strong className="block text-2xl">0</strong><span className="font-mono text-[8px] uppercase text-muted-foreground">Chef</span></div>
            <div className="py-4"><strong className="block text-2xl text-primary">1</strong><span className="font-mono text-[8px] uppercase text-muted-foreground">Famille</span></div>
          </div>
          <a href="#sommaire" aria-label="Consulter le dossier" className="mx-auto mt-6 text-muted-foreground transition-colors hover:text-primary"><ChevronDown className="h-5 w-5" /></a>
        </section>

        <DossierPage>
          <div id="sommaire" className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <div><Classification>Dossier actif</Classification><h2 className="mt-4 text-4xl font-bold sm:text-5xl">Table des pièces</h2><p className="mt-5 max-w-sm leading-7 text-muted-foreground">Le présent document rassemble les éléments connus sur l’identité, les activités et les ambitions de la famille RSA.</p></div>
            <ol className="border-t border-border">
              {SOMMAIRE.map(([numero, titre]) => <li key={numero} className="flex items-center gap-5 border-b border-border py-3.5"><span className="font-mono text-xs font-bold text-primary">{numero}</span><span className="text-sm font-semibold uppercase">{titre}</span></li>)}
            </ol>
          </div>
        </DossierPage>

        <DossierPage muted>
          <SectionHeader number="01" label="Note de synthèse" title="Une famille avant tout" />
          <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              <p className="text-xl font-medium leading-8 text-foreground">Les Racailles Sans Avenir forment une famille de quinze personnes implantée sur l’île d’Altis. Elles n’obéissent ni à un chef permanent ni à une hiérarchie figée.</p>
              <p>Le groupe s’est construit autour d’une certitude simple : personne n’avance seul. Chaque voix pèse dans les décisions et chaque membre trouve sa place selon la situation, ses aptitudes et la confiance gagnée au fil des opérations.</p>
              <p>RSA cherche aujourd’hui à consolider une économie clandestine durable, avec l’héroïne comme axe de développement majeur, sans renoncer aux activités qui ont façonné sa cohésion.</p>
            </div>
            <aside className="border-l border-primary pl-6">
              <Fingerprint className="h-8 w-8 text-primary" />
              <dl className="mt-6 space-y-5 text-sm">
                <div><dt className="dossier-label">Désignation</dt><dd className="mt-1 font-semibold">Racailles Sans Avenir</dd></div>
                <div><dt className="dossier-label">Nature</dt><dd className="mt-1 font-semibold">Famille indépendante</dd></div>
                <div><dt className="dossier-label">Implantation</dt><dd className="mt-1 font-semibold">Île d’Altis</dd></div>
                <div><dt className="dossier-label">Statut</dt><dd className="mt-1 font-semibold text-primary">Actif</dd></div>
              </dl>
            </aside>
          </div>
        </DossierPage>

        <DossierPage>
          <SectionHeader number="02" label="Origines & implantation" title="Les liens avant le nom" />
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div><p className="dossier-label">Constat initial</p><p className="mt-5 leading-8 text-muted-foreground">RSA n’est pas née d’un recrutement organisé. La famille s’est formée au fil des rencontres, des journées de travail et des risques traversés ensemble. Avant le nom, il y avait déjà l’entraide, les habitudes communes et la certitude de pouvoir compter les uns sur les autres.</p></div>
            <div><p className="dossier-label">Implantation à Altis</p><p className="mt-5 leading-8 text-muted-foreground">Sur une île où chaque territoire se négocie, la famille refuse de vivre dans l’ombre d’une autre organisation. Elle avance sans rechercher le bruit inutile : présence constante, parole tenue et réponse collective lorsque ses intérêts sont menacés.</p></div>
          </div>
          <blockquote className="mt-12 border-y border-border py-8 text-center text-2xl font-bold leading-relaxed sm:text-3xl">« Nous n’avons pas besoin d’un chef.<br /><span className="text-primary">Nous avons besoin les uns des autres.</span> »</blockquote>
        </DossierPage>

        <DossierPage muted>
          <SectionHeader number="03" label="Structure familiale" title="Quinze voix égales" />
          <div className="grid gap-px border border-border bg-border md:grid-cols-3">
            {[
              [Users, "Décider", "Les choix importants sont discutés par les membres concernés. Aucun titre ne donne le dernier mot."],
              [Shield, "Coordonner", "Sur le terrain, le plus expérimenté guide l’action. Cette responsabilité s’arrête avec la mission."],
              [Activity, "Répondre", "Les conséquences sont portées ensemble. Une erreur individuelle devient un problème familial."],
            ].map(([Icon, title, text]) => {
              const ItemIcon = Icon as typeof Users;
              return <div key={String(title)} className="bg-card p-7"><ItemIcon className="h-6 w-6 text-primary" /><h3 className="mt-5 text-xl font-bold">{String(title)}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{String(text)}</p></div>;
            })}
          </div>
        </DossierPage>

        <DossierPage>
          <SectionHeader number="04" label="Domaines d’activité" title="Une économie clandestine" />
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">Les activités sont pensées comme une chaîne commune. Chacun intervient là où il est utile, du premier repérage jusqu’au retour de l’équipe et à la mise en sécurité des gains.</p>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {ACTIVITES.map(({ numero, icon: Icon, titre, nature, texte }) => (
              <article key={numero} className="grid gap-5 py-9 md:grid-cols-[8rem_13rem_1fr] md:gap-8">
                <div><Icon className="h-6 w-6 text-primary" /><span className="mt-3 block font-mono text-[9px] font-bold text-primary">{numero}</span></div>
                <div><h3 className="text-2xl font-bold">{titre}</h3><p className="mt-2 font-mono text-[9px] uppercase leading-4 text-muted-foreground">{nature}</p></div>
                <p className="leading-7 text-muted-foreground">{texte}</p>
              </article>
            ))}
          </div>
        </DossierPage>

        <DossierPage muted>
          <SectionHeader number="05" label="Doctrine opérationnelle" title="Discrets, rapides, solidaires" />
          <div className="grid gap-8 sm:grid-cols-2">
            {[
              ["Observer", "Comprendre le terrain, les présences et les risques avant de mobiliser la famille."],
              ["Répartir", "Attribuer les rôles selon les capacités du moment, sans rang fixe ni privilège."],
              ["Protéger", "Faire passer l’intégrité des membres avant la cargaison, l’argent ou l’orgueil."],
              ["Revenir", "Une opération n’est terminée que lorsque chacun est rentré et que le groupe est réuni."],
            ].map(([title, text], index) => <div key={title} className="border-t border-primary pt-5"><div className="flex items-center gap-3"><Crosshair className="h-4 w-4 text-primary" /><span className="font-mono text-[9px] text-muted-foreground">PROTOCOLE 0{index + 1}</span></div><h3 className="mt-4 text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-muted-foreground">{text}</p></div>)}
          </div>
        </DossierPage>

        <DossierPage>
          <SectionHeader number="06" label="Code de la famille" title="Ce qui ne se négocie pas" />
          <ol className="divide-y divide-border border-y border-border">
            {REGLES.map(([titre, texte], index) => <li key={titre} className="grid gap-3 py-6 sm:grid-cols-[3.5rem_1fr_1.2fr] sm:gap-6"><span className="font-mono text-2xl text-primary">{String(index + 1).padStart(2, "0")}</span><strong className="text-sm leading-6">{titre}</strong><p className="text-sm leading-6 text-muted-foreground">{texte}</p></li>)}
          </ol>
        </DossierPage>

        <DossierPage muted>
          <SectionHeader number="07" label="Projection sur Altis" title="Bâtir sans se perdre" />
          <div className="grid gap-10 lg:grid-cols-2">
            <div><p className="dossier-label">Priorités immédiates</p><ul className="mt-5 space-y-4 text-muted-foreground"><li>— Développer durablement la filière héroïne.</li><li>— Installer des go-fast réguliers et maîtrisés.</li><li>— Conserver le soufre et le tabac comme bases stables.</li></ul></div>
            <div><p className="dossier-label">Ambition familiale</p><ul className="mt-5 space-y-4 text-muted-foreground"><li>— Être reconnus pour notre parole et notre cohésion.</li><li>— Étendre notre influence sans créer de hiérarchie.</li><li>— Grandir sans sacrifier les liens qui nous définissent.</li></ul></div>
          </div>
        </DossierPage>

        <DossierPage>
          <SectionHeader number="08" label="Annexe de situation" title="Fiche de synthèse" />
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border border-border bg-background/25 p-6">
              <div className="flex items-center gap-3 border-b border-border pb-4"><Archive className="h-5 w-5 text-primary" /><p className="font-mono text-xs font-bold uppercase">Identité collective</p></div>
              <dl className="mt-5 grid grid-cols-[7rem_1fr] gap-y-4 text-sm">
                <dt className="text-muted-foreground">Nom</dt><dd className="font-semibold">Racailles Sans Avenir</dd>
                <dt className="text-muted-foreground">Abréviation</dt><dd className="font-semibold">RSA</dd>
                <dt className="text-muted-foreground">Territoire</dt><dd className="flex items-center gap-2 font-semibold"><MapPin className="h-3.5 w-3.5 text-primary" /> Altis</dd>
                <dt className="text-muted-foreground">Effectif</dt><dd className="font-semibold">15 membres</dd>
                <dt className="text-muted-foreground">Direction</dt><dd className="font-semibold">Collégiale</dd>
                <dt className="text-muted-foreground">Activités</dt><dd className="font-semibold">Héroïne, go-fast, soufre, tabac</dd>
              </dl>
            </div>
            <ArmaStatus className="rounded-none bg-background/25" />
          </div>
        </DossierPage>

        <footer className="dossier-sheet relative border border-t-0 border-border bg-card px-6 py-14 text-center sm:px-12 sm:py-20">
          <img src={logo} alt="Sceau RSA" width={96} height={96} className="mx-auto h-20 w-20 object-contain opacity-80" />
          <p className="mt-7 text-2xl font-bold sm:text-4xl">La famille avant le reste.</p>
          <p className="mt-3 font-mono text-[10px] font-bold uppercase text-primary">Quinze membres · aucune couronne · une seule parole</p>
          <div className="mt-12 flex items-end justify-between border-t border-border pt-6">
            <div className="text-left font-mono text-[8px] uppercase leading-4 text-muted-foreground/50"><p>Clôture du dossier</p><p>RSA / Altis / {new Date().getFullYear()}</p></div>
            <Link to={connected ? "/panel" : "/auth"} aria-label={connected ? "Ouvrir l’espace membre" : "Connexion Discord"} title={connected ? "Espace membre" : "Connexion Discord"} className="flex h-7 w-7 items-center justify-center text-muted-foreground/15 transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"><DiscordMark /></Link>
          </div>
        </footer>
      </article>
    </main>
  );
}
