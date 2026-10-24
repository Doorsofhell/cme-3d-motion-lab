# CME-3D — Alignement de la charte graphique Shadow Studio

## Sources et arbitrage
- Charte **réellement présente dans Shadow Studio** : `src/ui/styles.css`, identité « Dark Combat Premium » (fond #101116, surfaces #20232c/#2a2e39, accent #d6363c, texte #f5f5f5, or #c8a96b).
- Deux captures utilisateur de BetterMe : **références de composition**, non sources de couleurs de marque. Elles inspirent l'espacement généreux, la hiérarchie lisible, les grandes cartes arrondies, les zones tactiles et la navigation inférieure flottante.
- Priorité à la **charte validée Shadow**, pas à une copie beige BetterMe; le laboratoire 3D conserve une scène sombre neutre pour juger le mouvement et les matériaux.

## Livré dans cette PR
- Reprise des principaux tokens Shadow en CSS CME, sans importer de dépendance de Shadow.
- Alignement des surfaces, bordures, sélecteurs, boutons primaires, états actifs, indicateurs, titres de scène et focus clavier.
- Contraste des actions, focus visible et respect des préférences de réduction d'animation.
- Aucun changement aux mouvements, rigs, données Shadow ou fonctionnalités de test.

## Direction pour la refonte complète
1. **Laboratoire** : scène 3D dominante; filtres discipline/humanoïde/technique sous forme de cartes ou panneaux secondaires.
2. **Stress Test** : liste de scénarios, timeline, cartes d'anomalies et comparaison A/B avec mêmes composants.
3. **Studio Coach** : personnage en grand, catégories Corps / Visage / Peau / Cheveux / Tenue / Protections, contrôles contextualisés, aperçu permanent.
4. **Navigation inférieure unique** : trois onglets, grand rayon, fond légèrement translucide, zone sûre Android, états actifs rouge Shadow; ne pas répliquer les cinq onglets BetterMe.
5. **Mode clair éventuel** : reprendre les tokens clairs officiels Shadow (#f4f5f7, #fff) comme option ultérieure, pas imposer la palette beige des captures.
6. **Design system** : composants réutilisables, échelle typographique, spacing 4/8/12/16/24/32, rayon 10/14/20, tap targets >=48 px, accessibilité et contrastes mesurés.
7. **Validation visuelle** : captures Android portrait/paysage, tablette, desktop; régression des panneaux et commandes 3D; vérifier version et rendu GitHub Pages après fusion.

## Restant à faire
- Refondre la structure JSX en trois espaces, navigation inférieure fixe et panneau Studio Coach (non inclus).
- Centraliser les tokens dans un fichier partagé plutôt qu'un override de migration.
- Mesurer les contrastes et inspecter le rendu réel sur Android.
- Vérifier les styles des sous-composants historiques et remplacer progressivement les couleurs codées en dur.
- Fusionner uniquement après CI et revue visuelle.
