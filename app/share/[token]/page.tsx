import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import SharedAdventureView from "@/components/share/shared-adventure-view";
import type { UserAdventure } from "@/types/adventure";

interface Props {
  params: Promise<{ token: string }>;
}

/**
 * Lit l'aventure désignée par un jeton de partage.
 *
 * Passe par `get_shared_adventure` plutôt que par la table : la politique de
 * lecture publique qui existait auparavant disait « toute ligne pourvue d'un
 * jeton est lisible », sans jamais vérifier lequel — RLS ne voit pas le `WHERE`
 * de la requête. Elle ouvrait donc la table entière à quiconque détient la clé
 * anonyme, laquelle est publique par construction.
 *
 * La fonction ne rend qu'une ligne, et seulement les colonnes que cette page
 * affiche : ni identifiant de compte, ni coordonnées de départ, ni voyageurs.
 */
async function fetchSharedAdventure(token: string) {
  const { data, error } = await supabase
    .rpc("get_shared_adventure", { p_token: token })
    .maybeSingle();

  return { adventure: data as UserAdventure | null, error };
}

// Format date into French string for meta descriptions
function formatMetadataDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(d);
    }
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;

  const defaultTitle = "Feuille de route — Névé";
  const defaultDesc =
    "Consultez les horaires de transport et les détails de votre randonnée sans voiture avec Névé.";
  const defaultImage =
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop";

  try {
    const { adventure } = await fetchSharedAdventure(token);

    if (!adventure) {
      return {
        title: { absolute: defaultTitle },
        description: defaultDesc,
        openGraph: {
          title: defaultTitle,
          description: defaultDesc,
          url: `https://www.neve-rando.fr/share/${token}`,
          siteName: "Névé",
          locale: "fr_FR",
          type: "website",
          images: [
            {
              url: defaultImage,
              width: 1200,
              height: 630,
              alt: "Névé — Randonnée sans voiture",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: defaultTitle,
          description: defaultDesc,
          images: [defaultImage],
        },
      };
    }

    const hikeTitle = adventure.hike_snapshot?.title || "Randonnée sans voiture";
    const dateFormatted = formatMetadataDate(adventure.outward_date);
    const title = `${hikeTitle} — Feuille de route Névé`;
    const description = dateFormatted
      ? `Consultez les horaires de train et l'itinéraire pour la rando prévue le ${dateFormatted} au départ de ${adventure.departure_station_name}.`
      : `Consultez les horaires de train et l'itinéraire pour la rando au départ de ${adventure.departure_station_name}.`;
    const imageUrl =
      adventure.hike_snapshot?.imageUrl ||
      adventure.hike_snapshot?.cover_image_url ||
      defaultImage;

    return {
      title: { absolute: title },
      description,
      alternates: {
        canonical: `https://www.neve-rando.fr/share/${token}`,
      },
      openGraph: {
        title,
        description,
        url: `https://www.neve-rando.fr/share/${token}`,
        siteName: "Névé",
        locale: "fr_FR",
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: hikeTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: { absolute: defaultTitle },
      description: defaultDesc,
      openGraph: {
        title: defaultTitle,
        description: defaultDesc,
        url: `https://www.neve-rando.fr/share/${token}`,
        siteName: "Névé",
        locale: "fr_FR",
        type: "website",
        images: [
          {
            url: defaultImage,
            width: 1200,
            height: 630,
            alt: "Névé — Randonnée sans voiture",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: defaultTitle,
        description: defaultDesc,
        images: [defaultImage],
      },
    };
  }
}

export default async function SharedAdventurePage({ params }: Props) {
  const { token } = await params;

  const { adventure, error } = await fetchSharedAdventure(token);

  if (error || !adventure) {
    notFound();
  }

  return <SharedAdventureView adventure={adventure} />;
}
