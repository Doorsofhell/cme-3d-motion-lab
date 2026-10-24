# Fil conducteur CME-3D — 2026-10-24

## Décision produit permanente
CME-3D est un **laboratoire biomécanique + éditeur premium de coachs**, et non une application d'entraînement. La marque reste **Shadow Dark Combat Premium** (rouge, noir, surfaces sobres), tandis que BetterMe inspire uniquement la simplicité, l'espacement, les catégories lisibles et la navigation mobile. **Ne jamais modifier le dépôt Combat Shadow Studio.**

## Parcours principal
- Navigation basse : Laboratoire, Studio Coach, Comparatif 3D, Plus (Incidents, Versions, Options).
- Studio Coach : sélection homme/femme immédiate, aperçu 3D dominant, catégories disposées sur une grille sans défilement horizontal, choix rapides, options avancées repliées.
- Le test de mouvement et l'import/export sont secondaires et repliés.
- Aucune fonction précédemment livrée n'est supprimée.

## Anomalie observée dans la capture utilisateur
Le mannequin procédural montre une anatomie simplifiée et des vêtements grossiers. L'éditeur était encombré, avec catégories et sliders coupés sur mobile. La vue riggée existante neutralisait également les textures de tous les matériaux (gris uniforme), empêchant de distinguer peau, tenue et protections.

## Lot PR #55
- Studio Coach utilise par défaut les GLB riggés existants.
- Les textures des GLB ne sont plus effacées dans NeutralRig.
- Un adaptateur conservateur colore seulement les matériaux identifiés par leurs noms ; les matériaux inconnus conservent leurs propriétés.
- Sélection du sexe en accès direct ; presets morphologiques simples ; réglages fins dans « Avancé » ; grille de catégories mobile sans clipping.
- Tests unitaires de l'adaptateur et isolation du squelette.

## Limites / risques non résolus
- Les GLB sont des modèles existants, pas deux nouveaux humanoïdes neutres certifiés.
- Les matériaux dont le nom n'indique pas clairement leur zone ne sont pas personnalisés. Il faut inspecter leurs noms réels et ajouter des mappings vérifiés.
- Les paramètres de morphologie et de visage ne sont pas encore appliqués aux vrais meshes skinnés ; le mannequin procédural reste un aperçu technique secondaire.
- La justesse biomécanique, le retargeting et les FPS Android nécessitent encore une validation sur appareil réel.
- Les captures de référence BetterMe ne sont pas une autorisation de reprendre leurs assets ou identité.

## Critères de livraison
TypeScript + tests + build Pages verts, aucun changement dans le moteur canonique, GitHub Pages vérifié, tests Android et visuels encore explicitement signalés comme non certifiés.

## Correction du 24/10 — séparation impérative des modes 3D
L'utilisateur a confirmé sur capture Android : **Rig neutre** = humanoïde d'étude monochrome, sans texture de peau ni équipement distinctif, destiné exclusivement aux tests des mouvements. **Apparence** = combattant humain texturé, habillé et personnalisable. Le mannequin procédural ne doit plus être exposé comme résultat visuel.

- Mode Apparence sélectionné par défaut ; source GLB riggée texturée.
- Mode Rig neutre : matériau gris mat uniforme, textures supprimées, accessoires séparables explicitement identifiés masqués.
- Les deux modes sont remontés indépendamment afin d'éviter les fuites de matériaux.
- Ne pas prétendre qu'un GLB habillé devient un humanoïde anatomiquement nu par simple changement de matériau : la géométrie des vêtements fusionnés nécessite de vrais assets neutres.
- Garder la personnalisation progressive, les catégories lisibles, les trois espaces principaux, le menu Plus et la charte Shadow.
- Proposer à chaque étape des choix prédéfinis pertinents pour le prochain lot, en conservant ce fil conducteur.

## Lot 1 — humanoïdes neutres (étape intermédiaire)
- Le mode Rig neutre masque entièrement les meshes source habillés et reconstruit un **proxy anatomique procédural gris mat**, attaché aux os du squelette existant (homme et femme).
- Ce proxy ne contient ni texture de peau, ni costume, ni accessoires. Le mode Apparence conserve ses modèles réalistes texturés.
- Les six disciplines passent par les mêmes `CoachRig`, `MotionSampler` et `getLibrary` ; aucune duplication du moteur ni modification de Shadow.
- Les tests automatisés vérifient la présence des segments sur les deux sexes, leur rattachement aux os et l'absence de texture. **Ils ne valident pas encore le retargeting physique** ni les trajectoires des 6 disciplines sur de vrais GLB.
- Ce proxy articulé ne remplace PAS deux modèles humains neutres sculptés/riggés de qualité production : le volume est schématique. Les assets GLB dédiés, l'audit des poids de skinning et les mesures Android restent à réaliser.
- Prochain lot recommandé : produire/importer deux vrais meshes anatomiques neutres sous licence compatible, avec squelette identique et comparaison quantitative A/B.

## 24/10 — consignes complémentaires consolidées
- Toute instruction future complète le **prompt maître** dans `docs/CME_PROMPT_MAITRE_CONSOLIDE.md`, sans réinitialiser les acquis.
- À chaque interaction : analyse croisée, réalisation mesurable, statut honnête et choix prédéfinis recommandés.
- Bug P0 remonté sur Android : l'écran Studio Coach ne défile ni vers le haut ni vers le bas ; correction CSS du propriétaire du défilement vertical entre en-tête et barre basse, avec touch-action pan-y et overflow-y auto.
- Parcours cible strict : animations testées d'abord sur humanoïdes neutres ; coachs construits en mode Apparence à partir du même rig ; coachs sauvegardés visibles et testables dans le Laboratoire.
- Première liaison de bibliothèque locale Studio → Laboratoire ; sélection ouvre le profil dans Studio. **Le chargement du coach directement comme acteur animé du Laboratoire reste à implémenter.**
- Test tactile réel Android à confirmer malgré CI verte.

## 24/10 — Lot A : liaison des coachs aux acteurs animés
La bibliothèque du Laboratoire ne renvoie plus simplement vers Studio Coach : la sélection d'un profil charge le rig homme/femme correspondant dans la scène, avec couleurs personnalisées lorsque les matériaux sont identifiables, et conserve les animations canoniques. Persistance locale, sélection visuelle et tests de mapping. Limites : morphologie/tenues partiellement effectives, validation Android et biomécanique complète en attente.

## Lot catalogue Shadow — 24/10/2026
Audit en lecture seule des versions actuelle et initiale de techniques/exercices : 75 techniques distinctes, 208 exercices déjà importés, cinq références Shadow absentes du catalogue de techniques CME. Ajout d'un inventaire séparé, tests de déduplication et panneau de consultation. Les états « mappé » et « biomécaniquement validé » restent distincts ; vérification exhaustive des anciens assets et du retargeting toujours en attente.

## 24/10 — Priorité ergonomie et non-régression
P0 : grande scène de test, double clic/tap pour plein écran, commandes techniques repliées, Studio Coach en mode rig neutre par défaut. À confirmer sur Android réel : présence et qualité visuelle du rig neutre, actualisation des meshes pendant chaque modification, double tap tactile, absence de débordement vertical et performances. Les tests CI ne remplacent pas cette validation visuelle. Maintenir compatibilité future des acteurs et profils avec Shadow sans toucher son dépôt.
