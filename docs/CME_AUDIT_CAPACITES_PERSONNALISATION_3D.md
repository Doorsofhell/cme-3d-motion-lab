# CME-3D — Audit réel des capacités de personnalisation (24/10/2026)

**Source vérifiable :** `scripts/audit-coach-capabilities.mjs` exécuté en CI sur les GLB versionnés de Kadir (`mma-kadir`) et Amara (`mma-amara`), leurs six disciplines et la variante JJB No-Gi. Aucune image, caméra ni vidéo utilisée.

## Inventaire réel des deux corps

| Capacité structurelle | Kadir (homme) | Amara (femme) |
| --- | --- | --- |
| Maillage du corps GLB | 1 | 1 |
| Sous-matériaux du corps (`body`, `head`) | 2 | 2 |
| Matériaux de peau reconnaissables | 2 | 2 |
| Matériaux séparés d'yeux | 0 | 0 |
| Matériaux séparés de cheveux | 0 | 0 |
| Mesh/matériaux de coiffure distincte trouvés | 0 | 0 |
| Morph targets faciaux nommés | 0 | 0 |
| Morph targets géométriques bruts | 0 | 0 |
| Tenues GLB disponibles | 7 | 7 |

**Lecture :** les couleurs de peau sont modifiables via les deux matières existantes. Le torse peut utiliser des déformations prudentes pondérées par le squelette déjà implémentées, mais il n'existe **aucune** cible morphologique native permettant de régler indépendamment poitrine, hanches, rondeurs, visage ou coiffure. L'absence d'assets féminins dédiés est un blocage réel pour ces fonctionnalités ; les contrôles ne doivent pas être affichés comme opérants tant qu'ils ne le sont pas.

## Capacités constatées dans les 14 tenues

| Discipline | Kadir | Amara |
| --- | --- | --- |
| Boxe anglaise | Gants, short | Gants, brassière, short |
| Kick-boxing | Gants, protège-tibias, short | Gants, protège-tibias, brassière, short |
| Muay-thaï | Gants, short | Gants, brassière, short |
| MMA | Gants, short | Gants, brassière, short |
| JJB Gi | Kimono haut et pantalon | Kimono haut et pantalon |
| JJB No-Gi | Rashguard haut et short | Rashguard haut et pantalon |
| Judo | Kimono haut et pantalon | Kimono haut et pantalon |

Ces catégories proviennent du nommage des matériaux et maillages dans les fichiers GLB. **Ce n'est pas une certification visuelle :** la concordance texture/surface, la couture des tenues et les collisions en mouvement exigent encore une recette réelle sur Android.

## Ordre des améliorations ouvertes

1. **P0 terminé sur le plan logiciel :** caméra contextuelle sur régions du squelette et audit systématique. Tests automatisés et CI obligatoires ; validation de rendu sur appareil physique encore ouverte.
2. **P1 volumes féminins :** définir une surface de référence d'Amara et produire/obtenir légalement des morph targets skinnés dédiés (poitrine, hanches, taille, cuisses/fessiers, rondeur). Vérifier plage d'amplitude, non-interpénétration, poids de skinning, os et six disciplines. Aucun nouveau curseur actif avant disponibilité et tests de ces cibles.
3. **P1 coiffures :** assets attachés/riggés à l'os tête, différentes coupes courtes et longues ; vérification des incompatibilités avec judo/JJB et protections. Pas de remplacement artificiel par une recoloration globale du crâne.
4. **P1 interaction dynamique :** reprise des mêmes morphs et coiffures dans le Laboratoire via l'adaptateur commun, tests de persistance, de rendu mobile et de rechargement sexe/disciplines.
5. **P0 recette Android :** zoom visage/buste/bassin/mains/tibias, geste libre qui interrompt la transition, vue complète, mode pédagogique distinct, FPS p50/p95, plein écran, Kadir/Amara. Sans captation, vidéo ni computer vision.

**Hors périmètre et intouchables :** moteur des mouvements canoniques et repository Shadow Studio.
