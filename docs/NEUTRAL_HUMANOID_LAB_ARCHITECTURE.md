# CME-3D — Architecture du laboratoire biomécanique canonique

Décision validée le 24 octobre 2026.

## Finalité
CME-3D est le banc d'essai du moteur 3D destiné à Combat Shadow Studio. Le dépôt Shadow demeure **strictement en lecture seule**. Les scénarios Shadow sont des cas de test, et non des définitions de rig ni des mouvements certifiés.

## Nouveau modèle canonique
- Deux humanoïdes neutres de référence : **masculin** et **féminin**, sans tenues de coach.
- Un contrat squelettique commun (noms d'os, axes, unités métriques, repère monde, racine, articulations, mains et pieds).
- Des métriques morphologiques propres à chaque humanoïde (longueurs des segments, limites anatomiques, centres articulaires et enveloppes de contact).
- Une bibliothèque commune de techniques et de mouvements paramétriques, avec retargeting et ajustements par morphologie.
- Les coachs et futurs combattants sont des **habillages** : apparence, textures, accessoires, vêtements, protections, morphologie personnalisée. L'habillage ne doit pas modifier le sens technique d'une animation.
- Chaque mouvement doit être testé indépendamment sur les deux humanoïdes, puis sur des morphologies extrêmes et avec habillages.

## Trois espaces principaux de l'application
1. **Humanoïdes (onglet principal)** : sélection homme/femme, discipline, mouvement, squelette visible, axes, articulations, pieds, centre de masse estimé, ralenti, lecture image par image, diagnostics.
2. **Stress Test biomécanique** : scénarios Shadow (208 exercices déjà importés, sous réserve de compatibilité), séquences jusqu'à 20 mouvements, transitions, répétitions, vitesse, chronologie, rapports par articulation et comparaison A/B du moteur.
3. **Habillages et compatibilité** : coachs existants, variantes Ultra/Fitness/Comics, vêtements, proportions, collisions et vérification du retargeting.

Les trois onglets restent ancrés en bas sur mobile, conformément à la décision antérieure.

## Contrat technique proposé
- `CanonicalSkeleton`: hiérarchie d'os, conventions d'axes et de coordonnées, identifiants stables.
- `NeutralHumanoidProfile`: sexe de référence, proportions et limites articulaires mesurées; aucun stéréotype de mouvement imposé.
- `MotionDefinition`: phases, appuis, trajectoires, impacts, contacts, paramètres de vitesse et transition.
- `MotionEvaluation`: erreurs articulaires, stabilité d'appui, pénétration, glissement, continuité de vitesse et d'accélération, retour en garde, contact.
- `AppearanceAdapter`: retargeting, ajustement de skinning, accessoires et vêtements, sans écraser la définition biomécanique.
- `Scenario`: discipline, séquence, répétitions, vitesse, humanoïde, moteur candidat et version de référence.

## Pipeline de recherche et données vidéo — nouvelle autorisation
L'interdiction antérieure d'analyse vidéo automatisée est levée **uniquement** pour des vidéos légalement accessibles et réutilisables. Aucune capture caméra utilisateur.

1. Constituer un inventaire de sources (discipline, technique, auteur, licence, attribution, URL, conditions de redistribution, provenance).
2. Vérifier les droits avant tout téléchargement, extraction de poses, stockage ou entraînement. Un visionnage public n'autorise pas automatiquement la réutilisation pour entraîner un modèle.
3. Préparer un pipeline **hors navigateur**, reproductible et optionnel : ingestion autorisée → estimation de poses → contrôle qualité → normalisation 3D → retargeting canonique → revue biomécanique → dataset versionné.
4. Séparer données brutes, dérivés, annotations et jeux d'évaluation. Respecter licences, confidentialité et droits des personnes.
5. Traiter occlusions, perspectives, erreurs de profondeur et contacts multi-personnages; aucune pose extraite ne devient une vérité terrain sans contrôle.
6. Entraîner ou calibrer les modèles uniquement sur des corpus explicitement autorisés, documenter provenance, version, limites et résultats par discipline.
7. Prévoir une voie de référence sans vidéo : publications scientifiques, référentiels anatomiques et jeux de données de mouvements 3D autorisés.

## Portes de validation et critères de livraison
- TypeScript, tests unitaires et build réussis.
- Zéro régression non approuvée sur les mouvements précédemment validés.
- Tests de trajectoires, transitions, appuis et contacts **sur les deux humanoïdes** pour chacune des six disciplines.
- Stress tests des séquences expertes Shadow, avec rapports d'anomalies et couverture explicite des mouvements absents.
- Android : cible >=30 FPS soutenus en mode équilibré sur appareil réel de référence.
- Ultra, Fitness et Comics visuellement différenciés, sans divergence de trajectoire causée par l'habillage.
- GitHub Pages déployé, version visible et commit publié vérifiés.

La validation logicielle ne constitue pas une certification biomécanique. Prévoir revue technique humaine et étiquettes : expérimental / contrôle automatique / revue biomécanique / validé.

## Plan de migration sans régression
**Lot A — contrats et tests** : interfaces du squelette canonique, profils neutres, tests de compatibilité rigs et états de validation; pas de remplacement brutal des coachs.

**Lot B — deux humanoïdes neutres** : modèles GLB compatibles, poses de référence, affichage squelette/contacts, onglet Humanoïdes par défaut.

**Lot C — stress tests** : exercices Shadow et combinaisons expertes, pause/ralenti/image par image, transitions et A/B à paramètres identiques.

**Lot D — analyse biomécanique** : métriques articulaires et contacts, golden fixtures, comparaison de versions et rapports reproductibles.

**Lot E — pipeline vidéo autorisé** : inventaire de licences, prototype hors navigateur, extraction/validation sur corpus licite, aucune collecte caméra.

**Lot F — habillages** : adapters pour coachs, skins, morphologies et tenues, comparaison avec humanoïdes de référence, performances Android.

### Dépendances
A précède B; B précède la validation définitive de C/D/F. C peut commencer sur le moteur actuel avec statut expérimental. E est indépendant du runtime et ne doit pas bloquer les tests sans vidéo.

## État réel à la date de rédaction
- PR #45 fusionnée; feuille de route qualité présente dans main.
- PR #46 (portes P0) et #47 (intégrité de l'import Shadow) ouvertes, non fusionnées.
- Les 208 exercices Shadow existent déjà dans CME; plusieurs références de mouvements manquent.
- Les deux humanoïdes neutres canoniques, le laboratoire réorganisé, le pipeline vidéo et le comparateur A/B de mouvements ne sont **pas encore implémentés**.
- Aucun entraînement biomécanique sur vidéos n'a été réalisé à cette étape.

## Non-objectifs
Ne pas modifier Combat Shadow Studio. Ne pas télécharger ni entraîner sur des vidéos sans droits appropriés. Ne pas présenter les styles graphiques comme des modèles biomécaniques indépendants.
