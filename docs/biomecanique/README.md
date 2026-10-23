# CME-3D — Référentiel biomécanique international

**Audit initial : 24 octobre 2026.** Travail documentaire, sans changement de moteur, de modèle humain ou d’animations.

## État de couverture

| Discipline | Techniques cataloguées | Déjà dans le moteur | Candidates | Animations validées | Combos hypothétiques |
|---|---:|---:|---:|---:|---:|
| Boxe anglaise | 42 | 30 | 12 | 0 | 13 |
| Kick-boxing | 59 | 46 | 13 | 0 | 7 |
| Muay-thaï | 78 | 54 | 24 | 0 | 6 |
| MMA | 77 | 54 | 23 | 0 | 6 |
| BJJ | 60 | 12 | 48 | 0 | 5 |
| Judo | 111 | 11 | 100 | 0 | 6 |

Au total : **306 mouvements uniques**, dont **86 existants** et **220 candidats supplémentaires** ; **43 propositions de combinaisons** ; **25 notices de références** ; **306 fiches de recherche visuelle**. Plusieurs mouvements appartiennent à plusieurs disciplines.

**Attention : 0 mouvement scientifiquement validé dans son animation 3D à ce stade.** Une source pouvant décrire la famille d'un geste ne signifie pas que son animation a été validée.

## Contenu

- mouvements.json : fiches individuelles à champs stables (anatomie, cinématique, IK/FK, appuis, sources et statut)
- enchainements.json : 43 séquences de tests expérimentales ; aucun timing inventé
- references_visuelles.json : requêtes d'images par technique, angles, phases et portails visuels potentiels
- sources.json : bibliographie avec niveaux de vérification explicites
- COUVERTURE.json : matrice de couverture issue de l'audit
- validate_biomecanique.py : validateur des références et identifiants
- SOURCES_VISUELLES.md : ressources d'images consultables, sans reprise de pixels tiers
- Documentation méthodologique : NOMENCLATURE, CINEMATIQUE, CONTRAINTES_ANATOMIQUES, TRANSITIONS, VALIDATION, LACUNES_ET_RECHERCHES

Les valeurs métriques non documentées restent null. Chaque séquence de la base de combos est une hypothèse de développement et non une recommandation sportive ni une technique biomécaniquement validée.

## Maintenance

Ne pas changer les identifiants existants; enregistrer provenance, source, date, phase et modifications. Vérifier droits images/vidéos et ne pas télécharger de contenus sans licence compatible.

Lancer : python3 docs/biomecanique/validate_biomecanique.py

**Cette livraison est un socle de recherche structuré, et non la fin d'une recherche internationale exhaustive.**


## Audit des dépôts internationaux
sources_github.json contient 15 dépôts avec contraintes de licence ; donnees_github.json contient les 12 chaînes BJJ, 15 classes muay-thaï, 6 types de punch BoxingVI et les mesures descriptives de trois clips DeepMimic. Aucun média tiers réhébergé.
