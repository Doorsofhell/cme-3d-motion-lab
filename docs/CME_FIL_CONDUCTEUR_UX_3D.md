# Fil conducteur CME-3D — 2026-10-24

## Décision UX confirmée — 25/10/2026 : **architecture Studio mobile A**

Le commanditaire a validé sans ambiguïté l'option **A** : **viewport 3D fixe et dominant en haut**, **panneau inférieur de personnalisation contextuel**, **navigation inférieure unique**. Ce choix complète la priorité produit **B** (refonte UX avant futurs actifs anatomiques/animations), et ne doit plus être remis au vote. La composition détaillée, les contraintes de scène persistante, safe-area, cibles tactiles, défilement contenu aux réglages et les gates UX-G figurent dans [`CME3D_SCHEMA_DIRECTEUR_1_0.md`](CME3D_SCHEMA_DIRECTEUR_1_0.md), section 1 bis.

**Prochaine décision stratégique uniquement :** destinations et libellés de la navigation inférieure principale. Choix libre prioritaire, puis boutons A/B/C. Ne pas supposer le choix de navigation ni considérer le Studio comme déjà reconstruit : ce jalon modifie la doctrine documentaire, pas l'application runtime.

## Décision confirmée — 25/10/2026 : priorité B, refonte mobile premium avant actifs et animations

Le commanditaire sélectionne explicitement **B** pour CME-3D 1.0 : **refondre en premier tous les parcours UX/UI Android à partir des neuf maquettes visuelles, puis intégrer les modèles anatomiques futurs et les animations avancées**. Enregistrer comme arbitrage supérieur sur l'ordre des développements, non comme abandon des capacités biomécaniques acquises. Document de référence : [`CME3D_SCHEMA_DIRECTEUR_1_0.md`](CME3D_SCHEMA_DIRECTEUR_1_0.md).

**Prochaine décision majeure seulement :** pattern de mise en page tactile du Studio (viewport stable avec panneau inférieur / immersif avec feuilles / hybride). Interagir désormais avec **choix libre d'abord**, puis boutons A/B/C effectivement cliquables, et ne poser qu'une question structurante par tour. Ne pas demander à nouveau la validation de la priorité B. Le dernier code publié reste 0.7.45 : ce lot documentaire ne constitue pas la refonte déjà développée.

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

## 24/10 — Anti-régression rig neutre
La géométrie du rig neutre doit rester visible même lors des animations et du changement de pose : frustum culling désactivé sur les surfaces rattachées aux os, vérification du nombre de segments, tests pour homme et femme. Il s'agit toujours d'un proxy procédural, pas encore d'un mesh anatomique sculpté identique à la maquette. Validation visuelle Android, tests complets des six disciplines et qualité biomécanique à confirmer avant certification. Shadow reste intact.

## 24/10 — Choix libre prioritaire et caméra pédagogique
Conserver intégralement les consignes précédentes. Chaque proposition de suivi contient désormais un **choix libre prioritaire** en plus des options recommandées. Réponses, interfaces, libellés et documentation uniquement en français. Implémenter un cadrage pédagogique automatique contextualisé des gestes, avec bascule caméra libre. Corriger les surfaces neutres qui disparaissent à cause de la visibilité des ancêtres : masquer les matériaux sources sans masquer les os ni les surfaces de test. Le tableau de validation et ses modes de distance, comparaisons, retours visuels, sonores et haptiques sont décrits dans `docs/SPEC_TABLEAU_VALIDATION_MOUVEMENTS_3D.md` ; aucune captation vidéo, caméra utilisateur ou reconnaissance gestuelle n'est activée dans CME. Exiger validation UX, 3D, biomécanique, architecture, QA et déploiement ; Shadow demeure inchangé.

## Ordre de travail validé : A → B → C (24/10/2026)
A — stabilisation et non-régression d'abord ; B — personnalisation dynamique complète de Studio Coach ensuite ; C — biomécanique et caméra avancée enfin. Les choix libres restent prioritaires. Lot A : rendre testable séparément le masquage des matériaux sources sans supprimer les os descendants, vérifier les matériaux multiples et les deux sexes. Ne pas certifier un test visuel Android sans essai réel. Les PR brouillon antérieures nécessitent une revue de conflits avant toute fusion. Shadow reste en lecture seule.

## Lot A — 24/10/2026 : stabilisation transversale et tests de contrat
- PR #79 : mutualisation du hook et du bouton plein écran Laboratoire / Studio Coach ; déploiement Pages validé.
- PR #80 : protection contre les doubles événements tactiles Android ; CI validée et fusion dans `main`.
- Ajout de tests de contrat pour empêcher une nouvelle divergence de plein écran, contrôler la préservation des GLB et vérifier la présence du préchargement homme/femme.
- Restent à valider sur Android réel : plein écran, rotation, gestes de caméra, temps de chargement et chevauchements ; une CI verte ne certifie pas ces comportements.
- Suite ordonnée : composants caméra et chargement mutualisés, suppression des CSS contradictoires, contrôle visuel, puis B et C. Ne pas modifier Shadow.

## Audit consolidé du 24/10/2026 — référence `main` e9c32f5 et lot 0.7.18

