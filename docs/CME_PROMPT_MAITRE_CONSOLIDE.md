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
