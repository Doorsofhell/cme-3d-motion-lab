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
