export const metadata = {
  title: "Névé - S'évader en randonnée sans voiture",
  description: "Planifiez vos randonnées en train et bus avec Névé. Itinéraires sans voiture, alertes retour en temps réel et réservation simplifiée avec Trainline.",
};

import Hero from "@/components/hero-home";
import ValueProposition from "@/components/value-proposition";
import ProblemSection from "@/components/problem-section";
import HowItWorks from "@/components/how-it-works";
import SplitFeatures from "@/components/split-features";
import HikeExplorer from "@/components/hike-explorer";
import RouteProfileViewer from "@/components/route-profile-viewer";
import CuratedCollections from "@/components/curated-collections";
import PlacesCategories from "@/components/places-categories";
import FeaturesNeve from "@/components/features-planet";
import EcoComparison from "@/components/eco-comparison";
import CommunityFeed from "@/components/community-feed";
import LargeTestimonial from "@/components/large-testimonial";
import Faq from "@/components/faq";
import Cta from "@/components/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <ValueProposition />
      <ProblemSection />
      <HowItWorks />
      <SplitFeatures />
      <div id="hike-explorer">
        <HikeExplorer />
      </div>
      <RouteProfileViewer />
      <CuratedCollections />
      <PlacesCategories />
      <FeaturesNeve />
      <EcoComparison />
      <CommunityFeed />
      <LargeTestimonial />
      <Faq />
      <Cta />
    </>
  );
}
