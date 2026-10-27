# CME-3D 0.7.44 — Recette ciblée : Android et anatomie 4 vues

## Audit réalisé sur le code
- Avant : le cadrage corps entier était déduit des pivots du squelette seulement ; les volumes mammaires, fessiers, mains et pieds pouvaient déborder du cadre.
- Avant : écran Studio Android de 186 à 300 px de haut, quatre vues réorganisées en deux rangées sous 420 px.
- Correction : calcul des enveloppes des Mesh 3D réellement visibles, prise en compte des transformations de monde ; résultat conservateur et même distance de caméra sur les quatre angles.
- Correction : vue de face initiale, retour « Vue entière », 4 commandes sur une ligne (sauf écran de moins de 321 px), aperçu 220–340 px de haut.

## Vérifications automatiques
- Deux silhouettes synthétiques distinctes H/F, incluant poitrine et fessiers ; les meshes masqués n'étirent pas le cadrage.
- Face, dos, profils : directions réciproques et visibilité des huit coins de chaque volume synthétique sur proportions mobiles (ratios .5, .7 et 1.7).
- CI TypeScript, Vitest, téléchargements des véritables GLB CC0, compilation Pages et déploiement.

## Portes non couvertes par les tests automatisés
- Rendu pixel par pixel sur Android physique (WebGL/GPU, contraste, matières, artefacts de skinning), FPS p50/p95 et interactions sur appareil.
- Une comparaison morphologique artistique certifiée avec les planches de référence de l'utilisateur.
- Les GLB CC0 de référence restent à 163 os et en lecture seule ; retargeting et morphs finaux non livrés.

## Scénario de recette physique Android
1. Ouvrir Studio, corps neutre, Femme ; photographier face/dos/profil droit/profil gauche à silhouette entière.
2. Modifier dans les limites disponibles poitrine, taille, hanches, fessiers, cuisses ; vérifier transitions, absence de déformation locale incohérente, cou et pieds au cadre.
3. Répéter Homme avec les mêmes réglages et au moins trois gabarits (naturel, athlétique, fort).
4. Basculer mode mannequin gris/étalon CC0/créateur ; confirmer que l'étalon reste lecture seule et que les modifications du coach restent conservées.
5. Test écran étroit, rotation Android, fullscreen, retour arrière, WebGL perdu/restauré et changement homme/femme 10 fois.
6. Relever FPS p50/p95 et latence GLB, joindre huit captures pour validation des deux sexes sous quatre vues.

**Interprétation** : tests de cadrage et compilation verts ne valent pas validation visuelle sur téléphone.