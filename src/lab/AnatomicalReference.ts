/**
 * Référence de cadrage de l'anatomie : les directions sont exprimées dans le
 * repère du modèle GLB (+Z = face), sans modifier le squelette canonique.
 * Chaque vue conserve la même distance calculée à partir de la silhouette.
 */
export type AnatomicalView='face'|'dos'|'profil-droit'|'profil-gauche';
export const ANATOMICAL_VIEWS:ReadonlyArray<{id:AnatomicalView;label:string}>=[
 {id:'face',label:'Face'},
 {id:'dos',label:'Dos'},
 {id:'profil-droit',label:'Profil droit'},
 {id:'profil-gauche',label:'Profil gauche'}
];
export function directionAnatomique(view:AnatomicalView):[number,number,number]{
 switch(view){
  case 'face':return [0,.04,1];
  case 'dos':return [0,.04,-1];
  case 'profil-droit':return [-1,.04,0];
  case 'profil-gauche':return [1,.04,0];
 }
}
