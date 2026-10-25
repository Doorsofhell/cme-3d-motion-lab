## 26/10/2026 — The Sculptor's Workspace, premier lot UX v0.7.49

**Décision additive utilisateur :** interface de sculpture numérique « Studio 3D Lab » true black / anthracite ; viewport 3D réel 55 %, panneau inférieur 45 %, grille spatiale Three.js, commandes caméra latérales non superposées, deux axes X/Y de zones anatomiques, curseurs de précision à affichage monospacé et accent néon, galerie horizontale de vrais préréglages, validation par coche rouge. Le 4-onglets global Studio Coach / Mouvements / Galerie / Plus reste **inchangé**. Technologie existante React + R3F conservée (pas de migration RN/Flutter induite par la formulation du rôle).

Les composants ajoutés sont `PrecisionSlider.tsx`, `SculptorViewportTools.tsx`, `SculptorWireframe.tsx` et `SculptorWorkspace.css`, décrits dans [`SCULPTORS_WORKSPACE_0749.md`](SCULPTORS_WORKSPACE_0749.md). Le maillage filaire est issu des vrais GLB, matériaux clonés puis restaurés, pas d'asset nouveau. Haptique de seuil facultative. Contrôles non supportés par le GLB désactivés avec raison. **Aucune** modification du dépôt Shadow, du rig canonique, des skin weights ou des trajectoires ; caméra utilisateur, vidéo, mocap et computer vision exclus.

**Vérification exigée avant fusion** : tests Vitest / TypeScript / actifs GLB / build et CI verte ; déploiement vérifié. **Recette physique Android et FPS / GPU / latence : Non mesuré**, et restent à obtenir avant déclaration de conformité complète aux neuf maquettes. Le présent lot améliore la mise en page et les contrôles, pas les sculptures 3D finales.

# CME-3D 1.0 — Schéma directeur produit et UX

**Décision validée le 25 octobre 2026 — Option B : refonte mobile premium d'abord.**

> Document de référence **actif**. Il précise les priorités du [prompt maître](CME_PROMPT_MAITRE_CONSOLIDE.md) sans supprimer son historique. La version 1.0 demeure un objectif futur et n'est pas une livraison déclarée.

## 0. Règles supérieures — protocole qualité du 25/10/2026

Pour chaque requête CME-3D : **(1) reformuler l'ajout, (2) auditer les impacts UX Android / maillage / rig / biomécanique / GPU / composants, (3) vérifier les règles d'or, (4) établir les critères CI/Vitest/Android réel et zones tactiles ≥44 px, (5) proposer la traçabilité documentaire**.

