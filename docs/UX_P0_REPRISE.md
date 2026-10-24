Priorité P0 : scène visible, défilement mobile, navigation basse et commandes accessibles. Shadow inchangé.

## Correctif
Le défilement vertical de l'écran principal est rétabli malgré les styles historiques. La scène 3D occupe environ 58 % de la hauteur visible avec un minimum de 330 px en mode portrait, ajusté pour les écrans courts. Le quai de navigation reste collé au bas de la zone visible ; les commandes principales gardent des cibles tactiles d'au moins 44 px. Le plein écran conserve 100 % de la hauteur et masque le défilement. Le Studio Coach reçoit également un aperçu agrandi.

## Recette avant fusion
Vérifier typecheck, tests Vitest, construction Vite avec base GitHub Pages, puis chargement de la page déployée. La validation tactile réelle Android (défilement, double-tap, clavier, orientation, accessibilité) reste à effectuer séparément ; ne pas la déclarer accomplie par les tests statiques.

## Contraintes
Conserver l'ordre A puis B puis C et le choix libre prioritaire. Aucun changement au dépôt Shadow.
