# CME-3D 0.7.53 — Parité des choix d'entraînement Shadow / Studio Coach CME

**Arbitrage du 26/10/2026 :** le module Mouvements de CME-3D doit suivre Shadow pour **tous les choix de discipline, de technique, d'exercice, de niveau, de programme et de mode de séance**. **Seul le configurateur est différent** : le coach enregistré dans CME (apparence, nom, surnom, taille, poids, latéralité et discipline phare) est utilisé dans l'entraînement. Le moteur 3D CME est conservé lorsqu'il est plus évolué. **Interdiction de toucher au dépôt Shadow**.

## 1. Reformulation additive

Cette décision complète les versions antérieures : vrai coach skinné du Studio, mêmes vêtements sportifs Ultra/Fitness/Comics dans les six disciplines, rig et animations canoniques CME préservés. Ne pas charger les fichiers `coach_male.glb` / `coach_female.glb` de Shadow à la place du coach du configurateur : on réintroduirait deux personnages distincts.

## 2. Audit transversal et intégration

| Élément du module Shadow | Référence dans Shadow | Réutilisation CME |
| --- | --- | --- |
| Six disciplines et quatre niveaux | `src/domain/types.ts` | Source copiée sous `src/shadow-training/domain/types.ts` |
| Techniques et leur appartenance aux disciplines | `src/domain/techniques.ts` | `domain/techniques.ts`, accès direct aux techniques |
| Exercices et leurs séquences | `src/domain/exercises.ts` | `domain/exercises.ts`, 208 exercices |
| Programmes et phases | `src/domain/programs.ts` | `domain/programs.ts`, mêmes blocs |
| Séance Libre / Technique / Cardio / Rounds / Programme / Personnalisé | `src/ui/training/plan.ts` | `src/shadow-training/plan.ts`, mêmes durées et modes |
| Décompte, travail, repos et répétitions | `src/ui/training/useSession.ts` | Machine locale `session.ts`, minuterie source Shadow, répétitions depuis boucles réellement terminées |
| Entraînement visuel | `src/ui/screens/Training.tsx` | `ShadowTrainingPanel.tsx` avec interface condensée Android |
| Coach sur scène | `src/three/CoachStage.tsx` / `CoachModel.tsx` | **Non réutilisés** : `Fighter.tsx` et `CoachRig` de CME gardent le modèle issu de Studio |

**Révision Shadow lue :** `b3df4f966b7f99f8ffab2686ec89c9e38b7b7452`. Les copies sont des dépendances en lecture seule de CME : le dépôt Shadow reste inchangé. Les catalogues Shadow précédemment importés en JSON servent exclusivement au raccordement des IDs de mouvement aux séquences CME.

**Disponibilité 3D :** `bridge.ts` associe la technique Shadow à sa motion CME ou un exercice à `shadow-<id>`, à condition que la séquence complète soit reconnue. Les choix non animables restent visibles avec indication « indisponible » et démarrage désactivé. Aucun mouvement fictif n'est créé ; la garde peut être une pose d'attente du Canvas, jamais substituée à un mouvement manquant.

**Portée réelle de la parité :** sources des choix et règles de planification identiques ; états de séance, minuteurs, rounds, pauses, passage entre exercices et répétitions réelles disponibles. L'implémentation complète de l'assistant vocal, du mode AR et des statistiques persistantes de Shadow **n'est pas revendiquée**. L'AR utilisateur (caméra) est **exclue par la règle zéro tracking**. On évite les commandes placebo.

## 3. Règles d'or

- **Shadow** : lecture seule stricte, aucun commit, PR, écriture ou déploiement dans `Doorsofhell/combat-shadow-studio`.
- **Un même coach** : on utilise `SavedCoach.look` avec `CoachRig`, `applyCoachLookGeometry`, `applyNeutralAppearance`, accessoires et source GLB du Studio. Seules les tenues selon la discipline et les animations changent.
- **Biomécanique** : aucune mutation du rig canonique, des poids de skinning, des positions clés, des trajectoires ou de la bibliothèque de mouvements ; animation exécutée exclusivement dans CME.
- **Zéro tracking** : aucune captation vidéo, caméra utilisateur, computer vision ou mocap.
- **Zéro fake** : pas de mouvement ni avatar inventés. FPS, GPU, latence Android : **Non mesuré**.

## 4. Recette et qualité

Vitest des six disciplines, quatre niveaux, 208 exercices, des six modes, de l'intégrité des plans, du mapping vers les motions CME (dont rejet des exercices non pris en charge), de la machine de phases et du chargement des coachs personnalisés. TypeScript, validation GLB, CI double verte et publication GitHub Pages vérifiée obligatoires avant déclaration de livraison.

Recette physique Android encore à faire : choisir successivement les six disciplines, les quatre niveaux et plusieurs modes ; tester les commandes de séance, les profils femme/homme enregistrés, les tailles et poids, les changements de discipline sur un programme mixte, un exercice non disponible et les tenues compatibles. Observer les collisions vêtements/corps et la fluidité, sans inventer de métriques.

## 5. Documentation et poursuite

Ajouter ce contrat au prompt maître, au schéma directeur et au fil conducteur sans supprimer leurs décisions précédentes. **Poursuite suivante** : alignement des consignes vocales et pédagogiques sans caméra, puis comparateur visuel Studio/Entraînement sur le même GLB et appareil Android réel, enfin couverture biomécanique des éventuelles techniques indisponibles par création d'animations réelles et tests.

