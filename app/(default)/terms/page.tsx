export const metadata = {
  title: "Conditions Générales d'Utilisation - Névé",
  description: "Conditions Générales d'Utilisation de l'application Névé.",
  alternates: {
    canonical: "https://neve-rando.fr/terms",
  },
};

export default function TermsPage() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 md:px-16">
        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl mb-8">
          Conditions Générales d'Utilisation
        </h1>
        <div className="text-gray-600 space-y-6 text-sm md:text-base leading-relaxed">
          <p className="text-xs text-gray-400">
            Dernière mise à jour : 8 juin 2026
          </p>
          <p>
            Bienvenue sur Névé. En utilisant notre application mobile ou notre site internet, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation (CGU).
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">1. Objet du Service</h2>
          <p>
            Névé est un planificateur d'itinéraires de randonnée et de transports visant à faciliter l'accès à la montagne sans voiture. Nous proposons des suggestions d'itinéraires combinant marche, train (TER) et bus locaux.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">2. Responsabilité relative aux Horaires</h2>
          <p>
            Bien que nous fassions nos meilleurs efforts pour maintenir les données à jour, les grilles horaires des transporteurs (SNCF, transporteurs régionaux et navettes locales) sont indicatives et théoriques. 
          </p>
          <p>
            Névé ne peut être tenu responsable en cas de retard, d'annulation, de grève ou de suppression de trajets par les compagnies de transport. Il revient à l'utilisateur de vérifier ses correspondances en temps réel avant d'entamer son retour.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">3. Sécurité en Montagne</h2>
          <p>
            Les parcours de randonnée suggérés dans l'application se déroulent en milieu naturel. L'utilisateur assume l'entière responsabilité de sa sécurité. Il lui incombe d'évaluer ses capacités physiques, de consulter les prévisions météorologiques locales, de porter des chaussures de marche adaptées et d'emporter l'équipement de sécurité requis.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">4. Réservation de Billets (Affiliation)</h2>
          <p>
            Névé redirige les utilisateurs vers le site ou l'application de Trainline pour l'achat de titres de transport TER/Intercités via un lien affilié. 
          </p>
          <p>
            L'achat de billets s'effectue exclusivement sur la plateforme sécurisée de Trainline et est régi par ses propres conditions de vente. Névé ne gère aucun paiement, n'émet aucun billet physique ou numérique, et ne peut intervenir sur les demandes de remboursement ou d'annulation.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">5. Modification des Services</h2>
          <p>
            Nous nous réservons le droit de modifier, d'interrompre temporairement ou définitivement le service (ou toute partie de celui-ci) sans préavis.
          </p>
        </div>
      </div>
    </section>
  );
}
