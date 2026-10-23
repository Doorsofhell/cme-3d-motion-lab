# CME-3D Motion Lab — projet autonome

Laboratoire expérimental d'animations de combat 3D. **Aucun code ni déploiement Shadow n'est modifié par ce dépôt.**

## Ouvrir l'application

Quand GitHub Pages sera activé :
**https://doorsofhell.github.io/cme-3d-motion-lab/**

Le site est une **PWA installable sur Android**. Chrome → menu ⋮ → « Ajouter à l'écran d'accueil » / « Installer l'application ».

## Développement local

- Node.js 22
- `npm ci`
- `npm run dev` (Vite)
- `npm test` (11 tests unitaires sur la mécanique, le système neuronal et les tenues)
- `npm run build` (build local)
- `npm run build -- --mode pages` (build avec base GitHub Pages)
- `npm run preview -- --mode pages` après build GitHub Pages

## Publication

1. Créer le dépôt public `Doorsofhell/cme-3d-motion-lab` (pas dans Shadow).
2. Pousser les fichiers **à la racine du nouveau dépôt**, sur `main`.
3. GitHub → Settings → Pages → Build and deployment → Source : « GitHub Actions ».
4. Le workflow `.github/workflows/deploy-pages.yml` lance les tests et publie la PWA à chaque push sur `main`.

## Structure

- `src/core` : trajectoires, IK, contacts au sol, correction neuronale expérimentale
- `src/adapters` : rig Three.js et intégration des tenues
- `src/lab` : application React / Three.js
- `public/fighters` : modèles GLB originaux de Kadir et Amara, tenues par discipline
- `public/draco` : décodeurs Draco
- `public/manifest.webmanifest`, `public/cme-sw.js` : PWA et fonctionnement avec cache
- `.github/workflows/deploy-pages.yml` : tests et déploiement GitHub Pages

**Statut :** prototype de recherche version 0.3. La garde et les rotations anatomiques ont été corrigées mais la validation visuelle et biomécanique complète est encore nécessaire. Les poids neuronaux reposent sur des données synthétiques. Ce n'est ni un modèle photoréaliste final ni un simulateur physique validé.

Modèles et vêtements sous les conditions précisées dans `public/fighters/LICENSE-ROCKETBOX.txt`.
