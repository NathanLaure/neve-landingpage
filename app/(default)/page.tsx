export const metadata = {
  title: "Névé - S'évader en randonnée sans voiture",
  description: "Planifiez vos randonnées en train et bus avec Névé. Itinéraires sans voiture, alertes retour en temps réel et réservation simplifiée avec Trainline.",
};

import Hero from "@/components/hero-home";
import PromoSection from "@/components/promo-section";
import EscapeCity from "@/components/escape-city";
import HowItWorks from "@/components/how-it-works";
import SplitFeatures from "@/components/split-features";
import CuratedCollections from "@/components/curated-collections";
import LargeTestimonial from "@/components/large-testimonial";
import Faq from "@/components/faq";
import Cta from "@/components/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <PromoSection />
      <EscapeCity />
      <HowItWorks />
      <SplitFeatures />
      <LargeTestimonial />
      <CuratedCollections />
      <Faq />
      <Cta />
    </>
  );
}
