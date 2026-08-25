# Développer sur la surface web de Névé

Guide de mise en route et conventions du dépôt du site.
La présentation du produit est dans le [README](README.md).

---

## Mise en route

Node 20+ et `pnpm` (ou `bun` / `npm`).

```bash
pnpm install
pnpm dev
```

Le site démarre sur http://localhost:3000.

### Variables d'environnement

À placer dans `.env.local`, **jamais versionné**.

| Variable | Usage |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Point d'entrée du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique, soumise au RLS |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Cartographie et géocodage |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console (optionnel) |

**Pile** : Next.js (App Router) · TypeScript · Tailwind CSS · Supabase ·
Mapbox GL. Déploiement continu sur Vercel depuis `main`.

Le site partage la base Supabase de l'application mobile (dépôt `neve`) : les
migrations de schéma vivent là-bas, pas ici.

---

## Organisation du code

```
app/
  (auth)/          connexion, inscription, réinitialisation
  (default)/       pages publiques et application web
    explorer/          recherche d'itinéraires
    rando/[id]/        fiche de randonnée
    randos-sans-voiture/[city]/   pages par ville
    favoris/ profil/   espace personnel
    privacy/ terms/ mentions-legales/ suppression-compte/
  share/[token]/   partage d'itinéraire
  robots.ts        directives d'indexation
  sitemap.ts       plan du site, filtré sur le catalogue réel
components/        composants d'interface
lib/               accès Supabase, géocodage, requêtes randonnées
middleware.ts      canonicalisation www, hors /.well-known/
public/
  llms.txt                      description pour les moteurs génératifs
  .well-known/assetlinks.json   vérification des App Links Android
```

---

## Trois choix qui ne se devinent pas dans le code

### Le middleware exclut `/.well-known/` de la canonicalisation

Le site canonicalise l'apex `neve-rando.fr` vers `www`. Cette redirection vivait
au niveau du domaine chez Vercel, donc **avant tout routage** — y compris pour
`/.well-known/assetlinks.json`.

Or Android **ne suit pas les redirections** quand il vérifie un lien
d'application. L'apex ne pouvait donc jamais être validé, et un lien de partage
le portant ouvrait le navigateur au lieu de l'application.

La redirection a été ramenée dans `middleware.ts`, qui laisse passer
`/.well-known/` tel quel sur les deux hôtes.

> ⚠️ Suppose que l'apex est rattaché au projet **sans redirection** côté Vercel.
> Si elle y est reconfigurée, elle s'applique avant le middleware et le
> contournement devient inopérant.

### Le sitemap ne déclare que les villes qui ont des randonnées

Les pages `/randos-sans-voiture/[city]` se rendent **à la demande pour n'importe
quelle commune**. Les déclarer toutes reviendrait à annoncer des dizaines de
milliers d'URL sans contenu.

`app/sitemap.ts` filtre donc sur le catalogue réel. Annoncer des pages creuses
revient à demander leur indexation, ce qui pénalise le domaine entier. Les
villes réapparaissent d'elles-mêmes quand le catalogue couvre leur région.

### Le site est optimisé pour être cité, pas seulement classé

Une partie de l'acquisition vise les moteurs génératifs, qui ne renvoient pas une
liste de liens mais une réponse accompagnée de ses sources.

- `public/llms.txt` — description structurée du service. **À maintenir alignée
  sur l'état réel du produit** : c'est ce fichier qui alimente les réponses
  générées à propos de Névé.
- Balisage **JSON-LD** sur les pages par ville et sur la FAQ.
- `app/robots.ts` autorise l'indexation et n'exclut que l'authentification et
  l'API.

---

## Avant de clore un déploiement

Après toute modification touchant l'indexation — `robots.ts`, `sitemap.ts`,
`llms.txt`, balisage JSON-LD — vérifier que `/sitemap.xml`, `/robots.txt` et
`/llms.txt` répondent correctement en production.
