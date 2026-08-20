"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/button";
import CustomLink from "@/components/ui/link";
import { useAuth } from "@/context/AuthContext";

/** Ce que la suppression emporte, énuméré avant de la déclencher et non après. */
const DELETED_ITEMS = [
  "votre compte et vos identifiants de connexion (adresse e-mail, mot de passe, comptes Google, Apple ou Facebook associés)",
  "votre nom et votre photo de profil",
  "vos aventures planifiées, leurs trajets et leurs liens de partage",
  "vos randonnées favorites et vos avis",
  "votre adresse de domicile et vos abonnements de transport déclarés",
  "vos randonnées téléchargées hors ligne et vos préférences de recherche, effacées de votre téléphone",
];

/**
 * Ce qui subsiste, et pour combien de temps.
 *
 * Google exige cette liste au même titre que la précédente : une page qui
 * n'énumère que ce qu'elle supprime laisse croire qu'il ne reste rien, ce qui
 * n'est jamais tout à fait vrai d'un système sauvegardé.
 */
const RETAINED_ITEMS = [
  {
    what: "Sauvegardes automatiques",
    detail:
      "Nos bases de données sont sauvegardées de façon chiffrée. Des copies résiduelles de vos données peuvent y subsister jusqu'à 30 jours après la suppression, le temps que ces sauvegardes soient écrasées à leur tour. Elles ne sont ni consultées ni exploitées.",
  },
  {
    what: "Statistiques du site",
    detail:
      "Les mesures d'audience de neve-rando.fr sont anonymes et ne sont rattachées à aucun compte.",
  },
];

/**
 * Même convention que l'application : un seul objet par compte, sans extension.
 * Le fichier passe par l'API de stockage et non par la fonction SQL, seule
 * façon d'effacer l'image elle-même et pas uniquement sa ligne d'index.
 */
function avatarPath(userId: string): string {
  return `${userId}/avatar`;
}

