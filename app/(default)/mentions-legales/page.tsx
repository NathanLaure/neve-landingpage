import type { Metadata } from "next";
import CustomLink from "@/components/ui/link";

/**
 * Identité de l'éditeur, rassemblée ici plutôt que dispersée dans le texte.
 *
 * Une seule valeur à corriger, un seul endroit. Aucune n'est inventée : le nom
 * vient de la clé de signature de l'application, le domaine et l'adresse de
 * contact du dépôt, l'hébergeur de la plateforme de déploiement.
 *
 * `adressePostale` est volontairement vide. L'article 6 III-2 de la LCEN
 * permet à une personne physique éditant un site à titre non professionnel de
 * ne pas publier ses coordonnées, à condition de les avoir communiquées à son
 * hébergeur — c'est ce que la page indique tant que le champ reste vide.
 * Dès qu'une structure sera immatriculée, il faudra renseigner l'adresse et
 * ajouter le SIREN.
 */
const EDITEUR = {
  nom: "Nathan Laure",
  statut: "Personne physique, non immatriculée au registre du commerce",
  adressePostale: "",
  email: "info@neve-rando.fr",
  directeurPublication: "Nathan Laure",
  site: "neve-rando.fr",
};

const HEBERGEUR = {
  nom: "Vercel Inc.",
  adresse: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  site: "https://vercel.com",
};

/** Prestataire de base de données, distinct de l'hébergement du site. */
const BASE_DE_DONNEES = {
  nom: "Supabase",
  site: "https://supabase.com",
};

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Éditeur, directeur de la publication, hébergeur et absence d'affiliation du site Névé.",
  alternates: { canonical: "https://www.neve-rando.fr/mentions-legales" },
};

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">{titre}</h2>
      {children}
    </>
  );
}

export default function MentionsLegalesPage() {
  return (
    <section className="bg-white min-h-screen pt-24 md:pt-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 md:px-16 pb-24">
        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl mb-8">
          Mentions légales
        </h1>

        <div className="font-satoshi text-[#525252] text-[16px] leading-relaxed space-y-3">
          <Section titre="Éditeur du site">
            <p>
              Le site {EDITEUR.site} et l&apos;application mobile Névé sont édités par{" "}
              {EDITEUR.nom}.
            </p>
            <p>{EDITEUR.statut}.</p>
            {EDITEUR.adressePostale ? (
              <p>Adresse : {EDITEUR.adressePostale}.</p>
            ) : (
              <p>
                Conformément à l&apos;article 6 III-2 de la loi n° 2004-575 du 21 juin 2004 pour
                la confiance dans l&apos;économie numérique, l&apos;éditeur, personne physique,
                a choisi de ne pas rendre publiques ses coordonnées personnelles. Celles-ci ont
                été communiquées à l&apos;hébergeur du site, qui les tient à la disposition de
                l&apos;autorité judiciaire.
              </p>
            )}
            <p>
              Contact :{" "}
              <a
                href={`mailto:${EDITEUR.email}`}
                className="font-semibold text-[color:var(--color-brand-orange)] hover:underline"
              >
                {EDITEUR.email}
              </a>
            </p>
          </Section>

          <Section titre="Directeur de la publication">
            <p>{EDITEUR.directeurPublication}.</p>
          </Section>

          <Section titre="Hébergement">
            <p>
              Le site est hébergé par {HEBERGEUR.nom}, {HEBERGEUR.adresse} —{" "}
              <a
                href={HEBERGEUR.site}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[color:var(--color-brand-orange)] hover:underline"
              >
                {HEBERGEUR.site}
              </a>
              .
            </p>
            <p>
              Les données du service sont hébergées par {BASE_DE_DONNEES.nom} —{" "}
              <a
                href={BASE_DE_DONNEES.site}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[color:var(--color-brand-orange)] hover:underline"
              >
                {BASE_DE_DONNEES.site}
              </a>
              .
            </p>
          </Section>

          {/* La même clause que les CGU, à l'endroit où on la cherche. */}
          <Section titre="Absence d'affiliation">
            <p>
              Névé est un service indépendant. Névé n&apos;est affilié, associé, autorisé,
              approuvé ni sponsorisé par aucune entreprise, autorité organisatrice de mobilité,
              collectivité ou entité de transport, ni par aucun vendeur de titres de transport.
              Sont notamment concernés, sans que cette liste soit limitative : la SNCF et ses
              filiales, Île-de-France Mobilités, la RATP, les régions et leurs réseaux TER, ainsi
              que les plateformes de vente de billets.
            </p>
            <p>
              Les noms, marques, logos et dénominations cités sur ce site ou dans
              l&apos;application appartiennent à leurs titulaires respectifs. Ils ne sont
              mentionnés qu&apos;à des fins d&apos;information, pour désigner un réseau, une
              ligne, une gare ou un titre de transport existants, et leur emploi n&apos;implique
              aucun lien commercial, aucun partenariat et aucune approbation de la part de leurs
              titulaires.
            </p>
          </Section>

          <Section titre="Propriété intellectuelle">
            <p>
              La structure du site, ses textes, sa charte graphique et ses développements sont la
              propriété de l&apos;éditeur. Toute reproduction ou représentation, totale ou
              partielle, sans autorisation écrite préalable, est interdite.
            </p>
            <p>
              Les tracés de randonnée et les données de transport proviennent de sources publiques
              ou de données ouvertes, dont les licences respectives s&apos;appliquent. Les fonds
              cartographiques sont fournis par Mapbox et OpenStreetMap, dont les contributeurs
              sont crédités sur la carte.
            </p>
          </Section>

          <Section titre="Exactitude des informations">
            <p>
              Les horaires, dessertes, distances, dénivelés et durées sont fournis à titre
              indicatif. Seules les informations publiées par le transporteur ou l&apos;autorité
              compétente font foi. La randonnée comporte des risques : chaque pratiquant reste
              responsable de son itinéraire, de son équipement et de son évaluation des
              conditions.
            </p>
          </Section>

          <Section titre="Signalement d'un contenu">
            <p>
              Pour signaler un contenu inexact, une erreur sur un itinéraire ou une atteinte à vos
              droits, écrivez à{" "}
              <a
                href={`mailto:${EDITEUR.email}`}
                className="font-semibold text-[color:var(--color-brand-orange)] hover:underline"
              >
                {EDITEUR.email}
              </a>
              . Toute demande est traitée dans les meilleurs délais.
            </p>
          </Section>

          <Section titre="Autres documents">
            <p>
              <CustomLink
                href="/terms"
                className="font-semibold text-[color:var(--color-brand-orange)] hover:underline"
              >
                Conditions générales d&apos;utilisation
              </CustomLink>{" "}
              ·{" "}
              <CustomLink
                href="/privacy"
                className="font-semibold text-[color:var(--color-brand-orange)] hover:underline"
              >
                Politique de confidentialité
              </CustomLink>
            </p>
          </Section>
        </div>
      </div>
    </section>
  );
}
