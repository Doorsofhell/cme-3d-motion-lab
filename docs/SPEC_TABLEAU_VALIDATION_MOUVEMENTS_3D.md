# Cahier d'interface — Tableau de validation des mouvements 3D

## Objet et périmètre
Ce tableau est une **spécification d'intégration future**, pensée pour le moteur CME-3D et son éventuelle utilisation dans Shadow. Dans CME-3D actuel, aucune capture par caméra, aucun suivi corporel utilisateur et aucune analyse vidéo ne sont autorisés ou implémentés. Les vues comparatives utilisent des données synthétiques ou préenregistrées autorisées, jamais une captation implicite. Les commandes vocales et les capteurs de distance restent des interfaces futures non activées.

## 1. Architecture des composants

| Zone | Composant français | Contenu et responsabilité |
|---|---|---|
| En-tête | Bandeau de validation | Discipline, mouvement, statut du moteur, état de sécurité |
| Surimpression | Indicateurs périphériques | Bandes latérales vertes/orange/rouges, option désactivable |
| Scène | Fenêtre 3D principale | Humanoïde neutre et coach de référence ; affichage grand format |
| Scène | Caméra pédagogique | Cadrage automatique contextualisé selon les gestes ; bascule caméra libre |
| Scène | Sélecteur de représentation | Fantôme, Cinématique brute, Comparaison miroir |
| Scène | Alertes contextuelles | Risques articulaires simulés ou mesurés, jamais diagnostics médicaux |
| Bas de page | Quai de test | Lecture, pause, suivant, répétition, vitesse, validation, sauvegarde |
| Menu secondaire | Outils techniques | Courbes, vecteurs, angles, logs, calibration, diagnostics et export |

La fenêtre 3D doit conserver une grande surface d'affichage. Double-clic ou double-tap sur la scène pour le plein écran, bouton visible de sortie, touche Échap. Les commandes courantes sont dans la zone du pouce ; les diagnostics sont repliés par défaut.

## 2. Adaptation à la distance
**Mode rapproché (jusqu'à 50 cm)** : densité normale, commandes tactiles de 44 px minimum, métriques détaillées et courbes consultables.
**Mode entraînement (1,5 à 2,5 m)** : typographie et métriques principales pouvant atteindre 300 % de leur taille de référence ; grandes zones de commande ; affichage des états essentiels. La bascule automatique exige un capteur de distance explicitement autorisé ; à défaut, l'utilisateur choisit manuellement le mode. Les commandes vocales « Pause » et « Suivant » et les validations gestuelles sont **des points d'extension**, non des fonctions livrées.

## 3. Modes de représentation
- **Superposition fantôme** : coach texturé à 30 % d'opacité sur un rig cinématique de comparaison, uniquement si leurs référentiels spatiaux sont compatibles.
- **Cinématique brute** : os, vecteurs, articulations et volumes de collision, sans matériau de peau ni vêtements.
- **Comparaison miroir** : coach à gauche, rig de comparaison à droite ; horloge d'animation synchronisée et axes clairement identifiés.

## 4. Parcours et états
1. **Préparation** : sélectionner discipline, technique, coach, rig et représentation ; vérifier le chargement des modèles.
2. **Étalonnage** : choisir l'origine, les axes et les longueurs de référence ; confirmer la cohérence des deux squelettes. En l'absence de capteurs, étalonnage purement logiciel.
3. **Prêt** : lancer une animation de référence ou un scénario d'essai enregistré.
4. **Exécution** : enchaîner direct avant, direct arrière et crochet ; afficher les trajectoires des poignets, angles de coude, stabilité des appuis et vitesse angulaire.
5. **Évaluation** : calculer l'écart cinématique en degrés, centimètres et millisecondes par rapport à la référence ; afficher la provenance et la confiance des mesures.
6. **Validation** : succès si les seuils configurés sont respectés, sinon signaler la dimension en écart sans conclure à une blessure.
7. **Enregistrement** : conserver technique, rig, version du moteur, mesures, seuils et horodatage ; aucune vidéo utilisateur.

États de la machine : **Non chargé → Chargement → Prêt → Lecture → Pause → Évaluation → Validé / À revoir / Non exécutable → Enregistré**. Toute erreur de chargement doit proposer « Réessayer » sans effacer le personnage.

## 5. Dictionnaire des états et jetons visuels

| Jeton | Couleur | Libellé français | Signification |
|---|---|---|---|
| Sûr | #4CC38A | Alignement conforme | Écart inférieur au seuil |
| Attention | #E9A34A | Alignement à vérifier | Écart intermédiaire |
| Alerte | #D6363C | Alerte hyperextension du coude | Dépassement du seuil cinématique, à confirmer |
| Neutre | #A6A8B3 | Mise au point du squelette | Étalonnage ou calcul en cours |
| Information | #C8A96B | Écart cinématique | Mesure comparative affichée |
| Indisponible | #747988 | Mouvement non exécutable | Animation absente ou rig incompatible |

Ne jamais transmettre l'état uniquement par la couleur : ajouter texte, icône et motif. Les bandes périphériques doivent être désactivables, respecter la réduction des animations et ne pas clignoter rapidement.

## 6. Retours sonores et haptiques
- **Forme et vitesse conformes** : son aigu bref et discret, non intrusif.
- **Impact insuffisant selon le modèle de simulation** : son grave bref ; ne pas assimiler à une force réellement mesurée sans capteur.
- **Alerte d'alignement** : deux impulsions espacées, son facultatif, jamais alarmiste.
- **Bracelet connecté** : séquences haptiques courtes uniquement si l'appareil et son API sont compatibles et si l'utilisateur a activé les retours.
- Prévoir silence total, réglage du volume, désactivation des vibrations et alternative visuelle accessible.

## 7. Critères de recette
Chargement homme/femme, absence de vêtements en mode neutre, synchronisation des animations, affichage plein écran, caméra pédagogique non nauséogène, sortie de plein écran, commandes accessibles au pouce, cohérence des trois vues, lisibilité à distance, accessibilité sans couleur, sauvegarde sans perte, aucun changement à Shadow. Vérifier les fréquences d'images sur Android réel ; ne jamais assimiler tests unitaires et certification biomécanique.
