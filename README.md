<p align="center">
  <img src="public/logo-typo.svg" alt="Névé" width="180">
</p>

<p align="center">
  <strong>S'évader en randonnée, sans voiture.</strong><br>
  Site et application web de Névé.
</p>

<p align="center">
  <a href="https://www.neve-rando.fr">neve-rando.fr</a> ·
  <a href="https://apps.apple.com/app/id6742337775">iOS</a> ·
  <a href="https://play.google.com/store/apps/details?id=com.neve.app">Android</a>
</p>

---

## Le projet

Planifier une sortie nature quand on n'a pas de voiture oblige à jongler entre
quatre et huit applications : les horaires de train d'un côté, les tracés de
randonnée de l'autre, la liaison entre la gare et le sentier, la météo, et la
question de savoir si l'abonnement couvre le trajet.

La plupart du temps, on renonce.

Névé ne propose que des randonnées qui commencent et finissent à une gare, et
met le tracé et les horaires sur le même écran. On choisit une sortie en deux
minutes, on part le lendemain avec son abonnement de transport.

## Ce que fait le site

**Faire découvrir.** Une page par ville — « randonnées sans voiture autour de
Rambouillet » — pour retrouver Névé au moment où l'on cherche une idée de
sortie.

**Laisser essayer.** La recherche, les fiches de randonnée et les favoris se
consultent depuis un navigateur, sans rien installer. On regarde d'abord, on
télécharge ensuite.

**Accompagner.** Au moment de planifier vraiment, on passe sur l'application :
c'est là que se font le téléchargement des cartes hors-ligne et le suivi pendant
la marche, là où le réseau ne suit plus.

## Les pages

| | |
| --- | --- |
| `/` | Présentation du produit |
| `/explorer` | Recherche d'itinéraires |
| `/rando/[id]` | Fiche d'une randonnée |
| `/randos-sans-voiture/[ville]` | Randonnées accessibles depuis une ville |
| `/favoris` · `/profil` | Espace personnel |
| `/share/[token]` | Partage d'un itinéraire |
| `/privacy` · `/terms` · `/mentions-legales` | Conformité |

---

<p align="center">
  <sub>Névé — Nathan Laure · Next.js, Supabase, Mapbox · hébergé en Europe</sub>
</p>
