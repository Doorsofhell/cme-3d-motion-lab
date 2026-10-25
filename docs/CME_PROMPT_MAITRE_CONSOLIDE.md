# CME-3D — PROMPT MAÎTRE V1.0 (refonte majeure, 25/10/2026)

> **Document directeur actif.** Les décisions historiques figurent intégralement plus bas : elles restent applicables sauf arbitrage explicitement documenté. V1.0 est une **cible produit**, pas une certification de livraison.

## 1. But unique et promesse
**Créer, examiner et valider un combattant 3D humain crédible, de son apparence à ses mouvements, dans un seul atelier mobile.** CME-3D n'est ni une application d'entraînement ni un clone de Shadow : c'est un **atelier de création de coachs et de validation biomécanique**. Les mouvements doivent être naturels, fluides, compréhensibles, traçables et reproductibles.

## 2. Parcours utilisateur V1.0
1. **Studio — Créer** (ouverture par défaut) : choisir homme/femme, personnage GLB réel, pose de référence immobile, formes illustrées par région, réglages fins seulement si supportés, aperçu permanent et zoom anatomique automatique interrompu par geste utilisateur.
2. **Studio — Tester** : même personnage et même scène WebGL, sélection de discipline, technique ou enchaînement réellement disponible, lecture/pause/ralenti, caméra pédagogique ou libre, vue entière, plein écran et indicateurs simples. **Ne jamais recréer un deuxième moteur.**
3. **Galerie Coachs** : retrouver, sélectionner, modifier, dupliquer (quand implémenté), supprimer et tester les profils enregistrés ; sauvegarde explicite et synchronisation avec Studio/Laboratoire.
4. **Comparatif** : protocole A/B traçable, résultats chiffrés, visualisations et statut de validation ; Shadow en **lecture seule**, sans inventer des FPS ni des performances non mesurées.
5. **Plus** : nouveautés, incidents, centre technique, options, diagnostics avancés. Aucun outil technique ne surcharge le parcours principal.

## 3. Navigation et design
- Barre basse unique : **Studio, Galerie Coachs, Comparatif, Plus** ; jamais deux barres concurrentes.
- Studio possède **deux modes visibles** : Création et Test. La scène reste dominante ; les réglages ne doivent pas faire disparaître l'aperçu pendant une manipulation tactile.
- Interface mobile portrait Android d'abord ; pas de chevauchements, de commandes coupées, ni de scroll horizontal accidentel ; gestes tactiles robustes, cibles de 44 px minimum.
- Identité Dark Combat Premium, finition contemporaine et lisible ; inspiration BetterMe limitée à l'ergonomie. Textes et labels **uniquement en français**.
- Un même besoin = **un composant partagé** : barre de scène, plein écran, caméra, chargement, sélecteurs, états d'erreur, boutons, galerie et navigation. Supprimer progressivement les CSS contradictoires, ne pas ajouter des correctifs locaux à répétition.

## 4. Contrat moteur / personnages
- Conserver les GLB anatomiques restaurés homme/femme et leur squelette ; conserver un **moteur canonique unique** et le retargeting pour boxe, kickboxing, Muay-Thaï, MMA, JJB et judo.
- Création : A-pose sans lecture ni garde sportive. Test : animations issues exclusivement du catalogue réellement supporté ; technique absente = désactivée et expliquée.
- Apparence et biomécanique séparées : aucun morph, tenue ou texture ne doit déformer les trajectoires ou corrompre les GLB partagés. Cloner matériaux/géométries uniquement quand nécessaire ; morphs idempotents, bornés, réversibles.
- Contrôle visuel = modification réelle et observable du mesh ; capacité absente = commande désactivée avec explication. Ne jamais prétendre disposer de coiffures, morphs ou assets non livrés.
- Mode Anatomie = représentation d'étude neutre, sans prétendre supprimer des vêtements fusionnés à la géométrie.
- Caméra pédagogique automatique par mouvement, zoom par région, reprise de contrôle immédiate ; aucune caméra utilisateur, captation vidéo, reconnaissance gestuelle ou mocap.

## 5. Validation biomécanique et Android
- Vérifier articulations, amplitudes, transfert de poids, stabilité des appuis, glissements, contacts, rotations, transitions et continuité temporelle ; mesurer plutôt que déclarer « humain ».
- Suivre FPS p50/p95, latence premier GLB et bascule H/F, appels de rendu, WebGL perdu/restauré, mémoire si mesurable ; viser **≥30 FPS en profil Android équilibré**, sans prétendre que la cible est atteinte sans mesure.
- Tests automatiques : TypeScript, Vitest, build, six disciplines, morphs et skinned meshes, composants communs, persistance et migrations. Tests **visuels sur Android réel** distincts de CI.
- Fusion et déploiement GitHub Pages seulement après contrôles verts ; confirmer URL, commit et workflow. Un jalon majeur ne sera dit « livré » qu'après critères d'acceptation et contrôle utilisateur.

