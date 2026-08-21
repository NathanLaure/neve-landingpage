import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import SharedAdventureGate from "@/components/share/shared-adventure-gate";
import type { UserAdventure } from "@/types/adventure";

interface Props {
  params: Promise<{ token: string }>;
}

/**
 * Aperçu d'une aventure partagée : titre, image, dates. Rien d'autre.
 *
 * C'est la seule lecture qui reste possible sans compte, et elle ne sert qu'à
 * composer la vignette du lien — celle qu'un robot sans session vient chercher
 * quand on colle l'adresse dans une messagerie. La feuille de route elle-même
 * passe par `get_shared_adventure`, réservée aux comptes connectés, donc
 * inaccessible depuis ce composant serveur qui est toujours anonyme.
 *
 * Le point de départ n'en fait volontairement pas partie : c'est une adresse de
 * rue, souvent le domicile de celui qui partage, et elle finissait jusqu'ici
 * dans la description méta de la page — donc indexable.
 */
async function fetchSharedPreview(token: string) {
  const { data } = await supabase
    .rpc("get_shared_adventure_preview", { p_token: token })
    .maybeSingle();

  return { adventure: data as UserAdventure | null };
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
    const { adventure } = await fetchSharedPreview(token);

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
    /* Plus de point de départ dans la description : l'aperçu ne le connaît plus,
       et une adresse de domicile n'a rien à faire dans une balise indexable. */
    const description = dateFormatted
      ? `On vous invite à découvrir « ${hikeTitle} » le ${dateFormatted} : horaires de train, correspondances et itinéraire, sans voiture.`
      : `On vous invite à découvrir « ${hikeTitle} » : horaires de train, correspondances et itinéraire, sans voiture.`;
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

  /* Le contenu se charge côté client : c'est là que vit la session, et donc le
     seul endroit où « réservé aux connectés » peut être autre chose qu'un
     affichage. Le serveur, lui, est toujours anonyme. */
  return <SharedAdventureGate token={token} />;
}
