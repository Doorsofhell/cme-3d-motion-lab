# NAÏRA — Production 3D de qualité jeu vidéo

## Diagnostic confirmé (24 octobre 2026)

Les personnages Amara et Kadir de CME-3D utilisent déjà les assets réels de Shadow Studio, avec `photo.glb`, `tenues/*.glb`, `CoachRig` et `MotionSampler`. Le laboratoire applique ses rendus Ultra-réaliste, Fitness et Comics au **même personnage riggé**. Le blocage de Naïra n'est donc pas le moteur de rendu : c'est l'absence d'un **troisième asset humain original de qualité production**.

Deux prototypes Blender (27 et 28 maillages distincts, formes géométriques) ont été rejetés. **Ils ne doivent jamais être importés comme personnage jouable**, ni utilisés comme référence de qualité.

## Direction artistique non négociable

- Femme adulte, athlète de combat fitness crédible, environ 1,72–1,78 m, proportions féminines naturelles et puissance musculaire fonctionnelle.
- Morphologie distincte d'Amara : taille dessinée, bassin/hanches proportionnés, fessiers et quadriceps athlétiques, épaules et dos travaillés, bras entraînés, anatomie cohérente sans caricature ni hypersexualisation.
- Visage féminin original expressif, yeux, nez, lèvres, mâchoire et oreilles sculptés, cheveux attachés adaptés au combat ; aucune copie de personne ou personnage protégé.
- Maillage organique anatomique **continu**, silhouette soignée à 360°, topologie propre aux articulations, UV, textures PBR et normal maps ; pas d'assemblage de sphères/cônes/cylindres.
- Tenues techniques originales, brassière et short adaptés au corps, protections selon discipline ; pas d'intersections corps/vêtement.

## Chaîne de production retenue

1. **Asset de base** : utiliser un véritable générateur humain texturé (p. ex. Meshy Text-to-3D, multi-image-to-3D ou un sculpteur humain professionnel) avec pose A/T et géométrie complète. Ne pas réutiliser Amara sous une déformation géométrique.
2. **Retopologie et matériaux** : vérifier anatomie, continuité de surface, UV, PBR, visage, mains (5 doigts), pieds, symétrie anatomique et absence de maillages flottants.
3. **Rig** : armature humanoïde complète, skinning avec poids normalisés, mapping vers les noms de bones utilisés par `CoachRig` ; bind pose identique aux animations, rigging des doigts si disponibles.
4. **Tenues** : produire `boxe`, `kickboxing`, `mma`, `muaythai`, `bjj`, `bjj-nogi`, `judo` pour Naïra, compatibles avec son armature.
5. **Moteur** : brancher `fighters/mma-naira/photo.glb` et `fighters/mma-naira/tenues/*.glb` via le mécanisme existant `Fighter`, sans modifier Amara/Kadir/Shadow Studio.
6. **Tests** : visualiser à 360° les trois styles, contrôler garde, directs, crochets, kicks, genoux, déplacements, projections et sol, skinning, tenue, mains, coudes, chevilles et pieds sur Android.
7. **Publication** : uniquement après passage des tests, activer le sélecteur, fusionner, vérifier le workflow Pages et charger l'URL publique avec la nouvelle version.

## Portes de qualité (obligatoires)

- **G0 — source originale et droits** : provenance et droit de distribution commerciale documentés.
- **G1 — rendu** : revue visuelle du corps, du visage, des mains et des tenues sur quatre vues ; comparaison explicite avec Amara/Kadir. **Pas de validation automatique par simple taille de fichier**.
- **G2 — géométrie** : GLB 2.0, meshes skinnés, UV et matériaux présents, pas de formes primitives visibles ; limites de polygones et textures adaptées au mobile.
- **G3 — rig** : bones obligatoires, weights valides, bind pose, mobilité sans déformation anatomique.
- **G4 — vêtements** : sept tenues adaptées, aucune intersection significative sur poses extrêmes.
- **G5 — animation** : contrôles biomécaniques sur techniques réelles et tests de non-régression.
- **G6 — livraison** : CI vert, Pages déployé, web app effectivement mise à jour, cache/PWA vérifiés.

**Aucune étape G0–G6 ne doit être déclarée réussie sans élément vérifiable.** Les scripts structurels GLB sont nécessaires mais non suffisants. Le suivi de l'onglet Versions doit refléter les états réels, pas un pourcentage arbitraire.

## État au 24/10/2026

- Architecture et sélecteur Naïra : réalisés, Naïra désactivée.
- Scripts de vérification des GLB : réalisés, incomplets pour l'évaluation artistique.
- Sculpture humaine professionnelle : **non produite**.
- Armature, tenues, tests d'animation, publication de Naïra : **non réalisés**.

**Dépendance bloquante** : fournir ou générer un GLB humanoïde original riggé, de qualité production. La génération de primitives dans Blender n'est pas une solution acceptable.
