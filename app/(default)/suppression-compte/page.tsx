import DeleteAccountClient from "./DeleteAccountClient";

/**
 * Page publique de suppression de compte.
 *
 * Son URL est déclarée dans la Play Console, section « Sécurité des données » :
 * Google impose depuis 2024, à toute application permettant de créer un compte,
 * une page de demande de suppression accessible SANS installer l'application —
 * et sans authentification, puisqu'un examinateur doit pouvoir l'ouvrir. D'où
 * une page à part entière plutôt qu'un bouton dans un espace connecté.
 */
export const metadata = {
  title: "Supprimer mon compte - Névé",
  description:
    "Supprimez votre compte Névé et l'ensemble des données associées, depuis l'application ou depuis cette page.",
  alternates: {
    /* Avec le `www` : l'apex répond 308 vers lui. Un canonique qui pointe vers
       une URL redirigée est un canonique qui se contredit. */
    canonical: "https://www.neve-rando.fr/suppression-compte",
  },
};

export default function DeleteAccountPage() {
  return (
    <section className="bg-white min-h-screen pt-28 md:pt-36 pb-24 text-[#1C1914]">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 md:px-16">
        {/* Le nom de l'application figure dans le titre, et non seulement au fil
            du texte : Google demande que la page fasse explicitement référence au
            nom de l'appli ou du développeur tel qu'il apparaît sur la fiche Play
            Store, pour qu'on ne puisse pas la confondre avec celle d'un autre
            service. */}
        <h1 className="font-bricolage font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#1C1914] tracking-tight mb-8">
          Supprimer mon compte Névé
        </h1>
        <DeleteAccountClient />
      </div>
    </section>
  );
}
