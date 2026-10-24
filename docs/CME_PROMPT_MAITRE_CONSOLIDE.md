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