### Constats vérifiés dans le code et dans GitHub Actions
- La PR #83 (barre 3D commune, CSS rationalisé, plein écran Android et progression GLB) a été fusionnée ; GitHub Pages a terminé son déploiement avec succès. Ce résultat CI/CD **n'est pas** une validation visuelle sur téléphone.
- La navigation basse demandée est déjà présente : **Laboratoire**, **Studio Coach**, **Comparatif 3D**, **Plus** (Incidents, Versions, Options). Les anciens paragraphes du fil conducteur parlant de six onglets principaux sont historiques et ne décrivent plus la version courante.
- `SceneFullscreen` et `SceneControls` sont effectivement partagés entre Laboratoire et Studio ; les humanoïdes GLB existants ont été préservés.
- Anomalie de performance identifiée : le `Canvas` du Laboratoire reste monté derrière `display:none` lorsqu'un autre onglet est sélectionné, alors que `frameloop="always"` rendait continuellement la scène masquée. Correctif 0.7.18 : `frameloop="never"` hors Laboratoire / onglet navigateur masqué, avec reprise `always` au retour ; la progression UI ne se rafraîchit plus en arrière-plan.
- Anomalie de chargement identifiée : le `StudioCoach` lançait les deux `useGLTF.preload` au chargement du module, dès l'ouverture du Laboratoire. Correctif 0.7.18 : préchargement du GLB opposé **après** initialisation du premier humanoïde Studio ; cache Drei inchangé. Latence réelle non mesurée.
- Anomalie de contenu identifiée : séquence littérale `\\n` affichable entre protocole et actions du Comparatif 3D ; supprimée en 0.7.18.
- Le comparatif présente des métadonnées GitHub et les métriques CME seulement. Les FPS Shadow et l'analyse A/B des trajectoires ne sont **pas disponibles**, donc aucune supériorité moteur n'est établie.
- L'Atlas `docs/biomecanique/COUVERTURE.json` indique **306 mouvements uniques**, **43 combinaisons proposées**, mais **0 mouvement et 0 combinaison 3D certifiés**. Le catalogue de l'application et l'Atlas n'ont pas le même périmètre.
- Studio Coach conserve des réglages encore partiellement visuels (visage, coiffure, morphs de maillage et équipements) ; ne pas les présenter comme actifs sur tous les GLB. Naïra n'est pas un personnage 3D original livré.

### Ordonnancement des chantiers

| Priorité | Chantier / décision | Situation et condition de clôture |
| --- | --- | --- |
| **P0 — livré en code 0.7.18** | Suspendre la scène WebGL masquée, retarder le préchargement GLB et nettoyer le Comparatif | Vérifier TypeScript, tests, build, fusion et workflow Pages. Gain de FPS/autonomie **non chiffré** tant qu'Android n'a pas été instrumenté. |
| **P0 — ouvert** | Recette Android sur appareil réel | Inspecter homme/femme, six disciplines, plein écran, double tap, caméra, défilement, clavier, absence de chevauchements, reprise WebGL et séquences ; relever modèle/OS/navigateur/FPS. |
| **P1 — ouvert** | Validation biomécanique quantitative de l'Atlas | Fixtures canoniques, trajectoires, points d'appui, glissement, contacts, angles, transitions et tests par discipline et sexe ; distinguer mappé, animable et validé. |
| **P1 — ouvert** | Vrais deux humanoïdes neutres professionnels | Assets autorisés/licenciés, maillages et poids de skinning vérifiés, squelette identique, revue 360° ; les proxies actuels ne valent pas certification. |
| **P1 — ouvert** | Personnalisation Studio appliquée à la géométrie | Mapping réel morphs/visage/cheveux/tenues/protections, vérifications des meshes et conservation des animations sans promettre des tenues inexistantes. |
| **P1 — ouvert** | Comparatif moteur CME versus Shadow | Exécuter les deux moteurs à protocole et hardware équivalents ; source Shadow **lecture seule**, aucune donnée inventée. |
| **P2 — ouvert** | Profilage et stratégie qualité Android | FPS p50/p95 en charge réelle, latence premier GLB/changement de sexe, allocations VRAM, perte de contexte, rechargements et consommation GPU. |
| **P2 — bloqué par asset** | Naïra originale premium | Sculpture/UV/PBR/rigging/7 tenues puis contrôles G0–G6 et validation artistique ; aucun mannequin primitif de substitution comme produit final. |
| **P2 — ouvert** | Traçabilité complète des releases | Version visible, manifeste de preuves, comparaison SHA déployé et déclenchement de la recette sur appareil. |

### Non-régression et exclusions
- Code de locomotion, contacts et bibliothèque de mouvement canoniques **inchangés** dans ce lot. Aucun fichier ni modification dans `Doorsofhell/combat-shadow-studio`.
- Les tests automatiques couvrent le contrat de visibilité de l'onglet et la politique de préchargement. Ils ne mesurent ni l'utilisation GPU ni les FPS matériels.
- La CI et le déploiement sont des preuves distinctes de la validation sur Android ; conserver explicitement les éléments non observés dans le prochain compte-rendu.
- Interdictions maintenues : capture par caméra de l'utilisateur, analyse vidéo, upload vidéo, reconnaissance de mouvements par vision.

