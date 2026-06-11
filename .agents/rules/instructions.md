# Névé Development & Style Rules

## 1. Variables de couleurs obligatoires
*   **Où trouver les variables** : Elles sont déclarées et éditables dans le fichier [app/css/style.css](file:///c:/GIT/neve-landingpage/app/css/style.css) au sein de la directive `@theme` (ex: `--color-brand-green`, `--color-brand-orange`, etc.).
*   **Règle** : Il faut impérativement utiliser ces variables (ex: `text-[color:var(--color-brand-green)]` ou `text-[color:var(--color-brand-orange)]`) pour toutes les couleurs thématiques de la marque.
*   **Proscription** : Ne jamais utiliser de couleurs Tailwind en dur (hardcoded) comme `text-emerald-400`, `text-slate-500`, `bg-emerald-50`, etc., dans le code.
*   **Raison** : Assure le respect de la charte graphique Névé et simplifie la maintenance et les modifications globales du thème.

## 2. Typographie de marque
*   **Règle** : Appliquer la police de marque `Bricolage Grotesque` (via la classe CSS `font-bricolage`) pour tous les éléments textuels et titres du site.

## 3. Immersion et Esthétique
*   **Règle** : Maintenir un style épuré, premium, axé sur le plein air (fonds crème, beige chaud, vert olive, largeurs immersives `max-w-7xl`).
*   **Règle** : Ne jamais citer de marques concurrentes directement.

## 4. Expérience Utilisateur & États de Survol (Hover States)
*   **Règle** : Ne jamais appliquer d'effets de survol (ex: `hover:`, `group-hover:`, changements d'ombre, zoom, rotation ou bordure colorée) sur des cartes, images ou conteneurs qui ne possèdent pas d'action au clic (ni lien, ni bouton, ni gestionnaire d'événement au clic).
*   **Raison** : Les effets de survol créent une fausse affordance en suggérant à l'utilisateur qu'il peut cliquer sur l'élément, ce qui nuit à la clarté de l'ergonomie (UX).

