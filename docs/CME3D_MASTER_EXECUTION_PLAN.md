# CME-3D — Plan directeur d'exécution

## Priorité exécutive validée le 25/10/2026 : UX mobile d'abord (option B)

**Ce paragraphe remplace uniquement l'ordre historique du travail ci-dessous** et renvoie au [schéma directeur CME-3D 1.0](CME3D_SCHEMA_DIRECTEUR_1_0.md). Ordre désormais applicable : 1) structure UX Android ; 2) design system et composants partagés ; 3) Studio Coach et paramètres contextuels ; 4) lien simple Mouvements/Galerie ; 5) recette UX, fusion et déploiement vérifiés ; **puis** modèles 3D anatomiques finaux et personnalisation H/F avancée ; **puis** animation/retargeting, tout en conservant les acquis du moteur courant. Les travaux existants sur Naïra et les modèles organiques restent des exigences produit mais ne dictent plus le premier chantier.

**Arbitrage suivant encore ouvert :** architecture d'écran Studio scène/commandes. Ne pas présumer sa validation à partir des maquettes.

## Mission
Créer un laboratoire de production, validation et comparaison de personnages et animations 3D de sports de combat. Shadow Studio reste en lecture seule. La qualité visuelle doit dépasser les prototypes rudimentaires déjà rejetés.

## Diagnostic
Amara et Kadir fonctionnent grâce à de vrais modèles GLB, textures, armatures et tenues. Les deux prototypes de Naïra créés par assemblage de primitives Blender ont été rejetés. Le problème principal est l'absence de modèle humain original professionnel, et non le moteur Three.js.

## Intervenants / responsabilités
Architecte technique : intégration et non-régression. Directeur artistique : identité visuelle. Character artist : sculpture, anatomie, visage et mains. Texture artist : UV et PBR. Technical artist : rigging et skinning. Animateur : techniques de combat. Biomécanicien et experts de chaque discipline : mouvements et appuis. Développeur React/Three.js : application et performances. QA : tests. DevOps : CI, GitHub Pages et PWA. Ce sont des fonctions requises, pas des personnes déjà engagées.

## Technologies
React, TypeScript, Vite, PWA, Three.js, React Three Fiber, Drei, glTF 2.0/GLB, Blender, UV, PBR, rigging, CoachRig, MotionSampler, Vitest, GitHub Actions et GitHub Pages. Les générateurs humains Meshy, Tripo et Hunyuan3D sont des candidats à évaluer selon l'accès effectif et les droits d'utilisation.

## Direction artistique Naïra
Femme adulte originale, athlétique, proportions féminines crédibles, musculature fonctionnelle, visage détaillé, mains et pieds anatomiques, cheveux adaptés au combat. Maillage organique continu, matériaux PBR et silhouette cohérente à 360 degrés. Aucune copie d'Amara ni personnage protégé. Trois styles : Ultra-réaliste, Fitness, Héros comics. Sept tenues : boxe, kickboxing, MMA, muay-thaï, BJJ, BJJ no-gi et judo.

## Ordre d'exécution
1. Auditer dépôt, assets, tests, déploiement et référence Shadow en lecture seule.
2. Constituer l'Atlas biomécanique et vérifier les licences des projets GitHub pertinents.
3. Produire le véritable modèle original de Naïra avec outil de sculpture ou génération humaine de qualité, puis retopologie, UV et textures.
4. Rigger le modèle et créer les sept tenues sans intersections anormales.
5. Intégrer au moteur et valider les trois styles sans changer Amara ou Kadir.
6. Tester les mouvements de boxe, kickboxing, MMA, muay-thaï, BJJ et judo : appuis, trajectoires, angles, torsions et contacts.
7. Comparer CME-3D et Shadow à technique et caméra identiques, sans modifier Shadow.
8. Tester, fusionner, déployer sur GitHub Pages et vérifier le chargement mobile/PWA.

## Portes de validation
G0 provenance et droits. G1 contrôle visuel à 360 degrés. G2 géométrie, UV, PBR. G3 squelette et skinning. G4 sept tenues. G5 tests biomécaniques et non-régression. G6 CI, Pages et application publique vérifiée. Une simple signature GLB valide ne suffit pas à certifier le personnage.

## Politique de travail
Agir immédiatement sur les tâches réalisables. Ne pas annoncer un modèle final à partir de primitives. Distinguer préparation, PR, CI, fusion, déploiement et vérification réelle. En cas d'outil de production 3D inaccessible, préciser la dépendance et poursuivre les travaux indépendants.

## État au 24 octobre 2026
Amara/Kadir présents. Naïra enregistrée mais désactivée. Scripts de contrôle structurel présents. Deux prototypes rejetés. Modèle organique professionnel, rigging, sept tenues et publication Naïra non réalisés.