## Lot A validé — Instrumentation Android 0.7.19 (24/10/2026)

**Objectif** : mesurer sur un smartphone réel, sans prétendre qu'une CI peut reproduire sa performance.

- **Laboratoire et Studio Coach** : composant `AndroidDiagnostics` et sonde R3F partagés ; panneau replié, sans nouvelle barre superposée à la scène. Bouton « Démarrer la mesure 60 s » : 5 secondes de chauffe puis 60 fenêtres FPS d'environ une seconde. FPS p05, p50, p95, p95 du temps entre images, nombre d'images au-delà de 50 ms. Mesure complète seulement lorsque les 60 fenêtres ont été recueillies.
- **Intégrité de session** : si l'utilisateur quitte la scène, masque la page, perd WebGL ou interrompt les images pendant plus de 1,5 seconde, la mesure est marquée **interrompue** et ne peut pas être utilisée pour certifier 30 FPS. Chaque relance efface les données FPS de la mesure antérieure mais conserve les observations GLB/WebGL de la session en mémoire.
- **Latence GLB** : chronométrage sur `performance.now()` du choix du coach/tenue, du changement de sexe et du mode Anatomie/Apparence jusqu'au retour « rig initialisé ». Valeur composite (réseau, cache, décodage, montage React) et **non** durée réseau seule. L'autre silhouette est préchargée après initialisation ; les comparaisons « premier chargement » et « changement » doivent identifier les effets du cache.
- **Récupération WebGL** : comptage des pertes/restaurations et latence entre les événements ; conserver le bouton de relance du Laboratoire et proposer une relance manuelle visible sur Studio Coach. Une restauration d'événement ne prouve pas à elle seule que le rendu visuel ou le squelette est correct.
- **Traçabilité** : bouton de copie de rapport JSON `CME3D_ANDROID_TELEMETRY_V1` avec données navigateur/viewport, contexte technique, échantillons et événements, sans appel réseau. Les mesures sont locales, sans caméra ni vidéo. Le rapport de session du Laboratoire inclut le même diagnostic.
- **Tests unitaires** : percentiles avec interpolation, 60 fenêtres, interruptions, mesures de changement GLB et WebGL, contrat d'intégration des deux écrans. Tests TypeScript et build GitHub Actions requis avant fusion.
- **Recette encore ouverte** : test sur Android physique en mode équilibré, six disciplines, Kadir/Amara, rotations, changement homme/femme en alternance, plein écran et reprise contexte WebGL ; consigner version du navigateur, écran, qualité, p05/p50/p95, temps de préparation GLB. Aucun FPS de téléphone réel revendiqué à la livraison logicielle.

**Priorités suivantes** : P0 recette matérielle et validation des temps/régressions ; P1 tests biomécaniques des six disciplines et morphologies réellement appliquées ; P1 benchmark Shadow lecture seule ; P2 Naïra (assets originaux). Shadow Studio reste inchangé.

## Lot C validé — Personnalisation GLB dynamique 0.7.20 (24/10/2026)

### Audit vérifié avant intervention
- Le Studio proposait des curseurs de mâchoire, nez, yeux, épaules, musculature et taille dont seuls les réglages de hauteur étaient effectivement liés à la scène skinnée. Les autres valeurs étaient essentiellement mémorisées dans le profil.
- L'adaptateur de couleurs classait parfois une tenue comme `peau` parce que le nom du mesh parent contenait « body ». L'inspection des matériaux doit précéder ce repli.
- Le mode Anatomie neutre était affiché à l'entrée du Studio, alors que ce mode masque volontairement les textures/couleurs d'apparence : incompréhension pour un utilisateur qui personnalise un coach.
- Les GLB existants peuvent ne contenir aucun morph target pour les yeux/nez/mâchoire ni mesh distinct de cheveux/tenue. Ne jamais inventer leur disponibilité.

### Corrections incluses
- `src/lab/coachGeometry.ts` : déformations modestes du torse sur **une copie de la géométrie skinnée** uniquement lorsque le GLB fournit des poids de skinning identifiables pour la colonne et les hanches. Modifie les positions des sommets associés, avec contrôle d'idempotence et conservation des os, matrices de liaison, attributs de skinning, bibliothèques et mouvements. Aucune forme ajoutée par primitives.
- Les morph targets faciaux **explicitement nommés** « jawWide/Narrow », « noseWide/Narrow » ou « eyesBig/Small » sont appliqués s'ils existent. Aucun système de morphing visage générique ne peut fonctionner sans les cibles présentes dans les assets.
- `neutralAppearance.ts` : application des teintes peau, cheveux, iris, haut, bas et gants uniquement aux matériaux identifiés, en privilégiant leurs noms sur ceux de l'objet parent. Conservation des textures et matériaux source par clonage.
- Studio Coach : **mode Coach texturé par défaut**, mode Anatomie neutre conservé pour les essais, état des capacités détectées affiché. Curseurs ou couleurs non applicables au GLB chargés **désactivés**, avec raison lisible. Choix de coiffures non activé tant qu'il manque des maillages adaptés. Les profils enregistrés et leur schéma restent compatibles.
- Les géométries locales marquées `cmeOwned` sont libérées lors du changement de scène. L'original GLB reste en cache Drei non modifié.

