export const metadata = {
  title: "Politique de confidentialité - Névé",
  description: "Politique de confidentialité de l'application de randonnée Névé.",
  alternates: {
    canonical: "https://neve-rando.fr/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 md:px-16">
        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl mb-8">
          Politique de confidentialité
        </h1>
        <div className="text-gray-600 space-y-6 text-sm md:text-base leading-relaxed">
          <p className="text-xs text-gray-400">
            Dernière mise à jour : 8 juin 2026
          </p>
          <p>
            Chez Névé, l'une de nos priorités absolues est la protection de la vie privée de nos randonneurs. Cette Politique de confidentialité décrit la nature des informations recueillies par l'application Névé, et la manière dont nous les utilisons.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">1. Informations de géolocalisation</h2>
          <p>
            Pour assurer le bon fonctionnement du planificateur d'itinéraires et de l'alerte active « Sécurité Retour » (qui compare votre progression aux horaires théoriques des derniers bus/TER), Névé requiert l'accès à la position GPS de votre appareil. 
          </p>
          <p>
            Ces données de localisation sont traitées en temps réel uniquement durant le déroulement de votre activité de marche. Elles ne sont jamais partagées avec des tiers et ne sont pas stockées de manière permanente sur nos serveurs.
          </p>
          
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">2. Données techniques et Cookies</h2>
          <p>
            Nous recueillons des statistiques anonymes d'utilisation de notre site web pour améliorer l'expérience utilisateur. Aucune information nominative n'est collectée sans votre consentement.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">3. Redirection et Liens Affiliés</h2>
          <p>
            Lorsque vous achetez vos billets via notre redirection Trainline, Névé transmet uniquement les critères anonymes de recherche (gare de départ, gare d'arrivée, date, heure de train) via un lien affilié sécurisé. Aucune information personnelle (nom, moyen de paiement, compte Trainline) ne transite par Névé.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">4. Stockage et Sécurité</h2>
          <p>
            Vos tracés de randonnée et vos données de transport préférées sont conservés localement sur votre téléphone pour vous permettre une utilisation 100% hors-ligne. Nous mettons en œuvre des mesures de sécurité standard pour protéger vos données lors des transmissions réseau.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">5. Vos droits (RGPD)</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez à tout moment d'un droit d'accès, de rectification et d'effacement de vos données. Vous pouvez désactiver l'accès au GPS pour l'application Névé dans les paramètres de votre système d'exploitation mobile.
          </p>
        </div>
      </div>
    </section>
  );
}
