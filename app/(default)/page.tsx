export const metadata = {
  title: "Névé - S'évader en randonnée sans voiture",
  description: "Planifiez vos randonnées en train et bus avec Névé. Itinéraires sans voiture, alertes retour en temps réel et réservation simplifiée avec Trainline.",
};

import Hero from "@/components/hero-home";
import ProblemSection from "@/components/problem-section";
import HowItWorks from "@/components/how-it-works";
import FeaturesNeve from "@/components/features-planet";
import LargeTestimonial from "@/components/large-testimonial";
import Faq from "@/components/faq";
import Cta from "@/components/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <FeaturesNeve />
      <LargeTestimonial />
      <Faq />
      <Cta />
    </>
  );
}