### Contrôle qualité / limites ouvertes
- Tests de l'absence de modification des os/poids et des géométries d'origine, non-accumulation des curseurs, retour à l'état neutre, détection des blendshapes et des matériaux.
- Aucun changement dans `src/shadow-engine`, `src/core` ni dans `Doorsofhell/combat-shadow-studio`.
- Les nouveaux GLB professionnels, coiffures, équipements et tissus dédiés restent **P1 / dépendance asset**. Ne pas prétendre que les morph targets faciaux existent sur Kadir ou Amara sans inspection de leurs noms réels.
- L'évaluation visuelle Android, les interpenetrations géométriques sous animations et la validation biomécanique des six disciplines restent ouvertes ; la CI seule ne les certifie.

## 24/10/2026 — Lot 0.7.21 : parité Studio Coach / Laboratoire

- Un adaptateur commun `applyCoachLookGeometry` est utilisé par `NeutralRig` (Studio Coach) et `Fighter` (Laboratoire) : taille relative, épaules, musculature, taille et morph targets faciaux explicitement disponibles. Les changements ne touchent que les copies de géométrie skinnée ; os, poids de skinning, matrices de liaison et gestes canoniques sont conservés.
- Les couleurs des matériaux `MeshToonMaterial` (Fitness et Comics) prennent désormais en charge les mêmes zones identifiées que les matériaux Standard/Physical, sans supprimer les textures ; les zones inconnues restent intactes.
- Le mode Anatomie ne reprend pas la variation de taille du profil : la géométrie neutre demeure une référence indépendante.
- Tests : effets réels de l'adaptateur partagé sur un rig synthétique, idempotence, réversibilité, intégrité des os, tests de colorimétrie Toon et contrat de réutilisation Studio/Laboratoire.
- Exclusions : **aucun changement** des mouvements canoniques ni du dépôt Shadow Studio, aucun ajout artificiel de coiffures, tenues ou morph targets. Recette Android physique et conformité visuelle/anatomique encore **non certifiées**. Les déformations de vêtements et les collisions doivent être évaluées visuellement par discipline et par sexe.

## 24/10/2026 — Lot 0.7.22 : tenue/corps et intégrité GLB

- Les tenues liées au squelette héritent des déformations de torse existantes. Une marge proportionnelle au changement de morphologie, limitée à 1,2 % sur les sommets pondérés buste/bassin, réduit les risques de traversée du vêtement. Ce n'est ni un moteur de collision ni une preuve d'absence d'intersection pendant les mouvements.
- Toute géométrie `cmeOwned` provenant de l'adaptateur de tenue, remplacée par un nouveau clone pour la morphologie, est libérée ; la géométrie issue des GLB de référence n'est jamais libérée par cette étape.
- Contrôle CI des 2 corps GLB et 14 tenues disponibles (boxe, kickboxing, muay-thaï, MMA, judo, JJB gi/no-gi) : intégrité structurelle, maillages skinnés, poids de skinning, rapprochement des os des tenues avec le corps. Ce contrôle est indépendant du moteur de mouvements.
- Tests unitaires : clearance, idempotence, retour à l'origine, protection du squelette, propriété des géométries et absence de libération des sources.
- **À fermer seulement après une recette sur Android physique** : revue 360° statique/dynamique pour deux sexes × six disciplines, postures extrêmes, accroche/occlusion et FPS/latence. Aucune vidéo et aucune analyse par caméra ne sont admises. Shadow Studio et mouvements canoniques restent intacts.

## 24/10/2026 — Nouvelle priorité : personnalisation dynamique réelle (0.7.23)

**Constat sur Android 0.7.22** : peau trop rouge/assombrie ; seulement 2 sous-matériaux reconnus ; couleurs de gants affichées comme non disponibles ; certains choix restent des placeholders et la prévisualisation ne montrait pas les vêtements GLB présents dans le dépôt. La limitation et le défaut d'intégration ne doivent pas être confondus.

**Lot logiciel 0.7.23 :**
- Charger dans Studio Coach, en mode Apparence, la tenue GLB réelle pour chacune des 6 disciplines (boxe, kickboxing, muay-thaï, MMA, JJB, judo). L'anatomie reste indépendante et non habillée. Choix par l'utilisateur depuis l'onglet Tenue ; identifiants de matériaux inventoriés par la CI.
- Palette dédiée de 8 carnations humaines usuelles ; réglage immédiat ; adapter la couleur des textures de peau en *variation relative au matériau natif* : la carnation de référence préserve l'albédo GLB original et évite de le multiplier à nouveau par du marron.
- Priorité de classement des zones : iris / cheveux / protections / vêtements avant peau ; éviter de recolorer par erreur des gants ou cheveux attachés à un parent de type `skin/body`. Afficher les quantités par zone réellement détectée sur les modèles chargés. Ne pas prétendre que des coiffures/gants ajoutables existent si les GLB ne contiennent pas de maillage distinct.
- Éclairage Studio équilibré. Tests unitaires couleur native, aller-retour teint, matériaux Toon, classification, et tests de contrat des tenues et de l'ergonomie mobile.
- **Restent ouverts :** revue visuelle sur Android physique en vue 360° et en mouvement ; couverture réelle des sous-matériaux par discipline / sexe ; création et intégration d'assets additionnels si les GLB existants ne permettent pas de changer coiffure, protections ou visage. Pas de capture/vision ou analyse vidéo, pas de changement des animations canoniques ni de Shadow Studio.

