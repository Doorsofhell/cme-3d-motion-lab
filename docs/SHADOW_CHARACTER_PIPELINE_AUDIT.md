# Chaîne 3D Shadow : faits vérifiés

## Sources dans le dépôt Shadow (lecture seule)

- Commit initial `85dcebf8601777363ae2dddf0cc07952ebe973cb` : contient déjà `public/models/coach_female.glb`, `coach_male.glb`, leurs variantes `_manga.glb`, les masques et métadonnées. Le dépôt ne démontre donc pas que ces modèles ont été créés dans React.
- `src/three/CoachModel.tsx` : charge les GLB avec Drei `useGLTF`, clone le squelette, applique les matériaux PBR et les rendus manga.
- `src/engine/rig.ts` : `CoachRig` pilote un humanoïde compatible Mixamo ; IK analytique à deux segments, distribution du rachis, clavicules, doigts et contraintes.
- `public/models/coach_female_manga.meta.json` : positions des yeux, bouche, bassin, genou, épaules et visage, en mètres.

## Ce que cette enquête démontre

Le modèle géométrique est un **asset d'entrée** du moteur Shadow. Les scripts React ne sculptent pas eux-mêmes le corps. La création des GLB précède leur import dans le dépôt. Il faut donc retrouver la source d'export originale ou produire un nouvel asset humain avec un véritable générateur anatomique, puis l'adapter au rig compatible Mixamo.

## Spécification du prochain générateur Naïra

Entrée : base humaine organique originale féminine, morphologie sportive, visage détaillé, cheveux, mains et pieds. Sortie : GLB 2.0 avec textures PBR, armature humanoïde, weights, bind pose et correspondance Mixamo. Aucun assemblage visible de primitives. Sept tenues compatibles. Valider la licence de chaque asset.

## Critères de rejet

Refuser un modèle non skinné, sans UV, sans texture, au visage rudimentaire, avec géométrie disjointe artificielle, déformations articulaires incohérentes ou absence de vérification à 360 degrés. L'évaluation visuelle est obligatoire en plus des scripts automatiques.

## Étapes

1. Produire un corps original via MakeHuman/outil anatomique réellement exécutable ou sculpteur professionnel.
2. Retopologie et textures ; exporter rig humanoïde.
3. Vérifier les noms et positions des bones contre `CoachRig` et le modèle Shadow.
4. Produire les sept tenues, tester toutes les disciplines et les trois styles.
5. Activer Naïra uniquement après les portes G0–G6 et vérification mobile.

État : analyse technique de Shadow vérifiée ; pipeline de sculpture et asset final Naïra non encore disponibles.
