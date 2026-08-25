export const metadata = {
  title: "Conditions Générales d'Utilisation - Névé",
  description: "Conditions Générales d'Utilisation de l'application Névé.",
  alternates: {
    canonical: "https://www.neve-rando.fr/terms",
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

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">4. Achat de titres de transport</h2>
          <p>
            Névé ne vend pas de titres de transport. Le service peut vous orienter vers les sites
            ou applications des vendeurs de billets, où l&apos;achat s&apos;effectue selon leurs
            propres conditions de vente.
          </p>
          <p>
            Névé ne gère aucun paiement, n&apos;émet aucun billet physique ou numérique, et ne peut
            intervenir sur les demandes de remboursement ou d&apos;annulation, qui relèvent
            exclusivement du vendeur et du transporteur concernés.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">5. Absence d&apos;affiliation</h2>
          <p>
            Névé est un service indépendant. Névé n&apos;est affilié, associé, autorisé, approuvé
            ni sponsorisé par aucune entreprise, autorité organisatrice de mobilité, collectivité
            ou entité de transport, ni par aucun vendeur de titres de transport. Sont notamment
            concernés, sans que cette liste soit limitative : la SNCF et ses filiales,
            Île-de-France Mobilités, la RATP, les régions et leurs réseaux TER, ainsi que les
            plateformes de vente de billets.
          </p>
          <p>
            Les noms, marques, logos et dénominations cités sur ce site ou dans l&apos;application
            appartiennent à leurs titulaires respectifs. Ils ne sont mentionnés qu&apos;à des fins
            d&apos;information, pour désigner un réseau, une ligne, une gare ou un titre de
            transport existants, et leur emploi n&apos;implique aucun lien commercial, aucun
            partenariat et aucune approbation de la part de leurs titulaires.
          </p>
          <p>
            Les horaires, dessertes et conditions tarifaires proviennent de sources publiques ou
            de données ouvertes. Ils sont fournis à titre indicatif : seules les informations
            publiées par le transporteur ou l&apos;autorité compétente font foi.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">6. Modification des Services</h2>
          <p>
            Nous nous réservons le droit de modifier, d&apos;interrompre temporairement ou
            définitivement le service (ou toute partie de celui-ci) sans préavis.
          </p>
        </div>
      </div>
    </section>
  );
}