## 24/10/2026 — P0 caméra contextuelle et audit des capacités (0.7.24)

**Demande prioritaire utilisateur :** lorsque l'on personnalise une partie du corps dans Studio Coach, zoom automatique sur la région utile ; davantage de personnalisations réelles, en particulier chez Amara (rondeur, hanches, poitrine, coiffures). Jamais de commande placebo.

**Réalisé :**
- Mapping des rubriques Morphologie (corps entier), Visage (tête), Peau (visage et haut du corps), Cheveux (tête), Tenue (corps entier) et Protections (mains). Les contrôles spécifiques orientent les vues buste, abdomen, mains, jambes et tibias ; les futures morphologies poitrine, hanches, cuisses et rondeurs ont des zones prévues dans le plan focal.
- Mesure dynamique sur les **os existants du GLB**, en coordonnées mondiales, avec repli sur le squelette entier si l'os recherché manque. Caméra perspective ajustée au ratio portrait/paysage, animation amortie ; geste utilisateur OrbitControls prioritaire et annule la transition ; bouton **Vue entière** relance le cadrage. Caméra pédagogique activée séparément, sans pilotage concurrent.
- Audit CI explicite des deux corps et des 14 tenues : matières de peau/cheveux/yeux/vêtements/protections, cibles morph nommées et cibles non nommées. Matériaux visibles ≠ morph targets ≠ coiffures GLB réelles. Aucun asset ou changement biomécanique ajouté dans ce lot.
- Tests de mapping, rig éloigné de l'origine, valeurs de repli, cadrage portrait et contrats UI.

**P1 / dépendance asset ouverte :** créer et qualifier des morph targets dédiés Amara pour poitrine, hanches, rondeur générale, cuisses/fessiers, ainsi que des coiffures skinnées ou attachées à la tête. Vérifier les variations avec six disciplines et 14 tenues, collisions, ombrage, morphs incompatibles et préservation des os. Ce lot 0.7.24 **ne livre pas** les nouvelles morphologies ; les futures zones caméra ne signifient pas qu'un curseur est déjà actif.

**P0 validation non encore certifiée :** recette tactile sur Android physique (changement de rubrique, double tap plein écran, geste libre, retour à vue générale, deux sexes, six disciplines, FPS p50/p95). Sans capture/vision/mocap/vidéo. Ne toucher ni Shadow Studio ni les animations canoniques.

**Audit GLB vérifié en CI :** consulter [`docs/CME_AUDIT_CAPACITES_PERSONNALISATION_3D.md`](CME_AUDIT_CAPACITES_PERSONNALISATION_3D.md) — 2 matériaux de peau par corps, 0 morph target sur les 2 corps, 0 coiffure distincte et 14 tenues catégorisées. Les nouvelles personnalisations féminines restent un chantier d'assets, non une fonctionnalité déjà active.

## 24/10/2026 — Lot P1 0.7.25 : variations féminines procédurales skinnées

**Livré techniquement :** nouvelle rubrique `Silhouette femme` (uniquement sur Amara) comprenant **Rondeur générale**, **Largeur des hanches** et **Volume des cuisses**. Chaque contrôle est **réel**, limité en amplitude, modifie la copie du maillage skinné via l'influence des os Spine/Hips/LeftUpLeg/RightUpLeg ; mêmes modifications sur les tenues skinnées attachées et sur le combattant du Laboratoire utilisant le coach sauvegardé. La géométrie source, les os, les weights, les bind matrices et les samplers canoniques sont préservés. Les contrôles sont désactivés si les influences sont absentes. Le cadrage contextuel affiche bassin, jambes et corps selon le curseur. Compatibilité v1 des anciens profils, normalisation des nouvelles valeurs, reset et répétition de curseur sans accumulation.

**Limite visuelle explicite :** ce sont des ajustements de proportions localisés via skinning, **pas de véritables morph targets sculptés**. La définition anatomique précise d'une poitrine, des fessiers séparés et des coupes de cheveux exige encore de vrais assets ; ne pas activer de fausses commandes. La tenue peut nécessiter retouches et revue visuelle 360°. Valider sur appareil Android physique pour les deux sexes, six disciplines, changements de vue, variantes de tenues et performances.

**Lot suivant recommandé :** production / intégration d'une bibliothèque licenciée de maillages ou blendshapes féminins (poitrine, fessiers, visages et cheveux), testés séparément, sans modifier les mouvements canoniques ou Shadow Studio.

## 24/10/2026 — Correctif P0 v0.7.26 : personnalisation visible / liste des coachs / ergonomie mobile

**Retours utilisateurs à traiter avant les autres développements :** (1) changements de personnalisation sans impact visuel perceptible, (2) après enregistrement coach absent de la liste du Laboratoire, (3) le défilement vers les réglages fait disparaître le mannequin, (4) absence de réglage féminin poitrine, (5) vue Anatomie censée être dépourvue de tenue, (6) test des techniques nécessaire via liste déroulante de toutes les techniques et enchaînements.

