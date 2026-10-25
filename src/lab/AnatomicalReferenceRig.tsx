import {useEffect,useMemo} from 'react';
import {useGLTF} from '@react-three/drei';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {Mesh,MeshStandardMaterial,Object3D} from 'three';
import {CadrageSquelette} from './CadrageSquelette';
import type {NeutralSex} from './NeutralRig';
import type {StudioFocusZone} from './studioFocus';
import type {AnatomicalView} from './AnatomicalReference';

/** True MakeHuman/MPFB CC0 bodies: read-only anatomy, not CoachRig animation rigs. */
export const REFERENCE_ANATOMY_ASSETS:Record<NeutralSex,string>={
 homme:'anatomie/homme.glb',femme:'anatomie/femme.glb'
};
export function AnatomicalReferenceRig({sex,orientation,focusZone='corps',focusRequest=0,autoCadrage=true}:{
 sex:NeutralSex;orientation?:AnatomicalView|null;
 focusZone?:StudioFocusZone;focusRequest?:number;autoCadrage?:boolean
}){
 const gltf=useGLTF(import.meta.env.BASE_URL+REFERENCE_ANATOMY_ASSETS[sex]);
 const root=useMemo(()=>{
  const scene=clone(gltf.scene) as Object3D;scene.name='CME_ANATOMY_CC0_'+sex;
  scene.traverse(o=>{
   const mesh=o as Mesh;if(!mesh.isMesh)return;
   const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
   const cloned=materials.map(m=>{
    const material=m.clone();
    if(material instanceof MeshStandardMaterial){
     material.color.set('#aab2c0');material.map=null;material.emissiveMap=null;
     material.roughness=.51;material.metalness=.26;material.needsUpdate=true;
    }
    return material;
   });
   mesh.material=Array.isArray(mesh.material)?cloned:cloned[0];
  });
  return scene;
 },[gltf.scene,sex]);
 useEffect(()=>()=>root.traverse(o=>{
  const mesh=o as Mesh;if(!mesh.isMesh)return;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  materials.forEach(m=>m?.dispose());
 }),[root]);
 return <group name="CME_AnatomicalReference_CC0">
  <primitive object={root}/>
  <CadrageSquelette racine={root} actif={autoCadrage} zone={focusZone} refocus={focusRequest} orientation={orientation}/>
 </group>;
}
