# CME-3D 1.0 — Schéma directeur produit et UX

**Décision validée le 25 octobre 2026 — Option B : refonte mobile premium d'abord.**

> Document de référence **actif**. Il précise les priorités du [prompt maître](CME_PROMPT_MAITRE_CONSOLIDE.md) sans supprimer son historique. La version 1.0 demeure un objectif futur et n'est pas une livraison déclarée.

## 1. Décision fondatrice : expérience mobile premium d'abord

Le commanditaire a explicitement choisi **B** : réaliser la refonte de l'expérience mobile à partir de ses maquettes **avant** l'intégration des futurs modèles anatomiques et des animations avancées. Cela ne dispense pas de conserver les modèles et mouvements *existants* fonctionnels pendant le chantier.

**Ordre contraignant**
1. **UX0 — Structure mobile** : architecture de l'information, hiérarchie des écrans, parcours principal, stratégie du viewport et des panneaux, une seule navigation inférieure.
2. **UX1 — Design system** : tokens dark premium, composants partagés, icônes anatomiques compréhensibles, états actifs/chargement/indisponibilité, responsive Android.
3. **UX2 — Studio Coach** : grand humanoïde permanent, choix H/F, zones visuelles, commandes contextuelles, préréglages, modifications visibles, undo/redo, validation claire, sauvegarde/galerie.
4. **UX3 — Mouvements et Galerie** : sélection simplifiée réellement exécutable, transition immédiate Studio→Test, profils éditables, aucune duplication de scène ou navigation.
5. **UX4 — Recette UX et stabilisation** : Android portrait/paysage, tactile, clavier, safe-area, performance, accessibilité, parcours de bout en bout, CI / mise en production de l'expérience refondue.
6. **3D1 — Actifs définitifs** : seulement après stabilisation UX, intégrer progressivement deux maillages humains originaux H/F adaptés au moteur, les morphs réels, cheveux/visages/peau PBR, outfits et accessoires.
7. **3D2 — Animation avancée** : retargeting et biomécanique du nouveau rig, enchaînements multi-disciplines, contacts/appuis/transitions, comparaison read-only avec Shadow.
8. **1.0 — Validation majeure** : gates artistiques, biomécaniques, Android, accessibilité, sécurité mémoire, CI, publication et validation utilisateur.

Une dépendance technique P0 bloquante peut être corrigée en cours de phase UX. Cela n'autorise pas à renverser la priorité validée sans nouvelle décision explicite.

## 2. Vision du produit, sans confusion avec une maquette

**CME-3D est un Studio Coach mobile premium ET un laboratoire de validation de mouvements de combat**, pas une application de coaching sportif ni un clone de Shadow Studio.

Promesse visible : *Choisir un modèle → Personnaliser visuellement → Enregistrer ou tester son mouvement*.

Espaces fonctionnels préservés :
- **Studio Coach** : créer/personnaliser homme et femme avec un vrai aperçu 3D ; morphologie globale, parties du corps, tête/visage, peau, cheveux/pilosité, tenue, protections et discipline.
- **Mouvements** : choisir discipline, technique ou enchaînement compatible avec le rig actif ; jouer/pause/retour au début, ralenti, caméra pédagogique ; la preuve d'exécution est distincte de la simple présence dans un catalogue.
- **Galerie** : retrouver, dupliquer, modifier, supprimer, réutiliser et tester les profils.
- **Comparatif CME/Shadow** (Shadow **lecture seule**), Atlas, télémétrie, incidents, options, nouveautés : fonctions conservées mais rangées hors du parcours principal.

**Point ouvert pour la décision d'architecture UX suivante :** type d'agencement mobile du Studio (viewport fixe + tiroir de réglages, viewport immersif + feuilles, ou présentation hybride). Le nombre et les libellés définitifs des destinations de la barre basse ne sont pas reconfirmés par cette décision : préserver temporairement la navigation existante et arbitrer seulement après le modèle d'agencement.

## 3. Traduction des neuf maquettes fournies

Les maquettes sont des **références visuelles et ergonomiques**, pas des captures de l'application actuelle ni des assets prêts à intégrer. Ne pas recopier des éléments protégés.

Principes impératifs :
- Scène 3D dominante, personnage toujours lisible, fond sombre, repères de cadrage sobres, caméra 360°, zoom contextuel visage / corps / bassin / pieds.
- Homme/femme explicitement sélectionnables ; corps neutres gris de référence et apparences humaines réalistes sont **deux modes distincts**, jamais confondus avec des maillages prêts à l'animation.
- Catégories anatomiques reconnaissables par **vraies icônes homogènes** ; une zone active à la fois ; préréglages graphiques de formes, puis curseurs détaillés.
- Peau : palette accessible et effet visible sur le personnage. Cheveux : coupe et coloration visibles. Visage : plan rapproché et morphs effectivement disponibles. Aucun bouton inerte ni promesse fictive.
- Le bas de l'écran concentre les réglages **contextuels**, une action primaire claire et la navigation principale **unique**, jamais trois barres empilées.
- Valeurs lisibles, sliders faciles à manipuler, cibles tactiles ≥44 px, lisibilité des contrastes, respect de la zone sûre Android ; éviter micro-texte, chevauchements et scroll horizontal involontaire.
- Couleurs de marque CME : Dark Combat Premium, neutres profonds, accent principal rouge ; cyan/bleu pour sélection et aide visuelle, sans copier mot pour mot les maquettes.