export default function DeleteAccountClient() {
  const { user, isLoading } = useAuth();

  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const handleDelete = async () => {
    if (!user || isDeleting) return;

    setIsDeleting(true);
    setError(null);

    /* Un échec ici ne bloque pas la suite : le droit à l'effacement ne peut pas
       dépendre d'un appel de stockage capricieux, et la fonction SQL retire la
       ligne correspondante de toute façon. */
    const { error: avatarError } = await supabase.storage
      .from("avatars")
      .remove([avatarPath(user.id)]);
    if (avatarError) {
      console.warn("Photo de profil non supprimée :", avatarError.message);
    }

    /* `delete_own_account` ne prend aucun paramètre et ne lit que `auth.uid()` :
       elle ne peut supprimer que l'appelant. Tout le reste — profil, aventures,
       favoris, avis — part en cascade avec la ligne d'authentification. */
    const { error: rpcError } = await supabase.rpc("delete_own_account");

    if (rpcError) {
      setError(
        "La suppression n'a pas abouti. Réessayez dans un instant, ou écrivez-nous et nous la ferons pour vous.",
      );
      setIsDeleting(false);
      return;
    }

    /* `local` : le compte n'existe plus côté serveur, chercher à y révoquer la
       session ne rendrait qu'une erreur sur un travail déjà fait. */
    await supabase.auth.signOut({ scope: "local" });
    setIsDeleting(false);
    setIsDone(true);
  };

  const body = "font-satoshi text-[#575246] space-y-6 text-sm sm:text-base leading-relaxed";

  if (isDone) {
    return (
      <div className={body}>
        <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          <div className="flex-1">
            <p className="font-bold">Votre compte a été supprimé.</p>
            <p className="mt-1">
              L&apos;ensemble des données associées a été effacé de nos serveurs. Les liens de
              partage que vous aviez envoyés ne fonctionnent plus.
            </p>
          </div>
        </div>
        <p>
          Merci d&apos;avoir marché avec nous. Si vous changez d&apos;avis, vous pouvez créer un
          nouveau compte à tout moment depuis l&apos;application.
        </p>
      </div>
    );
  }

  return (
    <div className={body}>
      <p>
        Névé est une application de randonnée sans voiture éditée par Névé Rando. Vous pouvez
        supprimer votre compte Névé et l&apos;ensemble des données qui lui sont associées, à tout
        moment et sans avoir à vous justifier. La suppression est immédiate et définitive : rien
        ne peut être restauré.
      </p>

      <div>
        <h2 className="font-bricolage font-bold text-xl sm:text-2xl text-[#1C1914] tracking-tight mt-8 mb-2">
          Comment demander la suppression
        </h2>
        <p>Deux chemins, au choix. Le premier est le plus rapide.</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 marker:font-bold marker:text-[#1C1914]">
          <li>
            <span className="font-bold text-[#1C1914]">Depuis l&apos;application Névé</span> —
            ouvrez l&apos;onglet <span className="font-bold text-[#1C1914]">Profil</span>, puis{" "}
            <span className="font-bold text-[#1C1914]">Paramètres</span>, et choisissez{" "}
            <span className="font-bold text-[#1C1914]">Supprimer mon compte</span> tout en bas de
            la page. Une confirmation vous est demandée, puis la suppression est effectuée
            immédiatement.
          </li>
          <li>
            <span className="font-bold text-[#1C1914]">Depuis cette page</span> — connectez-vous
            ci-dessous et confirmez. Si vous n&apos;avez plus accès à votre compte, écrivez-nous à{" "}
            <CustomLink href="mailto:info@neve-rando.fr?subject=Demande%20de%20suppression%20de%20compte">
              info@neve-rando.fr
            </CustomLink>{" "}
            depuis l&apos;adresse associée au compte : nous procéderons à la suppression sous 30
            jours, comme le prévoit le RGPD.
          </li>
        </ol>
      </div>

      <div>
        <h2 className="font-bricolage font-bold text-xl sm:text-2xl text-[#1C1914] tracking-tight mt-8 mb-2">
          Ce qui est supprimé
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          {DELETED_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Google renvoie aussi vers cette page depuis le champ « Gérer les données
          de l'appli », qui promet la suppression d'une partie des données sans
          fermer le compte. Sans cette section, le lecteur venu pour ça repartirait
          avec la seule option du tout ou rien. */}
      <div>
        <h2 className="font-bricolage font-bold text-xl sm:text-2xl text-[#1C1914] tracking-tight mt-8 mb-2">
          Supprimer une partie de vos données, sans fermer votre compte
        </h2>
        <p>
          Vous n&apos;êtes pas obligé de tout effacer. Depuis l&apos;application, chacun de ces
          éléments se supprime séparément, et la suppression est immédiate :
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5">
          <li>
            <span className="font-bold text-[#1C1914]">Une aventure planifiée</span> — ouvrez sa
            fiche depuis l&apos;onglet Aventures, puis « Annuler l&apos;aventure » dans le menu
            d&apos;options. Son lien de partage cesse aussitôt de fonctionner.
          </li>
          <li>
            <span className="font-bold text-[#1C1914]">Votre photo de profil</span> — Profil, puis
            appuyez sur votre photo et choisissez « Supprimer ».
          </li>
          <li>
            <span className="font-bold text-[#1C1914]">Une randonnée favorite</span> — depuis sa
            fiche ou depuis l&apos;onglet Favoris.
          </li>
          <li>
            <span className="font-bold text-[#1C1914]">Vos randonnées hors ligne</span> — Profil,
            Paramètres, Randonnées hors ligne : une par une ou toutes d&apos;un coup.
          </li>
          <li>
            <span className="font-bold text-[#1C1914]">
              Votre adresse de domicile et vos abonnements de transport
            </span>{" "}
            — modifiables ou effaçables depuis Profil, Paramètres.
          </li>
        </ul>
        <p className="mt-4">
          Pour toute autre demande portant sur une partie de vos données, écrivez-nous à{" "}
          <CustomLink href="mailto:info@neve-rando.fr?subject=Suppression%20partielle%20de%20mes%20donn%C3%A9es">
            info@neve-rando.fr
          </CustomLink>
          .
        </p>
      </div>

      <div>
        <h2 className="font-bricolage font-bold text-xl sm:text-2xl text-[#1C1914] tracking-tight mt-8 mb-2">
          Ce qui est conservé, et pour combien de temps
        </h2>
        <dl className="space-y-4">
          {RETAINED_ITEMS.map((item) => (
            <div key={item.what}>
              <dt className="font-bold text-[#1C1914]">{item.what}</dt>
              <dd className="mt-1">{item.detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4">
          Aucune autre donnée n&apos;est conservée : votre compte et tout ce qui s&apos;y rattache
          disparaissent de nos bases au moment de la suppression.
        </p>
      </div>

      <div>
        <h2 className="font-bricolage font-bold text-xl sm:text-2xl text-[#1C1914] tracking-tight mt-8 mb-2">
          Supprimer mon compte maintenant
        </h2>

        {isLoading ? (
          <p className="flex items-center gap-2 text-[#7A7363]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Vérification de votre session…
          </p>
        ) : !user ? (
          <>
            <p>
              Connectez-vous pour supprimer votre compte ici. Nous demandons cette connexion pour
              une seule raison : nous assurer que la demande vient bien de vous.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Button href="/signin">Se connecter</Button>
              <CustomLink
                variant="arrow"
                href="mailto:info@neve-rando.fr?subject=Demande%20de%20suppression%20de%20compte&body=Bonjour%20l%27%C3%A9quipe%20N%C3%A9v%C3%A9%2C%0A%0AJe%20souhaite%20la%20suppression%20de%20mon%20compte%20et%20de%20mes%20donn%C3%A9es.%0A%0AAdresse%20e-mail%20du%20compte%20%3A%20"
              >
                Je n&apos;ai plus accès à mon compte
              </CustomLink>
            </div>
          </>
        ) : (
          <>
            <p>
              Vous êtes connecté avec{" "}
              <span className="font-bold text-[#1C1914]">{user.email}</span>.
            </p>

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {/* Deux temps plutôt qu'un : le premier appui n'engage rien, il ne
                fait qu'ouvrir la question. C'est ce qui sépare une action
                irréversible d'un geste de trop. */}
            {!isConfirming ? (
              <div className="mt-5">
                <Button variant="secondary" onClick={() => setIsConfirming(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer mon compte
                </Button>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-[#D6D0C2] bg-[#FAF8F5] p-5">
                <p className="font-bold text-[#1C1914]">
                  Confirmez-vous la suppression définitive de votre compte ?
                </p>
                <p className="mt-1 text-sm text-[#575246]">
                  Cette action ne peut pas être annulée.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Suppression…
                      </>
                    ) : (
                      "Oui, supprimer définitivement"
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsConfirming(false)}
                    disabled={isDeleting}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <h2 className="font-bricolage font-bold text-xl sm:text-2xl text-[#1C1914] tracking-tight mt-8 mb-2">
          Une question ?
        </h2>
        {/* `default` et non `arrow` au fil du texte : la variante à flèche pousse
            une icône après le lien, ce qui se lit comme un appel à l'action et non
            comme une adresse citée dans une phrase. */}
        <p>
          Écrivez-nous à{" "}
          <CustomLink href="mailto:info@neve-rando.fr?subject=Suppression%20de%20compte">
            info@neve-rando.fr
          </CustomLink>
          . Nous traitons chaque demande sous 30 jours, comme le prévoit le RGPD.
        </p>
      </div>
    </div>
  );
}