## 6. Feuille de route de la version majeure
- **V1-A — Fondations UX** : prompt et architecture cible, modes Création/Test visibles, composants mutualisés, navigation unique, sauvegarde/galerie et anti-régression.
- **V1-B — Créateur 3D Atlas** : formes illustrées effectives, capacités réelles par modèle, morphologie et assets sous licence, personnalisation dynamique sur le même GLB, profils éditables.
- **V1-C — Motion Validation** : six disciplines, référentiel de mouvements, validation appuis/contacts/transitions, caméra pédagogique et lecture reproductible.
- **V1-D — Comparatif et sortie majeure** : protocole A/B, données sourcées, diagnostics Android, tests visuels, critères d'acceptation, version majeure publiée.

## 7. Règles d'exécution et d'interaction
Analyser chaque demande par UX, architecture, 3D, biomécanique, performance et QA ; appliquer le changement utile sans demander de confirmation superflue ; documenter, tester, fusionner, vérifier le déploiement ; distinguer « codé », « testé », « déployé », « vérifié sur Android ». Proposer toujours **Choix libre — prioritaire**, puis 2 à 3 suites concrètes avec recommandation. Réponses exclusivement en français. **Interdiction absolue de modifier Doorsofhell/combat-shadow-studio** : lecture seule autorisée.

---

# Historique consolidé — décisions précédentes préservées

# CME-3D — PROMPT MAÎTRE CONSOLIDÉ (24/10/2026)

## Règle de continuité ABSOLUE
Toute nouvelle consigne est **additive** : elle complète le cahier des charges global, sans réinitialiser ni remplacer les décisions validées. En cas de contradiction explicite, relever le conflit et faire valider le changement. Réorganiser régulièrement les exigences par architecture, ergonomie, biomécanique, apparence, tests, livraison. Conserver un historique des décisions et des limites.

## Mission produit
Construire CME-3D Motion Lab, laboratoire premium de validation biomécanique pour **boxe, kickboxing, Muay Thai, MMA, BJJ/JJB et judo**, et Studio Coach de création de combattants 3D réalistes. Ne jamais modifier Combat Shadow Studio. Conserver sa charte Dark Combat Premium comme référence visuelle ; BetterMe n'inspire que la simplicité UX.

## Architecture fonctionnelle liée
1. **Laboratoire** : les animations sont d'abord testées sur **deux humanoïdes neutres**, homme/femme, sans vêtements ni peau réaliste. Squelette canonique commun, rig/IK et MotionSampler uniques ; test des techniques, séquences, ralentis, contacts, torsions, pied glissant, articulations, transitions, A/B et six disciplines.
2. **Studio Coach / Apparence** : à partir des humanoïdes et du même squelette, créer des coachs personnalisés : morphologie, visage, peau, cheveux, tenues, protections, couleurs. Les modifications visuelles ne doivent pas modifier les trajectoires du moteur. La qualité de rendu doit être premium et anatomiquement crédible.
3. **Bibliothèque partagée** : chaque coach enregistré dans Studio Coach doit apparaître dans le Laboratoire, être sélectionnable et pouvoir être testé sur les mêmes animations. L'identifiant de profil, les réglages et les associations aux modèles doivent persister. Les coachs ne sont pas de nouveaux moteurs.
4. **Comparatif 3D** : comparaison CME/Shadow en lecture seule côté Shadow, et A/B quantitatif sur animations, pas seulement des métadonnées.
5. **Navigation mobile** : trois espaces principaux en bas (Laboratoire, Studio Coach, Comparatif 3D), fonctions secondaires dans Plus. Écran tactile Android : défilement vertical fiable, aucune zone de personnalisation bloquée ou coupée, boutons accessibles, 3D cadrée et commandes simples.

## Interaction utilisateur obligatoire
À chaque nouvelle instruction : (a) reformuler la demande en l'intégrant aux précédentes ; (b) réaliser l'analyse croisée UX/3D/biomécanique/performance/architecture ; (c) implémenter les corrections autorisées dans CME ; (d) tester et annoncer les preuves ; (e) fusionner seulement les lots vérifiés puis contrôler Pages ; (f) mettre à jour le fil conducteur ; (g) proposer **2 à 3 choix prédéfinis, hiérarchisés et actionnables**, en recommandant un choix. Ne jamais déclarer une fonctionnalité terminée si seulement simulée.

## État technique et limites
- PR #57 : proxies anatomiques gris attachés aux os, pas encore des modèles anatomiques sculptés/riggés certifiés. Les vrais modèles neutres et la validation retargeting sur les six disciplines restent à réaliser.
- Le rendu Apparence utilise les GLB texturés existants ; de nombreux réglages morphologiques/vestimentaires ne modifient pas encore les meshes 3D réels.
- Le lot suivant corrige le défilement Android et ajoute une bibliothèque locale de profils partagée entre Studio Coach et Laboratoire ; **la sélection d'un coach dans le Laboratoire ouvre actuellement son profil dans Studio Coach, elle ne remplace pas encore l'acteur de la scène laboratoire**. Ce lien 3D complet est un critère restant.
- La persistance locale est propre à l'appareil/navigateur, sans synchronisation cloud.
- Tests TypeScript/CI ne remplacent ni audit visuel Android, ni retargeting quantitatif, ni certification anatomique.

