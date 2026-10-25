/** Régions de sculpture sur l'axe X. Les zones ne sont pas dupliquées. */
export type ZoneAnatomique='corps'|'silhouette'|'visage'|'peau'|'cheveux'|'tenue'|'protections';
export type GroupeAnatomique={id:'tete'|'buste'|'jambes'|'peau'|'equipement';libelle:string;icone:ZoneAnatomique;zones:readonly ZoneAnatomique[]};
export const GROUPES_ANATOMIQUES:readonly GroupeAnatomique[]=[
 {id:'tete',libelle:'Tête',icone:'visage',zones:['visage','cheveux']},
 {id:'buste',libelle:'Corps',icone:'corps',zones:['corps']},
 {id:'jambes',libelle:'Jambes',icone:'silhouette',zones:['silhouette']},
 {id:'peau',libelle:'Peau',icone:'peau',zones:['peau']},
 {id:'equipement',libelle:'Tenues',icone:'tenue',zones:['tenue','protections']}
];
export function groupePourZone(zone:ZoneAnatomique):GroupeAnatomique{
 const groupe=GROUPES_ANATOMIQUES.find(g=>g.zones.includes(zone));
 if(!groupe)throw new Error('Zone anatomique inconnue : '+zone);
 return groupe;
}
