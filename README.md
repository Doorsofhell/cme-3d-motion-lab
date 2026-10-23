# CME-3D Motion Lab

Moteur 3D autonome pour l'étude de la biomécanique des disciplines de combat. Application expérimentale et PWA installable sur Android.

**Application** : https://doorsofhell.github.io/cme-3d-motion-lab/

## Utilisation

L'onglet **Laboratoire** occupe un seul écran en trois zones : sélection du coach/de la technique, vue 3D et barre des commandes avec console de débogage repliable et signalement d'incident.

L'onglet **Suivi des corrections** lit les issues publiques du dépôt, les classe par numéro, et déduit les étapes des labels/checkboxes réellement renseignés. Une issue fermée est à 100 %. La déclaration depuis l'application **prépare** une nouvelle issue GitHub ; seule la confirmation sur GitHub enregistre la demande.

Le catalogue contient 86 mouvements uniques classés par discipline. Les modèles de Kadir et Amara comprennent 6 tenues chacun et une variante BJJ no-gi. Les deux styles de rendu partagent la même mécanique d'animation : Ultra-réaliste (en développement) et Animation fitness.

## Développement

Node.js 22 ; commandes : 
- npm ci
- npm test
- npm run build -- --mode pages

Sur chaque push main, GitHub Actions lance les tests, la compilation et le déploiement de l'application. Aucun tag ou release pour le moment.

## Documentation

Voir [le cahier des charges](docs/CAHIER_DES_CHARGES.md) pour objectifs, critères de qualité, architecture et responsabilités fonctionnelles.

Les visuels et l'IA locale sont encore expérimentaux. Aucune qualité photoréaliste ni validation biomécanique avancée n'est actuellement revendiquée.