## Qualité / release gates
TypeScript, tests, build, intégrité des six disciplines, non-régression moteur, vérification Android réel (scroll + performance), mesures de retargeting, Pages et version vérifiées. Livrer par lots indépendants, ne fusionner que les corrections validées et rendre explicites les limites.

## Prochaines priorités ordonnées
P0 : défilement Android Studio Coach + catégories et sauvegarde fiable.
P1 : liaison complète d'un coach sauvegardé à la scène Laboratoire, mêmes animations.
P1 : vrais humanoïdes neutres homme/femme anatomiques sous licence vérifiée.
P1 : tests de retargeting et six disciplines sur les deux humanoïdes.
P2 : personnalisation visuelle réellement appliquée au mesh riggé (morphs/visage/tenues), sans rupture des mouvements.
P2 : optimisation Android et audit A/B biomécanique.

## Lot A — liaison réelle Studio Coach → Laboratoire (24/10/2026)
- Les coachs enregistrés localement sont sélectionnables depuis « Mes coachs » dans le Laboratoire.
- La sélection choisit le rig homme/femme existant et transmet les couleurs du profil au `Fighter` réellement animé par `CoachRig`, `MotionSampler`, `SequenceSampler` et `CoachPlanSampler`. La discipline, le mouvement, la vitesse et la lecture restent ceux du Laboratoire : aucune bibliothèque d'animation parallèle.
- Le coach actif est conservé sur cet appareil et indiqué dans la scène ; la sélection d'un combattant de série désactive le profil personnalisé.
- Limite persistante : les morphs, visages, tenues et protections ne sont pas encore pleinement appliqués à la géométrie du rig. L'adaptateur de matériaux ne colore que les surfaces reconnues. Le retargeting quantitatif et la certification des six disciplines ne sont pas achevés.
- Critères de validation : typecheck, tests, build Pages, contrôle réel Android et test visuel des 6 disciplines. Ne pas annoncer les contrôles Android comme faits sans preuve.

## Addendum — interface et catalogue
Parcours : humanoïde neutre, personnalisation, sauvegarde, puis test en Laboratoire. Les profils doivent pouvoir être créés, modifiés et supprimés. Inventorier les techniques, mouvements et enchaînements Shadow en lecture seule, en distinguant données importées et animations réellement validées. Référence détaillée : docs/CME_INTERFACE_CIBLE_CATALOGUE_SHADOW.md.

## Lot catalogue Shadow — audit historique (24/10/2026)
- Shadow Studio demeure strictement en lecture seule. Sources actuelles et historique accessible des fichiers `src/domain/techniques.ts` et `src/domain/exercises.ts` analysés (commits 8ed768a et 85dcebf).
- 75 techniques uniques Shadow, 208 exercices déjà présents dans CME, six disciplines. Cinq techniques absentes de `techniques.json` conservées dans `shadowTechniqueInventory.json` : garde-bjj, shizen-tai, tsugi-ashi-avant/arriere/lateral. Références classées sans les déclarer animées.
- Nouveau panneau de recherche par discipline et statut de correspondance dans le Laboratoire. Le catalogue est un référentiel ; validation biomécanique et exécution effective restent indépendantes.
- Limite : audit des commits des deux fichiers sources et des données déjà importées, pas certification exhaustive de tous les anciens tags/branches ou de tous les assets d'animation. Toute divergence future doit être traitée sans réinitialiser le prompt maître.

## Exigences permanentes UX et moteur — 24/10/2026
Toute nouvelle instruction complète le prompt maître sans effacer les précédentes. Interaction avec propositions de choix prédéfinis à chaque lot. L'humanoïde/coach occupe l'espace central et reste assez grand pour analyser la biomécanique ; double clic ou double tap pour plein écran, fermeture explicite et Escape. Paramètres de diagnostic, JSON et autres commandes techniques regroupés dans des panneaux secondaires. Studio Coach : prévisualisation réactive aux modifications, rig neutre visible par défaut, même squelette canonique homme/femme, pas de vêtements ni texture de peau en mode neutre. Tests de non-régression obligatoires avant fusion. Le moteur CME et les profils de coachs doivent rester intégrables ultérieurement dans Shadow via contrats et formats stables ; Shadow reste strictement inchangé. Examen pluridisciplinaire requis : UX/UI mobile, 3D/rigging, biomécanique, architecture, QA/accessibilité et déploiement. S'inspirer des applications comparables sans copier leurs éléments protégés.

