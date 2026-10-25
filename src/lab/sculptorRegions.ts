import type {GroupeAnatomique,ZoneAnatomique} from './studioAnatomyNavigation';
import type {ShapeKey} from './visualShapePresets';
/** Un seul référentiel entre axe X, rail Y, zoom osseux et curseurs effectifs.
 * Chaque entrée anime seulement une morphologie réellement prise en charge. */
export type SculptorRegion={id:string;libelle:string;zone:ZoneAnatomique;forme?:ShapeKey|'height'};
const cible=(id:string,libelle:string,zone:ZoneAnatomique,forme?:ShapeKey|'height'):SculptorRegion=>({id,libelle,zone,forme});
export const REGIONS_SCULPTEUR:Readonly<Record<GroupeAnatomique['id'],readonly SculptorRegion[]>>={
 tete:[
  cible('eyes','Yeux','visage','eyes'),
  cible('nose','Nez','visage','nose'),
  cible('jaw','Mâchoire','visage','jaw'),
  cible('cheveux','Cheveux','cheveux')
 ],
 buste:[
  cible('height','Stature','corps','height'),
  cible('shoulders','Épaules','corps','shoulders'),
  cible('bust','Poitrine / pectoraux','corps','bust'),
  cible('muscle','Muscles','corps','muscle'),
  cible('arms','Bras','corps','arms'),
  cible('waist','Taille','corps','waist'),
  cible('roundness','Rondeur','corps','roundness')
 ],
 jambes:[
  cible('hips','Hanches','silhouette','hips'),
  cible('glutes','Fessiers','silhouette','glutes'),
  cible('thighs','Cuisses','silhouette','thighs'),
  cible('calves','Mollets','silhouette','calves')
 ],
 peau:[cible('peau','Teint','peau')],
 equipement:[cible('tenue','Tenue','tenue'),cible('protections','Protections','protections')]
};
export function regionsPourGroupe(id:GroupeAnatomique['id']):readonly SculptorRegion[]{return REGIONS_SCULPTEUR[id];}
