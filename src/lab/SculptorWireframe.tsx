import {useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {Mesh,MeshStandardMaterial,type Material} from 'three';
/** Mode diagnostic du vrai maillage : clones de matériaux réversibles.
 * Aucun changement aux os, poids de skinning ou animations. */
export function SculptorWireframe({actif,version}:{actif:boolean;version:string}){
 const scene=useThree(s=>s.scene);
 useEffect(()=>{
  if(!actif)return;
  const modifications:{maillage:Mesh;originaux:Material|Material[];copies:Material[]}[]=[];
  scene.traverse(o=>{
   if(!(o as Mesh).isMesh)return;
   const maillage=o as Mesh;
   const originaux=maillage.material;if(!originaux)return;
   const m=Array.isArray(originaux)?originaux:[originaux];
   const copies=m.map(original=>{
    const copie=original.clone();
    if(copie instanceof MeshStandardMaterial)copie.wireframe=true;
    else if('wireframe' in copie)(copie as Material&{wireframe:boolean}).wireframe=true;
    return copie;
   });
   maillage.material=Array.isArray(originaux)?copies:copies[0];
   modifications.push({maillage,originaux,copies});
  });
  return()=>{for(const {maillage,originaux,copies} of modifications){maillage.material=originaux;copies.forEach(m=>m.dispose());}};
 },[scene,actif,version]);
 return null;
}
