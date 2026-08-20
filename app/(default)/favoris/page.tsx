import { Metadata } from "next";
import FavoritesClient from "./FavoritesClient";

export const metadata: Metadata = {
  title: "Mes favoris - Névé",
  description: "Retrouvez toutes vos randonnées favorites enregistrées sur Névé et synchronisées avec l'application mobile.",
  alternates: {
    canonical: "https://www.neve-rando.fr/favoris",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default function FavoritesPage() {
  return <FavoritesClient />;
}