**Implémenté :**
- Sélecteur principal du Laboratoire avec un groupe **Mes coachs personnalisés**, à côté des combattants de référence. La sauvegarde écrit également le coach courant dans `cme-lab-coach`, émet l’événement partagé et expose **Voir dans Laboratoire**. Une sélection de coach sauvegardé applique son sexe et son `CoachLook` au combattant du Lab. La liste réagit au stockage local. Tester le parcours sauver → navigation → sélectionner → modifier → relancer.
- Mobile : aperçu 3D du Studio ancré **sticky** dans le conteneur scrollable, hauteur limitée à 30dvh pour garder simultanément l’éditeur visible ; la barre d’onglets reste en bas, le plein écran conserve les règles existantes. Affichage des proportions effectives près du coach.
- Mise à jour de la géométrie/matériaux dans un `useLayoutEffect` et recalcul des normales pour rendre la variation plus lisible. Nouvelle approximation prudente de **volume de poitrine** limitée à la zone thoracique avant et pondérée par les os ; appliquée à la copie du corps et aux tenues skinnées, zéro morph cible native existante, ne pas la vendre comme un sculpt réaliste.
- Anatomie : `NeutralRig` n’ajoute jamais de GLB d’équipement dans ce mode ; surfaces neutres sans textures et exclusion préventive des vêtements / protections attachés. Si une tenue est moulée directement au maillage de base, **un nouveau GLB d’anatomie** sera nécessaire pour l’ôter physiquement, et la limite doit rester explicite.
- Techniques Studio : catalogue déroulant par discipline basé sur `techniques.json`, `complexSequences.json` et `shadowExercises.json` versionnés, séquences pilotées par `SequenceSampler`, entrées incompatibles désactivées. Aucun geste canonique modifié ; pas d'appel au dépôt Shadow.

**Vérifications avant validation finale :** tests profil poitrine, géométrie antérieure/reprise neutre, mode anatomie sans vêtement, inventaire six disciplines, lecture des enchaînements, sélection coach après sauvegarde, aucun chevauchement Android ; CI verte puis contrôle GitHub Pages. La validation sur téléphone réel reste distincte.

## 25/10/2026 — 0.7.27 : navigation à quatre onglets, galerie maintenue

**Nouvelle décision utilisateur :** garder Galerie Coachs comme destination distincte et déplacer toutes les autres options dans Plus. Livraison incrémentale : onglets Studio / Galerie Coachs / Comparatif / Plus ; grille de galerie adaptée Android et raccourci de test depuis Studio ; Nouveautés (versions existantes) et Centre technique distinct via Plus. Le moteur de combat existant reste utilisable, mais sa fusion technique avec l’aperçu Studio est un chantier ouvert. Le workflow de benchmark CME / Shadow doit mesurer avec données d’essai traçables, afficher des graphiques et ne jamais déduire la supériorité d’un score fictif. La recettte Android physique reste à réaliser.

## 25/10/2026 — v0.7.28 : atlas morphologique visuel et posture de création sans combat

Premier lot du cahier des charges « Character Creator Premium » : grilles de formes anatomiques réelles (épaules, musculature, taille, silhouette féminine, poitrine, hanches, cuisses), options faciales seulement si blendshapes présents, randomiseur filtré selon capacités effectives du rig, sélection active. Le Studio doit rester à la pose de référence sans sampler sportif et ne jouer les animations que pendant les tests explicites. Préserver les fichiers sources GLB, les gestes canoniques et Shadow. À poursuivre : atlas visuel d’icônes anatomiques détaillées dessinées, nouveaux morphs faciaux professionnels, vraie matière peau et textures spécialisées, coiffures, galerie avec vignettes, fusion complète Studio/Lab et comparaison métrique réelle. Aucun paramètre fictif.


## 25/10/2026 — 0.7.29 — croquis de morphologie et galerie illustrée
Les cartes morphologiques doivent montrer une silhouette ou un visage reconnaissable, pas des glyphes. Vignettes SVG générées d'après l'intensité du preset. Lors de la sauvegarde, capturer l'image réelle du combattant affiché dans Studio et l'enregistrer dans le profil existant; afficher les captures dans la Galerie Coachs. Ne pas perdre les anciens profils sans portrait. Approfondir ensuite les vignettes artistiques haut de gamme et les captures caméra standardisées, avec vérification WebGL Android physique.

## 25/10/2026 — Décision de refonte majeure V1.0 : un seul atelier
La mission est recentrée sur **créer → tester → valider** le même combattant 3D. Le prompt directeur actif est réécrit en tête de `CME_PROMPT_MAITRE_CONSOLIDE.md` ; toutes les décisions antérieures y sont préservées. Navigation Studio / Galerie Coachs / Comparatif / Plus maintenue. Premier incrément V1-A : deux modes explicites Création et Test des mouvements dans Studio, sans seconde scène ni modification du moteur, avec test de contrat. La version publiée reste 0.7.x tant que les critères V1-A à V1-D ne sont pas satisfaits. À faire : supprimer progressivement les conflits CSS, mesurer Android réel, capacités morphologiques, biomécanique certifiable, Comparatif A/B traçable. Shadow lecture seule.

