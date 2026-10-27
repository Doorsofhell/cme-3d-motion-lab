# CME-3D 0.7.51 — Habillage sportif commun aux trois rendus

## Décision définitive de direction artistique (26 octobre 2026)

**Aucune tenue de super-héros**. Les disciplines boxe, kick-boxing, Muay-thaï, MMA, JJB/BJJ et judo conservent **les mêmes GLB d'uniformes et de protections** en Ultra réaliste, Animation fitness et Comics, ainsi que les personnalisations de matière/couleur autorisées par le modèle. Ne pas interpréter le style comics comme une justification d'un nouveau design textile.

L'apparence comics reste possible par la lumière stylisée (3 bandes) et les contours noirs sur les maillages chargés, sans modifier leur albédo ni les motifs; Animation fitness conserve son dégradé à 6 bandes sans imposer de palette vestimentaire. Les variations de rendu perçues dues à l'éclairage ne constituent pas une tenue différente.

## Portée fonctionnelle

- **Code source** : `src/lab/Fighter.tsx`, méthode `styliserEclairage`, conversions `applyFitnessStyle` et `applyComicStyle`. La texture `map`, les normales `normalMap`, l'alpha `alphaMap`, la couleur `color`, les réglages de transparence et le rendu de chaque mesh restent issus du matériau sportif Ultra existant. Aucun changement des fichiers GLB.
- **Personnalisation** : `applyCoachLookGeometry` et `applyNeutralAppearance` continuent de recevoir le profil sélectionné **dans chaque mode de rendu et discipline**, après attachement de la même tenue sportive. Le contrôle des capacités réelles par modèle demeure nécessaire ; les coiffures spécialisées non livrées ne sont pas revendiquées comme fonctionnelles.
- **Biomécanique** : `CoachRig`, motions et séquences ne sont pas modifiés, pas de retargeting nouveau, mêmes bones/poids/trajectoires. Le contour comics s'appuie sur la même ossature et est omis en profil Performance afin de limiter son coût GPU.
- **Interface** : renommer le sélecteur `Héros comics` en `Comics · mêmes tenues`, sans modifier les quatre destinations globales du produit.
- **Shadow** : dépôt et références en lecture seule stricte.

## Protocole en cinq étapes

1. **Ajouter sans effacer** le nouveau choix « uniforme sportif » en remplacement du projet de costume héroïque non validé.
2. **Contrôler les impacts** : uniquement shader/matériau local et libellé, pas les assets 3D, rigs, poses, animations ni architecture de navigation.
3. **Appliquer les règles d'or** : zéro faux vêtement / morph ; intégrité rig/skinning/animations, zéro tracking, sources Shadow protégées, aucune mesure de performance inventée.
4. **Tester** : couleurs et textures identiques avant et après stylisation des six disciplines ; personnalisations conservées en animation stylisée ; squelettes et maillages invariants ; Vitest/typecheck/validation GLB/build/CI verte et Pages publiées ; recette réelle Android distincte.
5. **Documenter** la règle dans les trois documents directeurs et l'historique de version.

## Limitations et recette mobile

Les shaders Toon changent la réponse à l'éclairage, pas la base des vêtements. Le rendu sur téléphone Android réel, la fluidité et les performances FPS/latence/GPU restent **Non mesuré**. Tester les six sports pour les deux sexes, avec chaque style et les coloris personnalisés, ainsi que plusieurs enchaînements ; ne déclarer « fidèle visuellement » qu'après une comparaison tangible.