Règles obligatoires : dépôt **Shadow strictement en lecture seule** ; **zéro fausse personnalisation** (absence d'actif GLB ou de matériau/morph compatible = commande désactivée avec explication) ; aucun changement du squelette canonique, des poids de skinning et des trajectoires par une option d'apparence ; aucune caméra utilisateur, capture/analyse vidéo, mocap ou vision par ordinateur ; aucune métrique inventée, afficher **« Non mesuré »**.

**Décisions antérieures préservées** : UX premium Android d'abord ; grand viewport 3D fixe en haut, panneau contextuel en bas ; barre unique **Studio Coach / Mouvements / Galerie / Plus**, Comparatif et Atlas depuis Plus. L'organisation des zones anatomiques n'est pas encore arbitrée. Auditer notamment les coiffures générées et secours faciaux actuellement dans le code ; ne pas les déclarer conformes sans actif et preuve visuelle. Cette mise à jour du schéma n'est pas une livraison fonctionnelle.

Format de communication : **Choix libre prioritaire**, **Choix 1 (Recommandé)**, **Choix 2**, **Choix 3**, actions réellement cliquables à la fin de chaque réponse. Français exclusif pour les réponses et la documentation ; une décision majeure par échange.

## Incident Android documenté et lot 0.7.48 : reconstruire réellement l'interface Studio

**Constat transmis le 25/10/2026 :** la capture Android de CME-3D 0.7.47 montre le sélecteur Homme/Femme et les commandes Tenue / Corps neutre / caméra devant le haut du mannequin, les réglages anatomiques repoussés hors du panneau visible et les actions Enregistrer / Tester / Hasard / Nouveau / Supprimer prenant presque tout l'espace inférieur. Cette composition ne respecte pas les neuf maquettes visuelles et empêche la personnalisation fluide.

**1 — Reformulation additive.** Priorité absolue à une interface utilisable avec personnage dégagé. Les arbitrages UX B (Android premium avant nouveaux GLB), A (viewport fixe dominant + panneau contextuel) et A (barre unique Studio Coach, Mouvements, Galerie, Plus) sont conservés.

**2 — Impacts transversaux.** Cause racine : commandes placées dans le même élément que le Canvas, gestion/validation dans le scroll de personnalisation, et anciens sélecteurs CSS concurrents. La refonte sépare les responsabilités de DOM : barre compacte H/F + caméra **hors scène**, viewport Canvas autonome, navigation par groupes et sous-zones fixe en haut du panneau, unique conteneur vertical scrollable de paramètres, validation Enregistrer/Tester dans un pied indépendant, opérations non urgentes dans un volet replié. La caméra/les poses/morphs existants sont réutilisés ; aucun GLB, rig canonique, poids, trajectoire ou atlas n'est modifié.

**3 — Règles d'or.** Shadow demeure en lecture seule et n'est pas modifié. Aucun faux asset de personnalisation, capture vidéo, webcam, mocap ou vision par ordinateur ajouté ; contrôles capillaires sans GLB spécialisé toujours désactivés. FPS, p50/p95, GPU et latence physiques : **Non mesuré**.

**4 — Validation.** Vitest doit garantir l'ordre réel des régions du DOM, l'absence de commandes dans le viewport, le scroll isolé, les quatre onglets et les boutons tactiles d'au moins 44 px ; TypeScript, contrôles GLB, compilation, deux workflows CI verts avant fusion et Pages vérifiée. **Recette manuelle indispensable sur le même smartphone Android que la capture**, aux quatre vues anatomiques, avec clavier/safe-area et navigation Studio→Mouvements→Galerie. La CI ne prouve pas le rendu du téléphone.

**5 — Exécution et documentation.** Lot 0.7.48 : nouveau StudioSceneLibre.css chargé après les anciens styles ; StudioCoach restructuré en coachSceneControls / coachSceneStack / coachEditorScroll / coachEditorFooter et contrôles secondaires repliés. Les 4 familles et 7 sous-zones restent accessibles ; les valeurs et presets anatomiques s'affichent en premier. Le titre mobile redondant est masqué pour rendre plus de place au mannequin. Ce travail porte sur l'interface réellement codée, pas sur une prétendue finalisation de tous les actifs de CME-3D 1.0.

**Suite :** confirmer visuellement sur Android que tête, torse et pieds ne sont plus masqués ; ajuster les proportions du panneau uniquement selon des captures réelles ; maintenir les contrôles sans actifs GLB désactivés.

## Décision visuelle libre et lot UX 0.7.47 — 25/10/2026

**Arbitrage utilisateur actif :** la priorité visuelle absolue est de rapprocher CME-3D des neuf maquettes transmises, sans présumer l'adoption du toucher direct sur le maillage. Les choix déjà validés demeurent : refonte Android avant moteur 3D définitif ; grande scène fixe dominante en haut ; panneau inférieur contextuel ; une seule navigation inférieure Studio Coach / Mouvements / Galerie / Plus.

**Traduction implémentée dans ce lot :** fond et scène anthracite, repères de cadrage discrets, vrai mannequin Three.js, choix Homme/Femme directement sur la scène, quatre **familles anatomiques illustrées** (Corps, Visage, Peau, Tenues) et sept sous-zones conservées (Corps, Silhouette, Visage, Cheveux, Peau, Tenue, Protections). La sélection d'une zone recadre le modèle, mais ne change pas son squelette. Préréglages visuels et palette contrôlés par les actifs chargés ; réglages fins, vue orthogonale et parcours guidé accessibles dans des sections secondaires. Sélection cyan, validation rouge, cibles tactiles d'au moins 44 px et panneau scrollable séparé de la scène.

**Méthode en cinq étapes appliquée :** (1) décision libre additive fidèle aux images ; (2) impacts sur composition UI, CSS, caméra, couleur d'arrière-plan et composants partagés ; aucun changement du rig, des weights ou des animations ; (3) Shadow sanctuarisé et aucune captation ni animation factice ajoutée ; palettes peau dépendantes du rapport réel des matériaux, choix de coiffures sans actif GLB spécialisé désactivés et explicitement expliqués ; (4) Vitest, typecheck, build, validations GLB et CI obligatoirement verts avant fusion ; contrôle visuel Android physique toujours nécessaire ; (5) schéma directeur, prompt maître et fil conducteur mis à jour.

**Limites :** ces neuf images restent des maquettes de direction artistique, pas les actifs GLB de CME. Les deux modèles anatomiques définitifs, les textures réalistes complètes, les cheveux spécialisés et les morphs du visage restent des jalons 3D futurs. Les anciennes coiffures procédurales encore présentes dans la couche moteur constituent une dette distincte : ne pas les décrire comme des assets professionnels. Aucun résultat réel FPS / GPU / latence Android n'est revendiqué : **Non mesuré**.

**Prochaine priorité opérationnelle recommandée :** recette visuelle sur un Android physique et consolidation des derniers conflits CSS, puis audit des capacités GLB face/cheveux/peau pour compléter l'interface sans placebo. L'interaction directe par toucher anatomique du mesh reste optionnelle et non validée par ce choix libre.

## 9. Lot d'exécution 0.7.46 — implémentation UX mobile, sans changement moteur

Cette étape traduit effectivement les décisions précédentes en code : barre unique **quatre onglets** via `NavigationPrincipale.tsx`, Galerie séparée, Plus regroupant les fonctions avancées, viewport Studio mobile fixe et dominant, panneau d'édition défilant indépendamment via `CmePremiumMobile.css`. Les tests de contrat remplacent les anciennes hypothèses de cinq onglets ; le code des modèles, les poids de skinning, les rigs, les séquences biomécaniques et Shadow ne sont pas modifiés.

**Porte de recette** : exiger Vitest/typecheck/build/CI verts, publication Pages, boutons ≥44 px ; sur Android physique vérifier édition simultanée, hauteur visible du personnage, grille des quatre onglets, clavier logiciel, safe-area, rotation, persistance Studio→Galerie→Mouvements et accès à Plus. **FPS/GPU/latence : Non mesuré** sans exécution physique. Ne pas déclarer CME-3D 1.0 achevé ; les thèmes Premium, la hiérarchie des réglages et la conformité « zéro placebo » restent des travaux à suivre.

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

## 1 bis. Architecture Studio Coach — **Option A validée le 25/10/2026**

**Décision structurante et non négociable pour la refonte :** Studio Coach adopte un **grand viewport 3D fixé en zone supérieure et toujours dominant**, un **panneau inférieur de personnalisation exclusivement contextuel**, et **une seule barre de navigation inférieure persistante**. Les neuf maquettes communiquées servent de direction ergonomique et artistique, sans copie de leurs éléments protégés.

### Règles de composition mobile

1. **En haut — scène 3D persistante** : le coach occupe la zone visuellement prioritaire. La scène ne disparaît pas lors d'un changement de catégorie, de valeur, de préréglage ou de couleur ; conserver la même instance WebGL si possible et éviter les démontages/rechargements GLB inutiles. Homme/femme et identité actifs restent évidents.
2. **Au centre/bas — panneau de commandes contextuel** : une catégorie anatomique active à la fois, ses préréglages visuels et ses seuls paramètres réellement exploitables. Panneau extensible/rétractable **sans recouvrir l'entièreté du personnage** en mode édition. Le contenu éventuellement long **défile à l'intérieur du panneau**, jamais en entraînant la scène hors écran.
3. **Tout en bas — navigation principale unique** : barre fixe respectant les safe-areas Android ; interdiction de deuxième barre principale, quai concurrent ou validation superposée. Le bouton principal « Valider / Enregistrer » appartient à l'espace d'édition, distinct de la navigation et toujours accessible. Un seul geste principal par contexte.
4. **Commandes caméra discrètes** : rotation, zoom, quatre vues anatomiques et recadrage par zone, sans masquer le personnage. Plein écran possible comme outil ponctuel, **mais pas comme mode d'édition par défaut** ; sortie claire sans perte des réglages.
5. **Android portrait d'abord** : contraintes sur faible hauteur, encoches, clavier logiciel, gestes système et orientation. Dalle tactile ≥44 px ; grilles de boutons ni coupées ni inaccessibles ; pas de scroll horizontal involontaire. Les seuils de hauteur précis seront calibrés et testés, pas supposés validés ici.
6. **Langage visuel** : Dark Combat Premium, cohérent avec les maquettes, surfaces sombres, accents rouge pour action principale et cyan réservé aux sélections/informations utiles. Même carte, curseur, palette, état disabled, icône anatomique, feuille contextuelle et chargement partout dans l'application.
7. **Retour immédiat** : chaque déplacement de curseur ou couleur modifie réellement le personnage si le rig actif le supporte ; si absent, afficher explicitement l'indisponibilité et ne pas offrir une commande inerte.
8. **Comparabilité H/F** : silhouette à échelle cohérente, vues face/dos/profils, zones équivalentes mais effets adaptés au sexe ; aucune prétention de conformité esthétique sans inspection visuelle réelle.

### Contrat d'acceptation UX spécifique

- **SC-A1** : viewport visible en permanence en mode création pendant sélection/édition de chaque zone et chaque profil.
- **SC-A2** : panneau inférieur indépendant, tactile et scrollable si nécessaire ; les zones peau, cheveux, visage, bras, jambes, bassin, équipement restent atteignables.
- **SC-A3** : **une et une seule navigation principale inférieure**, compatible safe-area ; commandes système et bouton primaire ne se chevauchent pas.
- **SC-A4** : transition entre catégorie, homme/femme, zoom, tenue, profil et test **sans perte d'état ni remount WebGL superflu**.
- **SC-A5** : parcours mobile « sélectionner homme/femme → choisir zone → modifier → constater visuellement → valider → tester » vérifiable et mesurable.
- **SC-A6** : tests TypeScript/Vitest/build, responsive portrait/paysage et vraie recette Android séparée avant déclaration de qualité finale.

**Limite volontaire de cette décision :** le **nombre, les libellés et l'ordre exacts des destinations de la barre inférieure ne sont pas encore arbitrés**. Cette structure d'écran est approuvée ; aucune refonte de code UI n'est déclarée réalisée par le présent travail documentaire.

## 1 ter. Navigation principale — **choix A, quatre onglets validé le 25/10/2026**

**Arbitrage actif, supérieur aux variantes historiques conservées plus bas :** une seule barre de navigation Android, toujours en bas, avec **exactement quatre destinations dans cet ordre : 1. Studio Coach · 2. Mouvements · 3. Galerie · 4. Plus**. Aucune cinquième destination ne peut être ajoutée sans nouvelle décision explicite. Le Comparatif CME/Shadow, l'Atlas biomécanique et les fonctions techniques **restent intégralement accessibles depuis Plus** et **ne sont pas supprimés**.

| Onglet | Rôle visible | Accès et comportement essentiels |
| --- | --- | --- |
| **Studio Coach** | Choisir homme/femme, modifier morphologie/visage/peau/cheveux/tenues et accessoires ; aperçu 3D fixe en haut, commandes contextuelles en bas | Destinataire par défaut à l'ouverture ; action primaire Enregistrer et raccourci Tester ce coach menant directement à Mouvements |
| **Mouvements** | Choisir une discipline, technique ou séquence **réellement exécutable**, lancer/pause/ralenti/recommencer | Réutiliser le coach courant, garder l'état de sélection ; aucune seconde page de lecture concurrente dans Studio |
| **Galerie** | Retrouver, charger, modifier, dupliquer et supprimer ses coachs sauvegardés | Ouvrir en édition dans Studio ou en essai dans Mouvements ; source commune de profils, sans perte de modifications |
| **Plus** | Fonctions secondaires, recherche et contrôle qualité | **Comparatif CME vs Shadow (lecture seule pour Shadow)** ; Atlas biomécanique ; Laboratoire/Tests et performances ; diagnostics/CI/mesures ; Nouveautés/versions ; incidents ; réglages, cache, aide et exports autorisés |

### Contrat d'implémentation (après la phase de schéma)

- **Un seul composant BottomNavigation partagé** sur Studio Coach, Mouvements, Galerie et Plus. Quatre icônes cohérentes avec libellés français lisibles ; élément actif évident, cibles tactiles ≥44 px et respect de la safe-area Android.
- Changer d'onglet ne doit pas écraser le coach, la personnalisation non enregistrée ou la caméra. En présence de modifications non sauvegardées, conserver le brouillon ou demander confirmation **avant** perte ; ne jamais effacer silencieusement.
- Les pages sous Plus peuvent utiliser une navigation interne (retour/fil d'Ariane), mais **pas une deuxième barre d'onglets principale**. Un lien vers une fonction avancée ouvre son espace Plus, et revient à son contexte sans rupture.
- **Aucun retrait fonctionnel** : déplacer le Comparatif, l'Atlas, l'instrumentation, les options et les diagnostics vers Plus ne signifie pas les désactiver. Préserver l'historique des décisions anciennes ; cette section constitue la nouvelle référence active en cas de contradiction.
- Les écrans Android suivent l'architecture **A déjà validée** : grand viewport fixe et dominant dans Studio, panneau inférieur contextuel ; les autres pages conservent la même barre principale, les composants et la charte visuelle. Le plein écran demeure secondaire.
- Tester les parcours **Studio → Mouvements → Studio**, **Galerie → Studio**, **Galerie → Mouvements**, et **Plus → Comparatif/Atlas → retour**, avec restitution correcte du même coach et sélection tactile fiable.
- Ne pas utiliser des codes d'onglets historiques comme preuve de livraison de cette nouvelle arborescence. Mise à jour documentaire seulement à ce stade ; fusion et CI ne signifient pas recette UX Android déjà terminée.

### Décision structurante suivante

**Comment organiser la sélection des régions anatomiques et leurs réglages dans le panneau inférieur contextuel du Studio Coach ?** Arbitrer la navigation directe par zones, le parcours guidé, ou un modèle combiné. **Choix libre en premier**, puis A/B/C cliquables. Les zones, presets et contrôles à implémenter ensuite seront élaborés à partir des planches de référence ; ne pas redemander l'ordre des quatre onglets.

## 2. Vision du produit, sans confusion avec une maquette

**CME-3D est un Studio Coach mobile premium ET un laboratoire de validation de mouvements de combat**, pas une application de coaching sportif ni un clone de Shadow Studio.

Promesse visible : *Choisir un modèle → Personnaliser visuellement → Enregistrer ou tester son mouvement*.

Espaces fonctionnels préservés :
- **Studio Coach** : créer/personnaliser homme et femme avec un vrai aperçu 3D ; morphologie globale, parties du corps, tête/visage, peau, cheveux/pilosité, tenue, protections et discipline.
- **Mouvements** : choisir discipline, technique ou enchaînement compatible avec le rig actif ; jouer/pause/retour au début, ralenti, caméra pédagogique ; la preuve d'exécution est distincte de la simple présence dans un catalogue.
- **Galerie** : retrouver, dupliquer, modifier, supprimer, réutiliser et tester les profils.
- **Comparatif CME/Shadow** (Shadow **lecture seule**), Atlas, télémétrie, incidents, options, nouveautés : fonctions conservées mais rangées hors du parcours principal.

**Architecture validée :** écran Studio **A** (viewport 3D fixe dominant en haut et panneau inférieur contextuel) ; navigation principale **A à quatre onglets dans cet ordre : Studio Coach, Mouvements, Galerie, Plus**. Comparatif CME/Shadow, Atlas et tous les outils avancés sont dans Plus. **Prochain arbitrage : organisation des zones anatomiques et des paramètres dans le panneau inférieur**. Voir les sections 1 bis et 1 ter.

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
| 25/10/2026 | **Choix A : viewport 3D fixe dominant en haut + panneau inférieur contextuel + navigation inférieure unique** | **Validée** |
| 25/10/2026 | **Choix A : barre basse unique à quatre onglets Studio Coach / Mouvements / Galerie / Plus**, Comparatif CME/Shadow, Atlas et technique dans Plus | **Validée** |
| À arbitrer | Organisation des zones anatomiques et réglages contextuels : carte des zones, parcours guidé ou hybride | **Prochaine décision** |
| À arbitrer après les zones | Préréglages/curseurs, ratios de hauteur et règles d'extension du panneau | **À venir** |
| À arbitrer ultérieurement | Politique d'assets finaux, rig et méthode de personnalisation anatomique H/F | **Après UX stabilisée** |
