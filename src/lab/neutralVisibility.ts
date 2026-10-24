import {Mesh,MeshStandardMaterial,Object3D} from 'three';
/** Masque les maillages d'origine sans masquer leurs enfants ni les os animés. */
export function masquerApparenceSource(racine:Object3D):number{
 let nombre=0;
 racine.traverse(objet=>{
  const maillage=objet as Mesh;
  if(!maillage.isMesh||maillage.name.startsWith('CME_NEUTRAL_'))return;
  maillage.visible=true;
  maillage.userData.cmeHiddenSource=true;
  const materiaux=Array.isArray(maillage.material)?maillage.material:[maillage.material];
  const clones=materiaux.map(materiau=>{
   const copie=materiau.clone() as MeshStandardMaterial;
   copie.transparent=true;
   copie.opacity=0;
   copie.depthWrite=false;
   copie.colorWrite=false;
   copie.needsUpdate=true;
   return copie;
  });
  maillage.material=Array.isArray(maillage.material)?clones:clones[0];
  nombre++;
 });
 return nombre;
}
