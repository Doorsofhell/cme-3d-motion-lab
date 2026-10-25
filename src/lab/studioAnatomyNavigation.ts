/** Familles visuelles inspirées des maquettes, sans changer les capacités du rig. */
export type ZoneAnatomique='corps'|'silhouette'|'visage'|'peau'|'cheveux'|'tenue'|'protections';
export type GroupeAnatomique={id:'corps'|'visage'|'peau'|'equipement';libelle:string;icone:ZoneAnatomique;zones:readonly ZoneAnatomique[]};
export const GROUPES_ANATOMIQUES:readonly GroupeAnatomique[]=[
 {id:'corps',libelle:'Corps',icone:'corps',zones:['corps','silhouette']},
 {id:'visage',libelle:'Visage',icone:'visage',zones:['visage','cheveux']},
 {id:'peau',libelle:'Peau',icone:'peau',zones:['peau']},
 {id:'equipement',libelle:'Tenues',icone:'tenue',zones:['tenue','protections']}
];
export function groupePourZone(zone:ZoneAnatomique):GroupeAnatomique{
 const groupe=GROUPES_ANATOMIQUES.find(g=>g.zones.includes(zone));
 if(!groupe)throw new Error('Zone anatomique inconnue : '+zone);
 return groupe;
}
