# CME-3D — Cahier des charges opérationnel

**Statut :** laboratoire expérimental, publication continue. Aucun tag, release ni numéro de version fonctionnel demandé.

## Vision et critères d'acceptation

Créer un moteur 3D autonome d'entraînement aux disciplines de combat, capable de restituer des animations naturelles, physiquement crédibles, lisibles et adaptées à Android. L'exigence majeure est la qualité des mouvements, pas une simple succession de poses. Deux directions visuelles doivent être comparées sur les mêmes animations : **Ultra-réaliste** (anatomie humaine plausible, peau, vêtements et éclairage avancés) et **Animation fitness** (personnages humains, surfaces lisibles, style pédagogique épuré rappelant les applications d'entraînement modernes, sans copier leurs ressources).

Le mode « Ultra-réaliste » est un **objectif**, pas une conformité déjà atteinte.

## Équipes et responsabilités fonctionnelles

Il s'agit des **rôles de développement à couvrir**, et non d'une affirmation sur des personnes déjà recrutées :

| Pôle | Responsable de la livraison attendue |
| --- | --- |
| Direction produit / validation | Critères, priorités, validation des poses et rendus sur téléphone |
| Animation & biomécanique | Cinématique, IK, FK, amplitude articulaire, contacts au sol, séquences dynamiques, tests martiaux |
| Graphisme 3D | Morphologie, coiffures, visages, peau, shaders, tenues, lighting, LoD et rigging |
| IA locale / données | Corpus légal d'animations, correcteur temporel léger, entraînement et évaluation, benchmarks |
| Frontend mobile & UX | Laboratoire en un écran, sélection, comparaison des modes, qualité adaptative, accessibilité |
| Qualité / performances | FPS sur Android, charge GPU, régressions visuelles, WebGL, monitoring, tests automatiques |
| DevOps & incidents | GitHub Issues, file ordonnée, étapes vérifiables, CI/CD GitHub Pages, correctifs et suivi |

## Périmètre testable

- Deux personnages : Kadir et Amara, chacun avec six tenues de disciplines ; variante no-gi en BJJ.
- Catalogue de **86 trajectoires uniques** issues de 91 descriptions source, dédoublonnées par identifiant de mouvement ; filtre par discipline, recherche globale, aucune suppression silencieuse.
- Deux modes de rendu, comparables avec identiques pose, trajectoire, temps, tenue et caméra.
- Interface **sans scroll vertical principal** : première zone « paramètres de test », deuxième zone « scène 3D », troisième zone « commandes, debug, signalement ».
- Deux onglets : Laboratoire ; Suivi des corrections.
- Console diagnostique en bas, repliable : FPS, WebGL, DPR, triangles, draws, textures, géométries, événements et bouton de copie.
- Déclaration d'incident préremplissant le contexte et les diagnostics, à valider sur GitHub ; ne jamais présenter le ticket comme créé avant confirmation GitHub.
- Suivi automatique des tickets publics : numéros ordonnés, état ouvert/fermé, étapes réellement marquées et pourcentage calculé ; pas de barre temporelle artificielle.

## IA légère intégrée — programme d'amélioration

Étudier des bibliothèques librement réutilisables (licences et provenance vérifiées), notamment ONNX Runtime Web/WASM pour une inférence locale **si** les benchmarks démontrent l'utilité ; alternative déterministe si cette IA n'apporte pas de gain. Entraîner hors ligne, conserver dans l'application uniquement des poids légers. Le modèle doit faire de petites corrections résiduelles validées par contraintes physiques et limites articulaires ; il ne doit pas générer aveuglément les articulations. Aucun service IA cloud pendant l'animation.

Mesurer : erreur de position des appuis, pénétration sol, hyperextension coude/genou, glissement pied, vitesse/accélération des poings, cohérence séquentielle hanches-tronc-épaules, collisions, régularité des trajectoires et FPS réels sur smartphone. Comparer systématiquement avec le moteur de référence interne sur un ensemble identique de mouvements et personnages.

**Ne pas confondre la présence d'un mini-réseau expérimental issu de données synthétiques avec une IA de correction biomécanique validée.**

## Livraison et validation

Chaque fusion sur la branche principale doit déclencher tests, compilation et publication GitHub Pages ; aucune série de versions/releases requise. Les corrections sont suivies dans GitHub Issues et ne passent à 100 % qu'à la clôture du ticket. La vérification sur vrai Android reste obligatoire avant validation de qualité graphique, ergonomie et fluidité.

Pour créer un ticket depuis l'application, l'utilisateur confirme explicitement la publication sur GitHub (dépôt public, donc ticket public). La PWA ne stocke aucune clé GitHub.
