# CME-3D — Interface cible et référentiel Shadow (lecture seule)

## Vision UX
L'application est un **laboratoire de mouvements et un atelier de personnages**, pas une application de coaching fitness. Trois onglets inférieurs : Laboratoire, Studio Coach, Comparatif 3D. Charte Dark Combat Premium de Shadow, navigation Android verticale simple.

### Studio Coach : parcours en 3 étapes
1. **Choisir la base** : humanoïde neutre homme/femme, silhouette articulée, squelette canonique partagé.
2. **Personnaliser** : aperçu 3D permanent ; six cartes lisibles (Corps, Visage, Peau, Cheveux, Tenue, Protections), paramètres regroupés et valeurs explicites. Boutons Retour, Nouveau, Enregistrer, Supprimer. Le rendu Apparence ne doit pas contaminer le mode Rig neutre.
3. **Tester** : sauvegarde du profil avec identifiant stable, ouverture dans le Laboratoire ; tous les mouvements et enchaînements de toutes les disciplines via le même moteur.

### Laboratoire
Choisir humanoïde neutre ou coach sauvegardé ; choisir discipline, mouvement ou enchaînement ; lire, pause, vitesse, bouclage, comparer. Une modification de coach doit rester liée à son identifiant ; la suppression retire le profil de la bibliothèque et de la sélection active.

## Audit catalogue Shadow (source externe en lecture seule)
Dépôt : `Doorsofhell/combat-shadow-studio`, fichiers source `src/domain/techniques.ts`, `src/domain/exercises.ts`, `public/catalog/catalog-v1.json`. Le dépôt CME possède déjà `src/lab/shadowExercises.json` avec **208 entrées** importées : boxe: 45, kickboxing: 44, mma: 44, muaythai: 44, bjj: 16, judo: 15. Statut source `imported_from_shadow_unvalidated`.

Ne pas confondre :
- techniques déclarées dans Shadow ;
- exercices et enchaînements du catalogue Shadow ;
- mouvements effectivement disponibles dans le moteur 3D CME ;
- animations riggées validées sur les deux humanoïdes.

**Ce lot ne certifie pas la couverture exhaustive des versions historiques de Shadow** : les anciens commits et catalogues versionnés doivent être comparés, les identifiants dédupliqués, les manques signalés, les licences vérifiées et les exercices non exécutables identifiés. Ne pas promettre « tous les mouvements testables » avant validation par discipline et rig.

## État du lot
CRUD local (création, édition sur même ID, suppression confirmée) ; liaison à la bibliothèque Lab et au moteur canonique existant. Personnalisation mesh/visage/tenue encore partielle. Audit tactile Android et tests réels des mouvements toujours requis.

## Prochaines priorités
P0 audit UX tactile réel, sauvegarde/édition/suppression sans perte ; P1 inventaire Shadow exhaustif historique et validation moteur des six disciplines ; P1 vrais humanoïdes neutres riggés ; P2 apparence intégrale liée au mesh ; P2 A/B biomécanique quantitatif.
