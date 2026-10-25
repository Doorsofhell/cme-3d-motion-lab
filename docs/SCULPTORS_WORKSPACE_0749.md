# CME-3D 0.7.49 — The Sculptor's Workspace

## Décision utilisateur et portée technique

Refondre le **Studio Coach Android** comme un studio tactile de sculpture numérique, et non une suite de formulaires. La maquette cible prime pour la disposition, sans copier les actifs visuels ni fabriquer des modèles 3D artificiels. **Technologie de production conservée : React 19 / Vite / React Three Fiber / Three.js en PWA**, déjà intégrée au moteur ; pas de migration React Native / Flutter dans ce lot, pour éviter de casser WebGL, les actifs GLB et la chaîne GitHub Pages.

### Contrat de mise en page

- **55 %** de la zone utile du Studio : scène 3D réelle, éclairage existant, grille de perspective via `gridHelper` dans le monde 3D (pas une image), repères de cadrage, sélection Homme/Femme, outils caméra en rail **extérieur au Canvas**, vue face/profil, recentrage et visualisation filaire temporaire du matériau réel.
- **45 %** : tableau de bord couleur true black / anthracite, navigation anatomique horizontale **axe X** Tête / Corps / Jambes / Peau / Tenues, sous-navigation verticale **axe Y** vers les sept zones réelles, curseurs de précision immédiatement visibles pour les seules zones compatibles, puis galerie horizontale défilante de préréglages morphologiques réellement pris en charge.
- Pied du panneau : une **validation rouge** avec coche blanche et nom accessible par lecteur d'écran ; raccourci Tester dans Mouvements ; barre globale inférieure **Studio Coach / Mouvements / Galerie / Plus**, sans cinquième destination.
- Cibles tactiles de **44 px minimum**. Haptique `navigator.vibrate(8)` **optionnelle**, au passage de la valeur neutre ; aucune demande d'accès caméra ni collecte de données. Si le téléphone / navigateur refuse, la glissière fonctionne sans vibration.
- **Valeurs exactes** : dérivées exclusivement de l'état réel du contrôle, rendues en monospace. Pour une taille réelle en mètres, afficher le nombre uniquement si l'utilisateur a indiqué une taille de référence ; sinon afficher la variation relative. Ne jamais inventer 1,75 m, 70 kg ni des mensurations non disponibles.

### Composants modulaires

| Fichier | Responsabilité |
| --- | --- |
| `src/lab/StudioCoach.tsx` | Orchestration et raccordement aux capacités GLB / état métier, sans changement des données biomécaniques |
| `src/lab/PrecisionSlider.tsx` | Slider accessible + accent cyan/rouge/orange, sortie monospacée, désactivation motivée, haptique limitée |
| `src/lab/SculptorViewportTools.tsx` | Outils caméra tactiles hors du personnage, commandes de vue et fil de fer |
| `src/lab/SculptorWireframe.tsx` | Matériaux filaires clonés temporairement, restauration et libération lors de la désactivation |
| `src/lab/studioAnatomyNavigation.ts` | Axe X et regroupement sans doublon des sept zones existantes |
| `src/lab/SculptorWorkspace.css` | Design tokens et grille responsive 55/45, axe X horizontal, axe Y vertical, galerie de presets |
| `src/lab/SculptorWorkspace.test.ts` | Contrats Vitest d'architecture, disponibilité et viewport authentique |

### Protocole obligatoire en cinq étapes

1. **Ajout sans écrasement** : préserver B (UX d'abord), A (viewport dominant + panneau inférieur), la navigation globale à 4 onglets, les sept zones de personnalisation, Shadow en lecture seule.
2. **Impacts** : adaptation DOM/CSS/contrôles visuels, ajout d'un `gridHelper` et d'un matériau filaire temporaire ; aucun nouveau GLB, rig, os, poids de skinning, trajectoire, mouvement ni modèle fictif ; les modifications de morphologie demeurent assurées par la chaîne préexistante et ses tests.
3. **Règles d'or** : Shadow strictement en lecture seule ; absence d'actifs de coiffure spécialisée = commandes désactivées, aucune capture vidéo, caméra utilisateur, mocap ni computer vision ; aucun FPS inventé.
4. **Validation** : Vitest, TypeScript, validation des GLB, build, deux workflows GitHub Actions verts avant fusion et déploiement Pages vérifié. Accessibilité tactile : 44 px. **Test Android physique sur l'appareil utilisateur non effectué tant que son résultat n'est pas fourni** ; FPS p50/p95, GPU et latence physique : **Non mesuré**.
5. **Documentation** : ce document, le prompt maître, le schéma directeur et le fil conducteur, sans effacer les anciens jalons.

### Restrictions de conformité

Les commandes ne doivent pas être présentées comme fonctionnelles lorsque `support.shape` ou `support.colors` ne les reconnaît pas. Le fil de fer est seulement un mode d'inspection des **maillages déjà présents**, non un nouvel asset. Les supports anatomiques organiques CC0 en lecture seule restent distincts des coachs animés. Les vrais assets de cheveux et certains morphs fins de visage ne sont pas livrés par cette itération. La grille est réelle mais le contrôle de rotation de l'objet reste lié au cadrage orbital ; aucune mesure d'animation synchronisée supplémentaire n'est prétendue.

### Recette manuelle Android à effectuer

Ouvrir le Studio en portrait et vérifier : scène non masquée à **55 %** de la zone utile, choix homme/femme accessible, caméra et maillage, axes X/Y, sélection de nez et formes de jambes, mise à jour visible uniquement pour un actif compatible, affichage numérique, valeurs par défaut et haptique éventuelle, retour aux vues, presets horizontaux, coche rouge, bouton Tester, puis Galerie et Plus. Contrôler une petite hauteur d'écran, safe-area, rotation portrait/paysage et performance avec instrumentation réelle. Une CI verte n'établit pas la conformité visuelle du téléphone.