## 25/10/2026 — v0.7.31, lot A Android (sans certification physique)
Trois axes de recette : (1) ergonomie Studio, aperçu sticky et commandes sans chevauchement en portrait/paysage ; (2) latence GLB et FPS p50/p95 mesurés par le diagnostic Android sur 60 s après 5 s de chauffe ; (3) perte/restauration WebGL et préservation des modèles H/F. Le code 0.7.31 renforce les règles CSS du premier axe et maintient les deux autres en vérification instrumentée. Aucun chiffre de performance ni succès de recette Android réelle n'est inventé. Les quatre destinations Studio / Galerie Coachs / Comparatif / Plus restent inchangées, de même que les GLB historiques et Shadow.

## 25/10/2026 — Navigation définitive v0.7.33
L'utilisateur remplace les anciens quatre onglets par cinq : Studio (création, modification, liste/galerie coachs), Mouvements (tests), Technique (mesures/diagnostics), Versions (historique/nouveautés), Autres (comparatif CME/Shadow, feuille de route, incidents, paramètres). Uniformiser tous les écrans vers le thème clair premium ; mode auto suit les préférences jour/nuit de l’OS, modes manuels clair/sombre. La Galerie Coachs n'est pas supprimée : elle est intégrée dans Studio. Les profils restent partagés ; les mouvements canoniques et le dépôt Shadow Studio restent intacts.

## 25/10/2026 — 0.7.35 : recette exécutable dans Mouvements
Un seul banc de test dans Mouvements, sans redondance de lecteur. Le catalogue doit séparer « référencé », « gestes dépendants présents », « mouvement résolu par le rig », et « validé visuellement par l’utilisateur ». Chaque technique et enchaînement doit être lancé indépendamment, puis l’utilisateur choisit valide/rejette. Un refus exige commentaire technique ; rapport Markdown complet par discipline/coach inclut versions, identifiants, gestes, résultats, mesures et observations destinées à ChatGPT pour correction. Les confirmations ne doivent jamais être automatiques à partir de la simple présence catalogue. UI premium claire, repérage rapide Android. La refonte visuelle exhaustive et tous les contrôles de capacité restent des chantiers P0. Aucun mouvement canonique n’est modifié.

## 25/10/2026 — v0.7.36 : lot A refonte UX/UI sans écran redondant
Audit du code : trop d'îlots CSS sombres, mini-lecteur Studio en plus de Mouvements, outils JSON/diagnostics dans les tests, trop d'actions répétées. Réalisation incrémentale : tokens visuels partagés pour l'ensemble des cinq écrans, palette claire premium en mode clair et adaptation Auto au système ; Studio reste strictement l'éditeur A-Pose/galerie, action unique vers Mouvements, réglages fins repliés ; Mouvements centralise sélection unique, lecture et jugement individuel avec rapport ; Technique regroupe logs, données WebGL, JSON avancé et catalogue de référence ; onglets fixes Android, page de recette défilable. Les mouvements canoniques et Shadow restent intacts. Recette visuelle Android physique, performance, contraste et scroll à confirmer avant considérer la refonte définitivement aboutie.


## 25/10/2026 — 0.7.37 — lot C1 : architecture Android
P0 : tous les écrans partagent un conteneur scrollable central propre, sans faire défiler les cinq onglets inférieurs. Le bas de l’écran respecte la safe-area, les commandes tactiles conservent une taille suffisante, le viewport 3D reste accessible ; le volet Mouvements constitue un parcours unique sélection/lecture/recette. Enlever les scrolls concurrents du Studio. Tests source de structure associés. La recette sur appareil Android physique n’est pas faite et ne doit pas être certifiée par la seule CI. C2 : moteur des gestes référencés réellement résolus, états de revue réinitialisés par sélection et vrai témoin d’exécution.


## 25/10/2026 — 0.7.38 — lot C2 : exécution vraiment vérifiable
P0 : un mouvement enregistré au référentiel ne suffit plus à activer Valider. Preuve de lecture uniquement après échantillonnage effectif de poses par le même rig, même technique, même discipline et même coach, avec temps de lecture et progression contrôlés. Le statut reste distinct de la validation biomécanique humaine. Les mouvements manquants/inhérents à des séquences non résolues sont sélectionnables pour signalement et rejet avec un commentaire technique obligatoire. Rapport Markdown d’exécution accompagnant les observations. Ne pas changer les gestes canoniques ni le dépôt Shadow. Faire vérifier les clips individuellement par l’utilisateur sur Android, l’exécution échantillonnée ne prouvant pas la qualité biomécanique.

## 25/10/2026 — 0.7.39 : portrait-robot unifié homme/femme et capture Android
La capture Android transmise affiche encore v0.7.22 (quatre onglets, combattante sans tête visible, zone de protection inactive), alors que main contient v0.7.38 : l’ancienne interface doit être éliminée, mais on ne conclut pas à une panne de déploiement sans vérifier la navigation réelle. Accent sur le socle paritaire : toutes les zones anatomiques partagées homme/femme, morphologies régulées selon sexe, taille et poids en coefficients bornés, vêtements suivent la déformation skinnée. Croquis SVG des zones et palettes sRGB réalistes/animation, iris et cheveux colorables si les maillages existent. Discipline et latéralité persistées ; la pose de création reste neutre, le mouvement miroir gaucher se limite au banc test. Accessoires cumulables uniquement sur des géométries identifiées. Il faut enrichir le catalogue d’assets capillaires et les morphs de visage : ne pas considérer un simple choix d’apparence sauvegardé comme une déformation visuelle réussie. Mettre à jour le mécanisme de cache et exiger vérification Android du personnage complet, caméra et contraste.