## 4. Architecture d'interface : obligations indépendantes de l'agencement choisi

- **Hiérarchie visible :** identité du coach, étape active, mannequin 3D, paramètre et résultat ; un seul bouton principal de validation.
- **Révélation progressive :** la page courante expose les fonctions utiles ; diagnostics, CSS techniques, options expérimentales et détails de rig restent accessibles dans « avancé ».
- **État unifié :** une sélection H/F, une morphologie, une caméra, des valeurs sauvegardées partagées entre Studio/Galerie/Mouvements ; aucun écran ne reflète un profil différent sans avertissement.
- **Composants partagés :** navigation, barre caméra, viewport, contrôles, carte anatomique, slider, palette, presets, validation, feuilles modales, chargement, erreurs et profils.
- **Performances :** éviter démontages WebGL superflus, rechargements GLB répétitifs et pipeline de textures lourd à chaque slider ; viser 30 FPS Android balanced et mesurer FPS p50/p95, latence GLB, récupération WebGL.
- **Accessibilité :** libellés compréhensibles, états disabled explicites, focus clavier, reduced motion, tailles de zones tactiles et interactions utilisables d'une main.

## 5. Capacités et exigences futures à préserver après la refonte UX

- Parité de **richesse** H/F, et adaptation anatomique selon le sexe. Modèle femme harmonieux, poitrine/bassin/tailles/hanches/fessiers/cuisses cohérents ; modèle homme crédible avec pectoraux/carrure/bassin.
- Tailles/poids/latéralité et disciplines modifiant réellement morphologie, posture, équipements pertinents selon ressources ; non-destructif, save/undo/redo, valeur originale restaurable.
- Catalogue de six disciplines : boxe, kickboxing, Muay Thaï, MMA, judo, JJB/BJJ ; techniques et enchaînements sélectionnables mais **exécutables seulement si validés par le vrai moteur**.
- Référentiel biomécanique international, protocole de comparaison CME/Shadow en lecture seule, modes Ultra/Fitness/Comics, galerie, sauvegarde, historique, telemetry, UX premium desktop/tablette **après** Android.
- Ne jamais transformer un simple shader gris ou des formes primitives en fausse « sculpture premium ». Deux vrais modèles organiques finaux et morph targets seront des jalons 3D ultérieurs avec provenance/licences vérifiées.

## 6. Portes de validation et non-régression

| Porte | Critère de passage |
| --- | --- |
| UX-G0 | Le schéma directeur, l'arborescence des écrans et le modèle d'interaction sont explicites |
| UX-G1 | Maquettes UX adaptées à Android, design system partagé, grands touch targets |
| UX-G2 | Tous les boutons visibles ont un effet attestable ou un état indisponible compréhensible |
| UX-G3 | Parcours complet « créer → changer plusieurs zones → enregistrer → retrouver → tester » sans blocage |
| UX-G4 | Aucun comportement Studio/Galerie/Mouvements contradictoire, pas de scroll horizontal ni de barre concurrente |
| TECH-G0 | CI TypeScript/Vitest/build verte, contrôles GLB, aucune régression des mouvements canoniques |
| TECH-G1 | GitHub Pages publié et réponse de l'application publique vérifiée |
| QA-ANDROID | Recette physique sur Android, vidéos/captures ou observations utilisateur distinctes de CI |
| 3D-GATES | Contrôle maillage, rigging, morphs, peau, cheveux, 4 angles, licences et biomécanique avant annonce de qualité finale |

**Protection absolue :** ne pas modifier `Doorsofhell/combat-shadow-studio`. Les changements dans CME restent isolés, et la présence de fichiers Shadow importés n'autorise pas de réécriture du projet source.

## 7. Protocole permanent d'interaction avec le commanditaire

- **En français**, court, concret, sans lui redemander des décisions acquises.
- **Choix libre en PREMIER**, avec champ permettant toute formulation.
- Ensuite **deux ou trois options A/B/C cliquables**, description succincte et recommandation explicite.
- **Une seule question structurante par échange**, classée par dépendance et conséquence architecturale ; ne pas encombrer de réglages techniques mineurs.
- Une décision validée = l'inscrire dans ce schéma et le prompt maître, conserver le journal d'historique ; puis seulement poser la prochaine question stratégique.
- Différencier clairement « schéma validé », « codé », « CI verte », « fusionné », « déployé » et « vérifié sur Android ».
- Aucun chantier continu n'est supposé se poursuivre en arrière-plan après la réponse.

## 8. Journal des arbitrages

| Date | Décision | Statut |
| --- | --- | --- |
| 25/10/2026 | Priorité **B** : refonte UX mobile premium depuis maquettes, avant nouveaux GLB et animations | **Validée** |
| 25/10/2026 | Choix libre prioritaire + boutons cliquables + une question stratégique à la fois | **Validée** |
| À arbitrer | Agencement mobile principal du Studio Coach : fixe / immersif / hybride | **Prochaine décision** |
| À arbitrer après agencement | Destinations et ordre définitifs de navigation ; proportions scène/réglages ; niveaux de personnalisation | **À venir** |
| À arbitrer ultérieurement | Politique d'assets finaux, rig et méthode de personnalisation anatomique H/F | **Après UX stabilisée** |
