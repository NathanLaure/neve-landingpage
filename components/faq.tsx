"use client";

import { useState } from "react";
import Accordion from "@/components/accordion";

const faqData = [
  {
    id: "faq-1",
    question: "Comment réserver ses billets de train et de bus pour une randonnée avec Névé ?",
    answer: "Névé simplifie la réservation de votre sortie nature. Une fois votre itinéraire train-to-trail calculé (combinant le train TER et les navettes de bus de montagne), cliquez sur \"Réserver\". L'application vous redirige automatiquement vers notre partenaire Trainline avec toutes les gares de départ, de correspondance et d'arrivée ainsi que les dates pré-remplies. Vous achetez vos billets en 1 clic en profitant de vos cartes de réduction SNCF habituelles (Carte Avantage, abonnements régionaux, etc.).",
  },
  {
    id: "faq-2",
    question: "Comment fonctionne l'alerte « Sécurité Retour » pour ne pas rater le dernier train ?",
    answer: "L'angoisse de rester bloqué en montagne est terminée. Grâce au GPS de votre smartphone, Névé suit votre progression sur le sentier et calcule en temps réel votre vitesse de marche moyenne. Notre algorithme compare votre position avec les horaires du dernier train ou bus de montagne du soir. Si vous prenez du retard, l'application vous envoie une notification immédiate et vous propose des solutions de secours (raccourcis de sentier ou horaires de navettes alternatives) pour rentrer sereinement.",
  },
  {
    id: "faq-3",
    question: "Peut-on utiliser le GPS de randonnée de l'application hors-ligne et sans réseau ?",
    answer: "Oui, Névé est parfaitement adaptée aux zones blanches en altitude. Avant votre départ, l'application télécharge automatiquement en local la carte topographique de votre parcours ainsi que les horaires des correspondances TER et bus. Une fois en montagne, vous pouvez utiliser la géolocalisation GPS hors-ligne de votre téléphone pour vous repérer sur le tracé de randonnée et consulter vos horaires, même sans aucune connexion internet ou réseau mobile.",
  },
  {
    id: "faq-4",
    question: "L'application de randonnée Névé est-elle gratuite ? Comment vous financez-vous ?",
    answer: "Névé est une application de randonnée sans voiture 100% gratuite, sans abonnement, sans achat intégré ni publicité. Notre modèle repose sur l'affiliation : lorsque vous réservez vos billets de train ou de bus via la redirection Trainline intégrée, nous percevons une commission partenaire de la part de Trainline. Cela ne change absolument rien au prix de votre billet, qui reste identique au tarif officiel de la SNCF.",
  },
  {
    id: "faq-5",
    question: "Quelles sont les gares de départ et les destinations couvertes en France ?",
    answer: "Névé référence des milliers d'itinéraires de randonnée accessibles en transport en commun au départ de la plupart des grandes métropoles françaises (Paris, Lyon, Marseille, Grenoble, Lille, Bordeaux, Nantes, Strasbourg, etc.). Vous pouvez vous évader facilement vers les plus beaux parcs naturels et massifs montagneux (Vercors, Écrins, Pyrénées, Vosges, Jura, Cévennes, Auvergne, littoral breton), tous connectés à des gares ferroviaires ou routières.",
  },
  {
    id: "faq-6",
    question: "Les itinéraires de randonnée sans voiture conviennent-ils aux débutants et aux familles ?",
    answer: "Absolument ! Névé propose des parcours pour tous les niveaux, des balades faciles et familiales (accessibles à plat depuis la gare d'arrivée ou adaptées aux enfants) jusqu'aux randonnées sportives et techniques de plusieurs jours en altitude. Vous pouvez filtrer les itinéraires selon la distance, le dénivelé, le temps de marche et la durée globale de trajet en train depuis votre ville.",
  },
  {
    id: "faq-7",
    question: "Peut-on voyager avec son chien ou son vélo à bord des trains et bus de randonnée ?",
    answer: "Oui, la plupart des trains régionaux (TER) acceptent les vélos gratuitement (hors heures de pointe ou sur réservation selon la région) et les chiens tenus en laisse ou placés dans un sac de transport. Concernant les bus et navettes locales de montagne, les conditions d'accès varient. Névé précise ces informations pratiques (accès vélo, animaux admis) sur la fiche détaillée de chaque randonnée.",
  },
  {
    id: "faq-8",
    question: "Comment économiser la batterie de son téléphone avec le GPS de randonnée ?",
    answer: "Pour économiser votre batterie en randonnée, nous vous recommandons de mettre votre téléphone en mode avion une fois vos cartes de randonnée et vos horaires téléchargés hors-ligne. La puce GPS de votre smartphone continuera de fonctionner de manière autonome pour vous guider sur le sentier et calculer votre alerte Sécurité Retour. Pour les longues randonnées ou les micro-aventures de plusieurs jours, pensez à emporter une batterie externe (powerbank).",
  },
];

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Generate FAQ JSON-LD Schema Markup dynamically
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };

  return (
    <section id="faq" className="bg-[#fbfaf7] py-20 md:py-24 text-slate-900 w-full relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes faqFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .faq-answer-fade {
          animation: faqFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 md:px-16">
        {/* Section Header */}
        <div className="pb-12 md:pb-16 max-w-3xl">
          <h2 
            className="text-3xl md:text-[36px] font-bold text-[#292929] tracking-[-1.33px] leading-[1.2] md:leading-[46px] font-bricolage"
            style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
          >
            Des questions sur <br />
            <span className="font-extrabold text-[#eb490b]">l'aventure sans voiture ?</span>
          </h2>
          <p 
            className="mt-4 text-[18px] text-[#525252] font-medium leading-relaxed font-satoshi tracking-[-0.27px]"
          >
            Tout ce qu'il faut savoir pour planifier votre première escapade en transports en commun.
          </p>
        </div>

        {/* Mobile View: Accordion style (visible on mobile, hidden on desktop) */}
        <div className="md:hidden space-y-4">
          {faqData.map((item) => (
            <Accordion key={item.id} id={item.id} title={item.question}>
              {item.answer}
            </Accordion>
          ))}

          <div className="mt-8 pt-6 border-t border-gray-200/60 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#eb490b]">
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="font-satoshi text-[18px] font-medium text-[#525252]">
              Encore des questions ? <a href="mailto:hello@neve-app.com" className="text-[#eb490b] hover:underline font-semibold">Envoyez-nous un message</a>.
            </span>
          </div>
        </div>

        {/* Desktop View: Split layout (hidden on mobile, visible on desktop) */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Questions list */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {faqData.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(index)}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                  activeIndex === index
                    ? "bg-white border-2 border-[#0f172b] shadow-[4px_4px_0px_0px_#0f172a] translate-x-1"
                    : "bg-white/70 border-gray-200/60 shadow-xs hover:bg-white/95 hover:border-gray-300 hover:translate-x-1"
                }`}
              >
                <span 
                  className={`font-bricolage font-semibold text-base tracking-[-0.4px] leading-[24px] transition-colors duration-200 ${
                    activeIndex === index ? "text-[#eb490b]" : "text-[#101828]"
                  }`}
                  style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
                >
                  {item.question}
                </span>
                <span className={`ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border border-gray-100 shadow-2xs transition-transform duration-300 ${activeIndex === index ? "rotate-90 text-[#eb490b]" : "text-gray-400"}`}>
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            ))}
          </div>

          {/* Right Column: Active Answer Card */}
          <div className="md:col-span-7 md:sticky md:top-28">
            <div 
              key={activeIndex}
              className="bg-white border-2 border-[#0f172b] rounded-[24px] p-8 shadow-[4px_4px_0px_0px_#0f172a] flex flex-col justify-between faq-answer-fade"
            >
              <div>
                <h3 
                  className="font-bricolage font-bold text-[#292929] text-xl lg:text-2xl tracking-[-0.6px] leading-[1.3] mb-5"
                  style={{ fontVariationSettings: "'opsz' 14, 'wdth' 100" }}
                >
                  {faqData[activeIndex].question}
                </h3>
                <div className="w-12 h-1 bg-[#eb490b] rounded-full mb-5" />
                <p className="font-satoshi text-[#525252] text-[18px] leading-[26px] font-medium">
                  {faqData[activeIndex].answer}
                </p>
              </div>

              {/* Bottom Tip Decorator */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#eb490b]">
                  <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="font-satoshi text-[18px] font-medium text-[#525252]">
                  Encore des questions ? <a href="mailto:hello@neve-app.com" className="text-[#eb490b] hover:underline font-semibold">Envoyez-nous un message</a>.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
