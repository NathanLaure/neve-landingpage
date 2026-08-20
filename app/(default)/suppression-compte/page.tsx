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
    canonical: "https://neve-rando.fr/suppression-compte",
  },
};

export default function DeleteAccountPage() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 md:px-16">
        {/* Le nom de l'application figure dans le titre, et non seulement au fil
            du texte : Google demande que la page fasse explicitement référence au
            nom de l'appli ou du développeur tel qu'il apparaît sur la fiche Play
            Store, pour qu'on ne puisse pas la confondre avec celle d'un autre
            service. */}
        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl mb-8">
          Supprimer mon compte Névé
        </h1>
        <DeleteAccountClient />
      </div>
    </section>
  );
}