## 24/10 — Anti-régression rig neutre
La géométrie du rig neutre doit rester visible même lors des animations et du changement de pose : frustum culling désactivé sur les surfaces rattachées aux os, vérification du nombre de segments, tests pour homme et femme. Il s'agit toujours d'un proxy procédural, pas encore d'un mesh anatomique sculpté identique à la maquette. Validation visuelle Android, tests complets des six disciplines et qualité biomécanique à confirmer avant certification. Shadow reste intact.

## 24/10 — Choix libre prioritaire et caméra pédagogique
Conserver intégralement les consignes précédentes. Chaque proposition de suivi contient désormais un **choix libre prioritaire** en plus des options recommandées. Réponses, interfaces, libellés et documentation uniquement en français. Implémenter un cadrage pédagogique automatique contextualisé des gestes, avec bascule caméra libre. Corriger les surfaces neutres qui disparaissent à cause de la visibilité des ancêtres : masquer les matériaux sources sans masquer les os ni les surfaces de test. Le tableau de validation et ses modes de distance, comparaisons, retours visuels, sonores et haptiques sont décrits dans `docs/SPEC_TABLEAU_VALIDATION_MOUVEMENTS_3D.md` ; aucune captation vidéo, caméra utilisateur ou reconnaissance gestuelle n'est activée dans CME. Exiger validation UX, 3D, biomécanique, architecture, QA et déploiement ; Shadow demeure inchangé.

## Ordre de travail validé : A → B → C (24/10/2026)
A — stabilisation et non-régression d'abord ; B — personnalisation dynamique complète de Studio Coach ensuite ; C — biomécanique et caméra avancée enfin. Les choix libres restent prioritaires. Lot A : rendre testable séparément le masquage des matériaux sources sans supprimer les os descendants, vérifier les matériaux multiples et les deux sexes. Ne pas certifier un test visuel Android sans essai réel. Les PR brouillon antérieures nécessitent une revue de conflits avant toute fusion. Shadow reste en lecture seule.

## 24/10/2026 — Retour Android et priorité ergonomique Studio Coach
Capture réelle : boutons superposés, mannequin invisible, réglages non dynamiques, rashguard sélectionné sans être porté. Priorité à une interface claire et premium, aperçu 3D visible, actions contextuelles et aucun texte superflu. Ne jamais prétendre qu'une tenue est portée si le maillage correspondant n'est pas réellement rendu. Corriger les régressions avant de poursuivre B/C. Conserver le choix libre prioritaire et Shadow inchangé.

## 24/10/2026 — Cohérence systématique des composants (décision validée)
Toute fonction identique doit utiliser un composant partagé unique dans Laboratoire, Studio Coach et Comparatif 3D : plein écran natif, double-tap/double-clic, boutons, caméra, menus, états de chargement, navigation et retours utilisateur. Interdire les implémentations divergentes et l'accumulation de correctifs CSS locaux. Réutiliser les mêmes libellés français, cibles tactiles accessibles et conventions de mise en page. Le premier composant mutualisé est `src/lab/SceneFullscreen.tsx`. Préserver les humanoïdes GLB validés et ne pas modifier Shadow. Tester la cohérence sur Android avant de clore chaque lot.

