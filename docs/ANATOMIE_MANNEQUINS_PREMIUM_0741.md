# CME-3D — Exigence maître anatomie premium et livraison 0.7.41 → 0.7.43
**Décision utilisateur du 25 octobre 2026.** Ce document complète le prompt maître, ne remplace aucune décision antérieure et protège le dépôt Shadow Studio.

## Référence visuelle contractuelle
Deux planches fournies par le commanditaire (face, dos, profil droit, profil gauche) servent de cible artistique, NON de GLB directement exploitable. Silhouette mannequin d'étude anatomique adulte, gris satin métalisé mesuré, visage volontairement neutre, articulation discrète, membre entier en pose symétrique debout.

### Homme
Morphologie athlétique crédible : épaules larges, pectoraux et dorsaux structurés, ceinture abdominale visible, bassin masculin, fessiers, cuisses et mollets cohérents ; mains/pieds anatomiques lisibles. Ne pas caricaturer les muscles.

### Femme
Morphologie athlétique, identifiable à la silhouette sans tenue : poitrine naturelle non sexualisée, taille, bassin, courbes des hanches et fessiers, cuisses et mollets cohérents. Maintenir densité, équilibre et posture réalistes. Même catalogue fonctionnel de personnalisation que l'homme avec limites adaptées, pas de contrôle artificiellement désactivé par le sexe.

## Fondations techniques non négociables
1. Deux véritables **modèles organiques 3D** distincts, continus et anatomiquement crédibles, riggés sur le squelette canonique existant ; pas d'assemblage de capsules, sphères ou générateurs 2D convertis fictivement en maillage.
2. Vues face/dos/profil droit/profil gauche sur la même scène 3D, éclairage et cadrage reproductibles ; la forme doit être cohérente sur 360°.
3. Retargeting, skinning, poids, racines des animations, mouvements canoniques et dépôt Shadow intacts. Création en pose de référence ; discipline/latéralité seulement en test.
4. Des contrôles réels seulement si le GLB possède les sommets, maillages ou morphs correspondants. Privilégier déformation non destructive sur clone skinné, interpolation bornée entre zones ; ne pas annoncer une modification visuelle qui n'est qu'une valeur enregistrée.
5. Le matériau mannequin satin gris est un mode de visualisation indépendant du mode peau réaliste/animation, et du mode vêtement. Le changement de rendu ne doit effacer ni le profil ni les teintes sauvegardées.
6. Accès tactile Android : une seule barre de navigation inférieure, commandes de 44 px minimum, vue 3D stable ; instrumentation FPS p50/p95, changement homme/femme, GLB et récupération WebGL.
7. Ajouter des actifs 3D seulement avec provenance et droit d'utilisation vérifiés. Le référentiel d'images fourni par l'utilisateur est une orientation artistique, pas un asset 3D livré.

## Feuille de route ordonnée
### 0.7.41 — Fondation de cadrage et témoin gris (livrable logiciel)
- Vue mannequin gris satin sur le véritable rig GLB existant, sans habits.
- Quatre cadrages anatomiques à angle explicite ; conserver le mode libre.
- Réactiver morphologie fine sur le corps neutre lorsqu'elle est techniquement présente, parité H/F.
- Tests déterministes de matériaux isolés, caméra, persistance, absence de touches Shadow.
- **Limite** : cette version ne livre pas les sculptures premium ni des morphs fessiers/visage absents du GLB.

### 0.7.42 — Sculptures anatomiques H/F (bloquant artistique)
- Créer/obtenir deux GLB professionnels originaux depuis les planches, mesh organique et topology adéquate, UV/normal maps, pose neutre, rig skinning.
- Produire et inspecter captures **issues des GLB rendus**, quatre vues par sexe ; comparaison anatomique humaine, y compris poitrine, dos, bassin, fessiers, mains, articulations.
- Tester les transitions sans percée, non-régression biomécanique et restauration du neutre.
- Ne pas déclarer terminée si les GLB réels ne sont pas fournis, testés et importés.

### 0.7.43 — Personnalisation morphologique précise et recette
- Morph targets localisés et liés (buste, pectoraux, épaules, taille, abdomen, bassin, hanches, fessiers, cuisses, mollets, bras, visage) suivant ressources GLB.
- Poids/taille/corpulence et musculature cohérents sans perte de proportions ; habilitations explicitement mesurées par GLB.
- Tests sur profils H/F, 4 angles, tailles/poids bornés et passages créateur↔mannequin↔tenue, stress Android + fonctionnement PWA.
- CI, fusion uniquement après validation et Pages ; vérifier URL publiée, ne pas confondre fusion et déploiement réussi.

## Portes de validation
**G0** provenance/licences, **G1** deux maillages 3D adultes distincts et qualité silhouette quatre vues, **G2** déformations réelles non destructives H/F, **G3** squelette/animations, **G4** Android, **G5** tests CI, **G6** fusion + Pages + chargement public. Un échec à G1 interdit la mention « rendu de référence atteint ».

## Convention de communication avec le commanditaire
Réponses en français, statut **réel** (préparé / codé / CI / fusionné / déployé / testé Android), corrections ordonnées, une proposition de choix actionnable quand une décision est nécessaire, sans répétition ni dérive vers Shadow. Ne pas prétendre au travail autonome après cette intervention ni à un déploiement non confirmé.


## Jalon technique 0.7.42 — étalons 3D CC0
- Homme : https://www.innerscene.com/tools/library/3d-parts/male-base-mesh-3d-person-rigged-a-pose-380e6d89
- Femme : https://www.innerscene.com/tools/library/3d-parts/female-base-mesh-3d-person-rigged-a-pose-dba97ed5
- Chaque asset est annoncé CC0, A-pose, 163 os, sans vêtements, environ 109 000 triangles. Vérification de la validité GLB, des sommets skinnés et de SHA256 dans `scripts/fetch-premium-anatomy.mjs`.
- Les fichiers sont récupérés dans `public/anatomie` à chaque CI et inclus dans la publication Pages. Pas de remplacement silencieux si la source échoue.
- Mode étalon en lecture seule : **n'affirme pas** l'équivalence des rigs MakeHuman/CME ni la perfection artistique à l'image ; le retargeting, les morphs localisés et l'inspection visuelle restent des portes bloquantes.



### 0.7.43 — Adaptation morphologique par sexe, nouveau besoin du commanditaire
La richesse fonctionnelle est identique, mais pas les volumes résultants. La femme doit rester crédible et harmonieuse : ajustements doux de poitrine / taille / hanches / fessiers / cuisses, y compris lors du changement de poids. Le modèle masculin a un volume pectoral et pelvien différent. Nouveaux fessiers sur les vrais sommets pondérés par le squelette, sans ajouter de primitives. Les GLB source, os, weights, animations et Shadow restent intacts. Limites documentées : cette déformation ne remplace pas des morph targets de sculpture originaux ; références CC0 encore en lecture seule, non retargetées.