## 25/10/2026 — v0.7.40 : mode Créateur neutre sur les acquis de la 0.7.39
Les personnalisations fusionnées par #115 (croquis, zones H/F identiques, mensurations, latéralité, équipements cumulables, palette humaine/animation) sont conservées. Un mode Creator spécifique à NeutralRig offre le corps neutre humain skinné, textures conservées, couleurs et morphologie appliquées réellement, sans charger les tenues. Il remplace le mode gris de diagnostic pour la création. Studio démarre par Corps neutre, puis bascule automatiquement vers Tenue pour l'habillage. Une rubrique commence sur la vue globale ; seule une forme sélectionnée recadre sur la zone. Le thème couleur Chrome suit clair/sombre/auto. Les variantes de coiffures/visage exigent de vrais nouveaux assets. Test Android physique encore nécessaire. PR conflictuelle #114 abandonnée au profit d'une livraison propre sur main actualisé.


## 25/10/2026 — 0.7.41 : cible mannequin anatomique en 4 vues
L'utilisateur confirme l'affichage de 0.7.40 et fournit les silhouettes mannequin homme/femme (face/dos/profils) comme cible non négociable. Plan maître additionnel : docs/ANATOMIE_MANNEQUINS_PREMIUM_0741.md. Lot initial : matériau mannequin gris distinct du créateur texturé, quatre vues sur caméra commune, curseurs morphologiques accessibles sur corps neutre, mêmes capacités H/F. Ne jamais confondre finition de matière et sculpture 3D aboutie : les GLB professionnels morphables restent attendus en 0.7.42/0.7.43. Pas de changement Shadow, mouvements canoniques préservés.


## 25/10/2026 — 0.7.42 : étalons CC0 intégrés sans régression
Deux GLB anatomiques réels sans tenues, homme/femme, en A-pose, proviennent du catalogue Innerscene/MakeHuman CC0. Les nouveaux GLB ne remplacent pas les coachs actifs (squelette différent). Bouton de référence 3D, quatre vues, lecture seule. Les CI téléchargent et valident les binaires; Pages les sert sous /anatomie. Morphs indépendants, retargeting et revue visuelle physique restent ouverts.


## 25/10/2026 — 0.7.43 : correction de la personnalisation anatomique
Clarification : homme/femme possèdent les mêmes catégories éditables, avec **interprétation physiologique et esthétique différenciée**. Nouveau groupe fessiers, effet 3D postérieur sur pelvis skinné, couplage borné des régions voisines, vocabulaire féminin/masculin, compatibilité anciens profils et mêmes composants Studio/Laboratoire. Le rendu final des planches et le retargeting des étalons CC0 restent distincts, à ne pas annoncer comme livrés.


## 25/10/2026 — 0.7.44 : audit géométrique Android 4 vues
L’utilisateur valide le lot B : priorité rendu homme/femme sous face, dos, profil droit, profil gauche. Défauts vérifiés dans le code : cadrage corps entier calculé sur les os seulement (volume cutané potentiellement hors cadre), aperçu Android trop petit, boutons de vue 2x2 sur mobile malgré 4 vues. Corrections : calcul conservateur des limites des meshes visibles, même distance pour les quatre angles, cadrage complet face par défaut, retour explicite « Vue entière », une rangée de vues tactile, aperçu mobile augmenté. Tests sur corps synthétiques homme/femme, orientations et ratios de viewport. Recette réelle Android/WebGL et conformité à la référence artistique à vérifier sur appareil et sur GLB finaux. Aucun changement des mouvements ni de Shadow.


## 25/10/2026 — lot UX 0.7.45
Constat produit rapporté par l'utilisateur : cheveux et visages non modifiables, carnation sans effet visible, liste de séquences non exécutées, trop de panneaux et de zones indisponibles. Causes identifiées dans le code : hairStyle enregistré sans géométrie, faceMorphs souvent absents, aperçu neutre gris/CC0 ignorant les couleurs, source de sequences Shadow non lue dans Fighter, sélection de gestes non filtrée sur les motions du rig, sept rubriques Studio et longues recettes techniques en premier plan. Correctifs : coiffure 3D légère attachée au Head, fallback face sur géométrie skinnée si Head identifié, sortie des aperçus gris/lecture seule lors de changements colorimétriques, bras/mollets par influence d'os, trois étapes Studio, sélecteur vérifié et lecture immédiate avec réinitialisation du plan JSON, recette avancée masquée par défaut, aperçu du coach courant en un clic. Limites : cheveux approximatifs et non photoréalistes, vrais morphs faciaux/textures iris non garantis sur certains assets, compatibilité réelle conditionnée aux contrôles rig et recette Android à compléter.
