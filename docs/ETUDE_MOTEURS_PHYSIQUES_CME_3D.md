# Étude de faisabilité — moteur physique interchangeable pour CME-3D

## Contexte et décision
Piste proposée le 24 octobre 2026 à partir de https://www.reddit.com/r/gamedev/comments/qu1y2y/most_popular_c_opensource_physics_engines/ (discussion de novembre 2021). Le classement communautaire ne constitue ni un benchmark ni une validation biomécanique. Les solutions modernes Jolt, Rapier, MuJoCo, Bullet et Simbody doivent être évaluées sur leurs API et leurs contraintes techniques actuelles.

**Décision** : préserver le moteur cinématique et le squelette canonique de CME-3D. Aucun remplacement ni ajout de dépendance physique en production sans prototype mesuré. La couche physique doit être interchangeable, isolée des composants React/Three.js, et rester compatible avec l'intégration future dans Shadow. Ne pas modifier Shadow.

## Candidats et rôle
| Candidat | Rôle possible | Risque à vérifier |
|---|---|---|
| Rapier (Rust/WASM) | Collisions et corps rigides sur navigateur mobile | Taille WASM, coût CPU, contraintes articulaires |
| Jolt Physics (C++/WASM) | Dynamique 3D et collisions avancées | Build WASM, poids, ergonomie d'intégration JS |
| MuJoCo | Référence expérimentale de dynamique articulée | Complexité, licence et distribution web |
| Bullet | Alternative éprouvée | Maintenance, intégration et poids |
| Simbody | Analyse biomécanique hors ligne | Pas nécessairement adapté au rendu temps réel mobile |

## Interface d'abstraction proposée
```ts
export type EtatContact={articulation:string;point:[number,number,number];normale:[number,number,number];penetration:number};
export type EtatPhysique={contacts:EtatContact[];appuisStables:boolean;avertissements:string[]};
export interface AdaptateurPhysique {
 readonly identifiant:string;
 initialiser():Promise<void>;
 synchroniserSquelette(pose:Record<string,readonly [number,number,number,number]>):void;
 avancer(deltaSecondes:number):EtatPhysique;
 liberer():void;
}
```
Les contacts et avertissements sont des **indicateurs de simulation**, pas des diagnostics de blessure. Le moteur physique ne doit pas remplacer l'animation intentionnelle des gestes ; il sert à détecter/corriger des incohérences (pénétration du sol, appuis impossibles, collisions, limites articulaires).

## Protocole de comparaison Rapier / Jolt
1. Reproduire exactement les mêmes scénarios, sans modifier le moteur canonique : garde, direct avant, direct arrière, crochet, coup de pied, esquive, projection, passage au sol.
2. Mesurer sur Android réel et ordinateur : FPS p50/p95, durée de calcul par image, mémoire, poids du chargement initial, stabilité après 10 minutes, collisions parasites.
3. Contrôler les écarts de posture, les pieds au sol, les auto-collisions, la stabilité du bassin et l'absence de torsion anatomiquement impossible.
4. Tester homme/femme et coach sauvegardé sur les six disciplines, avec mêmes seuils et versions d'assets.
5. Valider une stratégie de repli : si WASM échoue, conserver les animations CME sans plantage ni écran vide.
6. Choisir sur mesures et non sur nombre d'étoiles GitHub.

## Critères bloquants
Pas de régression visuelle, aucune captation vidéo ni suivi utilisateur, aucun changement au dépôt Shadow, aucun ajout de physique au chemin critique du rendu avant résultats reproductibles, conservation du format des coachs et des animations. Cette étude rejoint le chantier C **après** stabilisation A et Studio Coach B.
