/** Éclairage sportif 3 points : source, remplissage et contre-jour.
 * Toutes les six disciplines / deux sexes utilisent ces trois mêmes profils,
 * sans distinction vestimentaire ou biomécanique.
 * Chaque valeur est un paramètre de scène, PAS une mesure de FPS/GPU.
 */
export type RenduSportif='ultra'|'fitness'|'comic';
export type PositionLumiere=[number,number,number];
export type SourceLumiere={position:PositionLumiere;color:string;intensity:number};
export type ProfilLumiere={
 hemisphere:{sky:string;ground:string;intensity:number};
 key:SourceLumiere;fill:SourceLumiere;rim:SourceLumiere;
 front:SourceLumiere;floor:string;exposure:number;
};
export const PROFILS_LUMIERE:Record<RenduSportif,ProfilLumiere>={
 ultra:{
  hemisphere:{sky:'#fff7f0',ground:'#697384',intensity:1.05},
  key:{position:[2.3,4.4,3.1],color:'#fff2df',intensity:1.75},
  fill:{position:[-3.2,1.9,2.5],color:'#d3e6f4',intensity:.74},
  rim:{position:[1.0,3.2,-3.0],color:'#e3edff',intensity:1.35},
  front:{position:[0.2,1.8,4.1],color:'#ffffff',intensity:.24},
  floor:'#262d36',exposure:1.10
 },
 fitness:{
  hemisphere:{sky:'#fffaf0',ground:'#c4d1db',intensity:1.20},
  key:{position:[2.3,4.4,3.1],color:'#fff7e7',intensity:1.73},
  fill:{position:[-3.2,1.9,2.5],color:'#d8f0ff',intensity:.88},
  rim:{position:[1.0,3.2,-3.0],color:'#f4f9ff',intensity:.95},
  front:{position:[0.2,1.8,4.1],color:'#ffffff',intensity:.23},
  floor:'#ccd8de',exposure:1.02
 },
 comic:{
  hemisphere:{sky:'#d9eaff',ground:'#293444',intensity:.80},
  key:{position:[2.3,4.4,3.1],color:'#fff2e5',intensity:2.10},
  fill:{position:[-3.2,1.9,2.5],color:'#accce5',intensity:.36},
  rim:{position:[1.0,3.2,-3.0],color:'#bbdbff',intensity:1.50},
  front:{position:[0.2,1.8,4.1],color:'#ffffff',intensity:.16},
  floor:'#131923',exposure:1.0
 }
};
/** Pas de moteur parallèle : uniquement des propriétés de lumières Three.js. */
export function studioLightingPreset(style:RenduSportif):ProfilLumiere{
 return PROFILS_LUMIERE[style];
}
