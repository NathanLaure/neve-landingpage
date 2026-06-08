import Accordion from "@/components/accordion";

export default function Faq() {
  return (
    <section className="bg-white py-12 md:py-20 border-b border-gray-100">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center pb-12 md:pb-16">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Des questions sur <br />
            <span className="text-[color:var(--color-brand-orange)] font-extrabold">l'aventure sans voiture ?</span>
          </h2>
          <p className="mt-4 text-base text-gray-500">
            Tout ce qu'il faut savoir pour planifier votre première escapade en transports en commun.
          </p>
        </div>

        {/* Accordions List */}
        <div className="space-y-4">
          <Accordion id="faq-1" title="Comment fonctionne la redirection vers Trainline ?">
            Névé calcule votre itinéraire combiné (liaison TER + bus locaux). Une fois votre parcours choisi, vous cliquez sur "Réserver" et l'application ouvre l'app ou le site Trainline avec votre recherche entièrement pré-remplie (dates, gares de départ et d'arrivée). Vous n'avez plus qu'à valider le panier avec vos abonnements et réductions habituels.
          </Accordion>

          <Accordion id="faq-2" title="Comment fonctionne l'alerte « Sécurité Retour » ?">
            Grâce à votre puce GPS mobile, Névé compare votre progression sur le sentier avec les horaires du dernier train ou bus du soir. Si notre algorithme détecte un retard qui menace votre correspondance, l'application vous envoie une notification immédiate pour vous inviter à presser le pas ou pour vous proposer un plan B (un bus alternatif ou un autre itinéraire).
          </Accordion>

          <Accordion id="faq-3" title="Puis-je utiliser l'application hors-ligne en montagne ?">
            Absolument ! Avant de partir, l'application télécharge automatiquement la carte topographique de la randonnée et la fiche horaire des correspondances en local sur votre téléphone. Vous pouvez vous repérer par GPS et consulter vos horaires même sans aucune connexion internet en altitude.
          </Accordion>

          <Accordion id="faq-4" title="L'application est-elle payante ?">
            Non, Névé est 100% gratuite au téléchargement et pour la recherche d'itinéraires. Notre modèle repose sur l'affiliation : lorsque vous achetez vos billets de train via la redirection Trainline depuis notre app, Trainline nous reverse une petite commission sans que cela ne change d'un centime le prix de votre billet.
          </Accordion>

          <Accordion id="faq-5" title="Quelles gares de départ et destinations sont couvertes ?">
            Névé propose des itinéraires de randonnée au départ de toutes les grandes métropoles françaises (Paris, Lyon, Marseille, Grenoble, Lille, Bordeaux, etc.) vers les principaux parcs naturels (Vercors, Écrins, Pyrénées, Vosges, Cévennes) et les sentiers régionaux accessibles en transports collectifs.
          </Accordion>
        </div>
      </div>
    </section>
  );
}
