# CME-3D — Studio de création et validation de coachs

Décision du 24 octobre 2026. CME-3D est un laboratoire de **mouvements canoniques et de création de coachs**, pas une application d'entraînement. Combat Shadow Studio est une source de référence en lecture seule et n'est pas modifié.

## Principe immuable

Deux humanoïdes neutres de référence (homme/femme) utilisent un squelette et un moteur de mouvements communs. Toute apparence de coach est une couche non destructive appliquée au rig canonique. **Une modification esthétique ne doit pas changer la cinématique, les impacts, les appuis ou la logique de discipline.** Les changements morphologiques qui affectent réellement la portée ou les proportions imposent un retargeting et de nouveaux tests, sans altérer la motion source.

## Navigation mobile et bureau — trois onglets ancrés en bas

1. **Laboratoire** (accueil par défaut) : humanoïde neutre homme/femme, six disciplines, technique ou scénario Shadow, vitesse 0.25–1.5x, image par image, boucles, vues caméra, squelette, articulations, contacts et diagnostics.
2. **Stress Test / A-B** : séquences expertes, 208 exercices Shadow importés sous réserve de compatibilité, répétitions, contrôle des transitions, comparaison côte à côte à temps synchronisé et rapport d'anomalies.
3. **Studio Coach** : création, personnalisation, essais sur mouvement de référence, presets, sauvegarde et export d'un look indépendant du moteur.

## Studio Coach : éditeur de personnalisation

### Identité et morphologie
- Base homme/femme, taille, masse, proportions, largeur d'épaules, poitrine, taille, bras, jambes, cou, définition musculaire.
- Contrôles de morphologie avec limites anatomiques, profils léger/athlétique/puissant, comparaison avant/après.
- Contrôles faciaux : mâchoire, pommettes, arcades, nez, forme générale, yeux; extensions futures : oreilles, lèvres, asymétries et âge apparent (sans reconnaissance d'identité).
- Peau : palette inclusive et sélection libre de couleur, rendu PBR cohérent; yeux, cheveux (coupe, longueur, couleur), barbe, pilosité, tatouages (zone, rotation, taille, opacité).

### Vêtements et protections
- Bas : shorts boxe/MMA/thaï, compression, legging, judogi/gi adaptés; hauts : rashguard, débardeur, t-shirt, brassière, veste de gi.
- Gants boxe/MMA, bandes, protège-tibias/pieds, chaussures, chevillères, casque, protège-dents, protections de corps.
- Couleurs primaire/secondaire, motifs, matériaux (mat/brillant/tissu/cuir), coutures, logos originaux, tailles et placement.
- Préréglages par discipline et avertissements de compatibilité (ex. gants boxe en judo), sans verrouiller inutilement l'expérimentation.
- Vérification du clipping vêtements-peau, collisions, déformations de skinning, accessoires rigides et consommation GPU.

### Workflow
- Réglages instantanés avec annuler/rétablir, réinitialisation par section, presets, randomisation réaliste avec seed.
- Enregistrement de profils versionnés au format JSON (pas de données biométriques personnelles nécessaires), import/export avec validation stricte et migrations de schéma.
- Prévisualisation 360°, poses fixes, garde, coups, projections solo, transitions et stress tests; éclairage/caméra constants pour comparaison.
- Comparaison du même mouvement sur humanoïde neutre et coach habillé, avec overlay squelette, différence de positions articulaires et budget de performance.
- Modes Ultra/Fitness/Comics sur le **même coach et le même rig**, sans divergence biomécanique.
- Export d'une configuration de coach réutilisable par Shadow à terme, **sans écriture directe dans Shadow**.

## Réutilisation raisonnée de Shadow (audit du dépôt)
- `src/editor/look.ts` : schéma FighterLook riche (corps, visage, peau, yeux, cheveux, barbe, tatouages, vêtements, protections, peintures et motifs).
- `src/editor/normalize.ts` et `src/editor/random.ts` : bornes, validation et archétypes; ne pas copier les dépendances UI sans adaptation.
- `src/three/customize.ts` : déformation morphologique des sommets, skinning partagé des vêtements et accessoires attachés aux os. **Auditer les performances et licences avant réemploi**, particulièrement sur Android.
- `src/editor/tattoos.ts` : tatouages et atlas, sous réserve de licences.
- Le code de Shadow ne doit pas être modifié; l'import dans CME doit être traçable (commit source, licence, adaptations, tests).

## Contrats et séparation des responsabilités
- `CanonicalRig` : os, repères, contraintes, morphométrie.
- `MotionAsset` : cinématique, phases, contacts, timing et discipline.
- `CoachAppearanceV1` : champs esthétiques uniquement, référence au profil de base, couleurs, morphs, équipements.
- `AppearanceRenderer` : applique le look et renvoie diagnostics de clipping/performance, sans modifier `MotionAsset`.
- `CoachPreset` : identifiant, version, métadonnées, apparence et compatibilité des assets.
- `ValidationReport` : comparaison humanoïde nu technique / coach habillé, erreurs articulaires, transitions, FPS, style et anomalies.

## Lots d'implémentation, par dépendance

**P0 A — Architecture et socle** : figer le schéma `CoachAppearanceV1`, les bornes de personnalisation et les tests de sérialisation; conserver l'application fonctionnelle. PR séparée.

**P0 B — Deux humanoïdes neutres 3D** : GLB, rig canonique et mesures; qualification sur les six disciplines, sans prétendre qu'ils existent avant livraison.

**P1 C — Studio Coach MVP** : peau, morphologie, visage, cheveux, tenue et gants; rendu temps réel, préréglages, sauvegarde JSON, undo/redo.

**P1 D — Tests de non-régression** : même séquence et moteur sur neutre/habillé, comparaison des articulations, collisions, fps; golden fixtures par humanoïde.

**P1 E — Équipements complets** : personnalisation des matériaux, protections, tatouages, tenues et compatibilité des six disciplines.

**P1 F — Stress Test / A-B** : longues séquences, transitions et comparaison moteur sur les deux humanoïdes et leurs coachs.

**P2 G — Bibliothèque et export** : galerie, presets, import/export, validation des schémas, export non destructif compatible Shadow.

**P2 H — Données vidéo sous licence** : recherche et provenance, extraction automatisée hors navigateur autorisée, validation humaine; ne jamais entraîner sur des vidéos sans droits adéquats.

## Critères d'acceptation
- `npm run typecheck`, `npm test`, `npm run build` réussis.
- Aucune régression non approuvée de mouvement canonique.
- Paramètres du look persistants après sauvegarde/chargement, contrôles de valeurs invalides.
- Comparaison neutre/habillé : cinématique canonique inchangée à morphologie équivalente; retargeting explicite si proportions changent.
- Tous les équipements visibles et correctement attachés en mouvement; clipping et pertes de performance signalés.
- Six disciplines, deux humanoïdes et scénarios complexes testables.
- Android qualité équilibrée >=30 FPS soutenus sur appareil de référence.
- Trois styles visuellement différenciés; Pages déployé et version affichée vérifiée.

## État
Ce document est une spécification de refonte, pas une preuve de réalisation du Studio Coach. Les modèles neutres, l'éditeur complet et les tests A/B cinématiques restent à construire. Les PR #46, #47 et #48 sont à coordonner avant fusion afin d'éviter des conflits.