## 24/10/2026 — Audit global C validé, suivi additif
- Référence avant intervention : `main` au commit `e9c32f5` (PR #83, déploiement GitHub Pages réussi). Audit croisé du parcours, moteur Three.js/R3F, gestion GPU, GLB, documentation et qualité.
- 0.7.18 traite le rendu caché du Laboratoire et les chargements GLB prématurés ; la performance Android réelle reste à mesurer. Comparatif : suppression du texte parasite ; aucune mesure du moteur Shadow ajoutée artificiellement.
- Trois espaces principaux + Plus déjà implémentés : conserver cette navigation. Ne pas réouvrir les anciens problèmes comme fonctionnalités manquantes sans vérification préalable.
- Atlas : 306 gestes uniques, 43 combinaisons proposées, **aucune validation biomécanique certifiée** d'après `COUVERTURE.json`. P0 recette Android réelle ; P1 fixtures des six disciplines, humains neutres de qualité, morphs appliqués, A/B quantitatif ; P2 profils FPS et Naïra originale dépendante d'assets autorisés.
- Mettre systématiquement à jour `docs/CME_FIL_CONDUCTEUR_UX_3D.md`, ne jamais prétendre que CI ou Pages certifient l'UX tactile ou l'anatomie, conserver Shadow strictement en lecture seule et les interdictions de capture/analyse vidéo.

## Lot validé A — Instrumentation Android 0.7.19 (24/10/2026)
La stabilité doit maintenant être **mesurable**, sans captation de l'utilisateur. Mutualiser les sondes FPS/GLB/WebGL du Laboratoire et du Studio Coach et exposer des rapports locaux exportables : chauffe de 5 s et 60 fenêtres FPS de 1 s, p05/p50/p95, p95 temps d'image, pertes et restaurations WebGL, latence de préparation GLB et changements homme/femme. Toute mesure interrompue est explicitement invalide pour la certification Android. Aucun chiffre de performance ne doit être inventé ; tests automatisés ≠ vérification physique. Conservations absolues : moteurs et GLB, Shadow Studio en lecture seule, trois onglets principaux + Plus, aucun upload/capture/analyse vidéo et suivi du fil conducteur.

## Lot C — Personnalisation dynamique sécurisée 0.7.20 (24/10/2026)
Studio Coach conserve le même squelette canonique et les humanoïdes GLB existants. Les couleurs ne doivent modifier que les sous-matériaux reconnus. Les curseurs morphologiques du torse peuvent déformer **seulement des géométries clonées** et associées aux os de poitrine/hanche, sans déplacer les os ni altérer les poids de skinning ou les bibliothèques de mouvement. Les morph targets du visage sont appliqués exclusivement s'ils sont détectés ; sinon les commandes doivent être désactivées et leur absence expliquée. Aucun équipement/coiffure/protection ne sera affiché ou annoncé sans asset réel. Mode Coach en entrée, mode Anatomie neutre indépendant. Tester l'idempotence et l'isolement des GLB, distinguer CI verte et recette tactile/visuelle Android. Shadow Studio reste inchangé. Ce lot s'ajoute aux exigences antérieures sans les effacer.

## 24/10/2026 — Alignement des deux scènes (0.7.21)

Les deux scènes CME utilisent désormais le **même adaptateur de personnalisation de géométrie** : hauteur, épaules, musculature, taille et morph targets faciaux reconnus, toujours sur clones skinnés. Le Laboratoire applique ces valeurs au coach enregistré tout en gardant son moteur de mouvements canonique. La peinture des matériaux Toon (Fitness/Comics) est autorisée uniquement pour les zones identifiées ; textures et matériaux inconnus sont préservés. Le mode Anatomie demeure indépendant du profil. Valider avec CI TypeScript/tests/build et déploiement Pages ; aucune certification Android réelle, anatomique ou de collision ne peut être déduite de la CI. Les besoins en véritables coiffures et équipements GLB restent ouverts. Le dépôt Combat Shadow Studio n'est pas modifié.

## 24/10/2026 — Lot vêtements et rigging (0.7.22)

Un renforcement local des tenues skinnées peut réduire les croisements avec le torse, uniquement sur les poids buste/bassin ; rester sous 1,2 %, sans prétendre à une simulation de tissus. Les clones de maillage propriétaires abandonnés sont libérés sans jamais détruire les géométries GLB partagées. Les deux corps et les 14 variantes de tenue doivent être vérifiés structurellement à chaque CI. Ces contrôles ne sont pas équivalents à des tests biomécaniques certifiés, ni à un test tactile Android ; conserver la priorité à la recette physique. Aucune modification des animations canoniques, des GLB sources ou de Shadow Studio.

## 24/10/2026 — Priorité utilisateur : Studio Coach entièrement dynamique

Priorité P0 UX/3D : aucune commande de personnalisation active ne doit être placebo. Tout réglage de peau, morphologie, tenue, cheveux, visage et protections doit modifier immédiatement la scène du vrai GLB si les sous-maillages, tissus, morph targets ou accessoires sont disponibles ; autrement désactiver explicitement avec motif précis. Le coach sélectionné doit rester cohérent entre Studio et Laboratoire. Préférer une palette de carnations naturelles, une fidélité aux textures source et une exposition lumineuse non saturante à des teintes unies artificielles. Charger et mapper les fichiers de tenue existants pour six disciplines plutôt que les ignorer ; inventorier les matériaux réellement fournis sur deux sexes. Ne jamais inventer une coupe de cheveux ou une protection sans géométrie disponible. Maintenir le style d'interface Android partagé, l'absence de chevauchement, le rendu 3D en plein écran, la QA automatisée et la recette physique avant toute certification visuelle. Interdiction permanente des outils de capture vidéo/computer vision/mocap/upload vidéo. Shadow Studio et mouvements canoniques sont intouchables. Fusion uniquement après CI verte et contrôle du déploiement Pages.

## 24/10/2026 — Consigne nouvelle et permanente : caméra contextuelle + personnalisations féminines

Tout choix de rubrique dans Studio Coach déclenche un zoom **fluide, stable et non intrusif** sur la région anatomique à modifier, déterminée à partir du **squelette GLB réel** et du réglage actif, jamais de coordonnées arbitraires immuables. Visage/cheveux -> tête ; peau -> visage et buste ; poitrine/épaules -> buste ; taille -> abdomen ; hanches/fessiers -> bassin ; cuisses/jambes -> membres inférieurs ; gants -> mains ; protège-tibias -> tibias. En portrait Android, ne jamais rogner la cible. L'utilisateur peut tourner/zoomer et la transition doit s'arrêter dès son geste ; une commande Vue entière réinitialise le cadrage ; la caméra pédagogique conserve son mode séparé. Mutualiser les fonctions caméra existantes.

Priorité suivante : élargir **réellement** la personnalisation, surtout d'Amara : rondeurs, poitrine, hanches, taille, fessiers, cuisses, coiffures/longueur/volume. D'abord auditer les possibilités et limites des GLB existants, puis créer ou acquérir légalement des maillages ou morphs spécifiques avec autorisation. Contrôle visible = effet réel, sinon désactivation expliquée ; ne pas simuler un faux changement par recoloration. Séparer résultat technique CI, certification biomécanique, inspection visuelle Android et exigences non livrées. Préserver les animations, le dépôt Shadow Studio, toute interdiction d'analyse ou de capture vidéo/mocap et la fusion conditionnée à CI verte.

**Audit GLB vérifié en CI :** consulter [`docs/CME_AUDIT_CAPACITES_PERSONNALISATION_3D.md`](CME_AUDIT_CAPACITES_PERSONNALISATION_3D.md) — 2 matériaux de peau par corps, 0 morph target sur les 2 corps, 0 coiffure distincte et 14 tenues catégorisées. Les nouvelles personnalisations féminines restent un chantier d'assets, non une fonctionnalité déjà active.

## 24/10/2026 — Lot 0.7.25 : silhouette féminine et exigences non négociables

Rendre la personnalisation féminine effective par des modifications réelles et mesurables du maillage GLB clone : rondeur globale, hanches et cuisses, à partir des poids de skinning pertinents. Les valeurs doivent être bornées, indépendantes, non cumulatives, réversibles ; les tenues suivent les mêmes transformations avec faible marge et sans destruction de la géométrie partagée. N'activer les curseurs que si le modèle possède des sommets réellement pondérés. Les nouveaux contrôles et la caméra focalisée sont exclusifs au modèle femme, avec cohérence des profils Studio/Laboratoire et migration des profils JSON précédents. **Ne pas prétendre** à une vraie poitrine sculptée, des fessiers dédiés, une coiffure distincte ni à l'absence de collisions sur Android avant livraison des vrais morph targets/GLB, validation UX et technique. Toute variante visage/cheveux et morphologie future devra avoir ses assets conformes et ses contrôles opérationnels. Shadow Studio et les animations canoniques demeurent strictement intouchables. Exiger CI verte, fusion et déploiement vérifiés.

## 24/10/2026 — Correctif prioritaire permanent : boucle de personnalisation visible et Studio/Lab synchronisés

Toute modification active du coach doit produire un changement **visible sur le même combattant** et rester visible lorsque l'on manipule le curseur Android : aperçu 3D sticky à côté ou au-dessus des commandes, sans défiler hors de vue, même en format portrait ; plein écran et barre d'onglets partagés préservés. Le rendu modifié doit conserver la texture et recalculer les normales nécessaires, sans accumulation ni modification du GLB source. Enregistrer un coach doit le faire apparaître au sein même du sélecteur Coach du Laboratoire, le sélectionner et fournir une navigation directe. Vérifier cohérence `CoachLook` Studio/Laboratoire et actualisation des sélections.

Ajouter une variation féminine de **poitrine** réellement calculée sur les sommets skinnés thoraciques quand ils existent, sans prétendre disposer d'un morph sculpté ; garder les futures exigences d'anatomie détaillée et coiffures. La **vue Anatomie** n'a ni tenue GLB, ni texture d'habillement, ni protections ; vérifier et masquer toute pièce vestimentaire séparée, et ne pas annoncer d'anatomie nue parfaite si le modèle de base possède des vêtements fusionnés à la géométrie. Tester les gestes avec **menus déroulants complets** de techniques et enchaînements par discipline : n'exécuter que des mouvements présents dans la bibliothèque ; combinaisons avec lecteur séquentiel et désactivation explicite des manquants. Jamais de captation vidéo, caméra, mocap ou modification du dépôt Shadow Studio, ni altération du moteur canonique. Déploiement uniquement sur CI verte.

## 25/10/2026 — Navigation premium validée et prochain workflow Comparatif

**Structure principale obligatoire : quatre onglets Studio, Galerie Coachs, Comparatif et Plus**, fixes en bas sur Android. Ne pas supprimer Galerie Coachs : l’écran contient tous les profils enregistrés et leurs actions, avec synchronisation immédiate et accès à l’éditeur. Plus regroupe Nouveautés (notes de versions publiées, état de lecture à prévoir), Centre technique, incidents, paramètres et aide ; aucun diagnostic permanent dans l’écran principal. Fusion incrémentale Studio + test des techniques vers une scène WebGL commune, en gardant tous les personnages et anatomies homme/femme accessibles et les mêmes commandes de test. Le Comparatif reçoit les mesures traçables du Studio via un workflow reproductible, avec graphiques CME vs Shadow mais sans inventer de mesures Shadow : indiquer non concluant lorsque des données comparables manquent. Ne pas modifier le dépôt Shadow Studio ni les mouvements canoniques.

## 25/10/2026 — Studio Creator Atlas

Toute zone morphologique se choisit prioritairement via des **formes illustrées** propres à cette zone, et non via un simple curseur ; les curseurs fins sont secondaires. Chaque forme doit appliquer une transformation réelle à la géométrie via adaptateur Studio/Laboratoire commun, être désactivée quand les morphs/poids/skinned meshes sont absents. Le mode aléatoire ne choisit que les formes effectivement supportées, sans sauvegarde implicite. En création, **A-Pose de référence immobile** et zéro échantillonnage de garde/technique, même quand l’animation est en pause ; le mode test seul réactive le lecteur. Séparer la recette Android réelle de la vérification automatisée. Prévoir prochainement le schéma extensible des centaines de paramètres par région, assets indépendants et pipeline de validation sans simuler une capacité inexistante.

## 25/10/2026 — Arbitrage utilisateur confirmé : exécution progressive CME-3D 1.0

**Décision** : adopter intégralement la vision « un seul atelier : créer → tester → valider », tout en préservant les décisions précédentes. Les quatre destinations principales restent **Studio / Galerie Coachs / Comparatif / Plus**. Elles doivent être épurées sans suppression de capacités existantes : outils techniques exclusivement sous Plus, galerie centrée sur les profils, comparatif sur les mesures réellement disponibles, Studio sur un personnage et une scène WebGL partagés entre Création et Test.

**Plan de livraison incrémental obligatoire** :
1. **V1-A — Cohérence mobile** : vérifier les quatre écrans, accessibilité tactile 44 px, navigation basse unique, chargement GLB, gestes de caméra et plein écran ; consolider les composants et éliminer les règles CSS contradictoires par refactorisation mesurée. Aucun retrait du catalogue des six disciplines.
2. **V1-B — Anatomie réelle** : conserver les GLB Kadir/Amara, leur squelette, poids de skinning, animations et tenues. Ajouter progressivement des variantes réellement observables de silhouette, poitrine, taille, hanches, cuisses et **fessiers féminins**. Les fessiers doivent être un **paramètre anatomique distinct** des hanches et des cuisses, avec variation du volume postérieur et contrôle des raccords au bassin ; aucune simple recoloration ni redimensionnement global présenté comme un morph de fessiers. Vérifier le maillage disponible et, si nécessaire, produire/intégrer des morph targets ou géométries autorisés avant d'activer la commande. Présentation sobre, sportive et non sexualisée.
3. **V1-C — Validation des mouvements** : les six disciplines et les enchaînements restent pilotés par le moteur canonique ; contrôles de contact, amplitude, continuité et appuis reproductibles. Une animation fluide n'est pas une preuve de conformité biomécanique.
4. **V1-D — Recette et publication** : Vitest, TypeScript, build, non-régression GLB/tenues/profils, benchmark Android traçable et revue visuelle réelle avant l'annonce de CME-3D 1.0. Continuer à publier des versions 0.7.x/0.x tant que les critères de sortie ne sont pas satisfaits.

**Contrat qualité des nouveaux morphs féminins** : transformation non destructive sur clone, idempotente, bornée et réversible ; symétrie contrôlée, silhouettes avant/profil/dos, absence d'artefacts aux hanches, entrejambe et jonction cuisse-fessier, comportement avec les 14 tenues et les six disciplines, préservation des bind matrices et du rig. Tout curseur non supporté est désactivé et explique le manque d'asset. Aucun fichier GLB source ni dépôt Shadow modifié. Aucun outil de capture/analyse vidéo, mocap ou upload vidéo.

## 25/10/2026 — Exigences de livraison 1.0 : portabilité Shadow, tests exhaustifs, galerie et télémétrie
**Arbitrage utilisateur, cumulatif et prioritaire, sans effacer les décisions antérieures.**

### Contrat d'export indépendant de l'interface
- CME-3D est le laboratoire source du futur moteur Shadow, **sans modifier le dépôt Shadow avant autorisation explicite**. Le moteur doit être extrait en package autonome sans dépendance React, CSS, écran, localStorage ou GitHub Pages. API stable : charger combattant, appliquer apparence, charger technique/enchaînement, avancer simulation, récupérer état biomécanique et métriques, libérer ressources.
- Chaque combattant doit pouvoir être exporté sous forme de **paquet versionné** (manifest JSON avec identifiant stable, nom, surnom, sexe, discipline d'origine, taille/poids déclarés, morphologie, apparence, tenue, rig canonique, références d'assets GLB, animations et licences, checksum et version du schéma). Le manifeste seul ne suffit pas : l'export final doit contenir ou référencer de façon vérifiable tous les assets nécessaires, avec contrôle de licence, compatibilité et import Shadow reproductible. Interdire les faux boutons « Export Shadow » tant que l'import de bout en bout n'est pas prouvé.
- Compatibilité à vérifier sur Android avec au moins deux GLB historiques, leurs équipements et les six disciplines ; tests aller-retour export/import, comparaison pose de référence, morphs, poids de skinning et animations.

### Couverture complète des mouvements et stress tests
- Toutes les **techniques et combinaisons** du catalogue consolidé (six disciplines, techniques individuelles et enchaînements, y compris les importations Shadow en lecture seule) doivent être **listables, filtrables, testables et diagnostiquables**. Aucun mouvement non supporté ne doit être présenté comme validé. Prévoir un inventaire avec identifiant stable, origine, discipline, compatibilité rig, état supporté/non supporté, motif, erreurs, durée et résultat.
- Stress test automatisé : matrice combattant × discipline × technique/combinaison × vitesse × qualité, cycles répétés, alternance H/F, changements de tenue, perte/récupération WebGL simulée et transitions. Mesurer FPS p50/p95, latence GLB, temps de transition, collisions, pénétrations, stabilité des appuis, angles hors bornes, erreurs JS/WebGL et fuites mémoire quand mesurables. Journal horodaté, export de rapport et seuils explicites, **jamais de métrique fictive**.
- Aucun outil de capture de mouvement par caméra, computer vision ou upload vidéo.

### Ergonomie et écran de diagnostics
- Conserver **Studio, Galerie Coachs, Comparatif, Plus** en navigation principale unique. Ne pas polluer les écrans principaux par les outils de test. Un **bandeau discret cliquable** affiche un graphique de fluidité réelle (historique FPS mesuré) et le **nombre d'erreurs observées** ; si aucune donnée, afficher « Non mesuré ». Son clic ouvre l'écran **Tests et performances** accessible aussi depuis **Plus**. Tests détaillés, paramètres, journaux et stress tests résident exclusivement dans cet écran ; ne pas ouvrir un cinquième onglet permanent.
- Les composants et métriques sont mutualisés entre écrans, adaptatifs Android, avec cible tactile ≥44 px et dégradation explicite en cas de perte WebGL.

### Galerie et identité du combattant
- Galerie : vignette **capturée du vrai combattant** dans sa **discipline initiale enregistrée**, nom, surnom, sexe, taille, poids, morphologie et caractéristiques clés. Afficher un état de portrait indisponible si aucune capture vérifiable ; ne pas substituer un dessin prétendument issu du GLB.
- Créateur : champs nom, surnom modifiable, **générateur aléatoire de surnom** cohérent avec caractéristiques et discipline, discipline initiale, taille (cm), poids (kg). Valeurs initiales non inventées pour les anciens profils ; migration non destructive. Le surnom reste éditable, le bouton peut régénérer et n'enregistre rien sans action de sauvegarde.
- Portrait de galerie cadré avec la tenue et la pose de référence de la discipline initiale ; persister avec le profil, versionner les données et gérer les profils historiques.
- Morphologie féminine réaliste et sportive (dont volume fessier indépendant, hanches, cuisses et poitrine), uniquement lorsque l'adaptateur GLB dispose des déformations réellement supportées.

### Critères de sortie
- Contrats TypeScript et tests d'intégration du paquet moteur, inventaire exhaustif, stress test déterministe, export/import combattant, galerie enrichie, mesures vérifiées sur Android physique et CI/CD verte. **Ne pas annoncer CME-3D 1.0 avant validation effective de ces critères.**

## 25/10/2026 — Décision : V1 progressive, onglet Feuille de route et versionnement
Décision utilisateur cumulative : déployer progressivement une V1 du suivi avant la majeure 1.0. **Ne supprimer ni réinterpréter les exigences précédentes.** Conserver quatre destinations principales Studio, Galerie Coachs, Comparatif, Plus. Sous **Plus**, ajouter **Feuille de route** distincte de Nouveautés et Incidents : inventaire des points à traiter avec identifiant stable, statut (Livré, En cours, À vérifier, À faire, Bloqué), priorité, domaine, version cible, explication et filtres. Un statut est déclaratif et versionné avec le code, jamais présenté comme synchronisé en temps réel avec GitHub sans intégration réelle. Mettre à jour les états lors de chaque livraison et distinguer « intégré » de « validé physiquement sur Android ». Les versions futures sont des cibles prévisionnelles. **Première livraison V1 : v0.7.30** avec un maximum de fonctions sûres et rapides ; livraisons suivantes incrémentales, CI verte, fusion, Pages vérifié et notes de version. Garder les contraintes de morphologie anatomique réelle, dont fessiers féminins indépendants, biomécanique des six disciplines, export moteur indépendant, zéro modification Shadow, sans CV/capture vidéo. Ne déclarer 1.0 qu'après satisfaction des portes de validation déjà définies.
