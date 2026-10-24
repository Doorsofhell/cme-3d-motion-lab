import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {Mesh,MeshStandardMaterial,Object3D,SkeletonHelper} from 'three';
import {CoachRig} from '../shadow-engine/rig';
import {getLibrary} from '../shadow-engine/library';
import {MotionSampler} from '../shadow-engine/motion';
import {restoreReferencePose} from './restorePose';
import {applyNeutralAppearance,applyNeutralRigMaterials,type NeutralAppearance} from './neutralAppearance';
import {CadrageSquelette} from './CadrageSquelette';

export const LAB_DISCIPLINES=['boxing','kickboxing','muaythai','mma','bjj','judo'] as const;
export type LabDiscipline=typeof LAB_DISCIPLINES[number];
export type NeutralSex='homme'|'femme';
export const NEUTRAL_ASSETS:Record<NeutralSex,string>={
 homme:'mma-kadir',
 femme:'mma-amara'
};
export type NeutralRigReport={sex:NeutralSex;discipline:LabDiscipline;motion:string;available:boolean;bones:number;duration:number};

/** Existing Mixamo-compatible, skinned human assets, stripped of the coach wardrobe.
 * Both use the SAME CoachRig / MotionSampler implementation. No changes to canonical motion code.
 * These are neutralized reference rigs, NOT new independently certified anatomical assets.
 */
export function NeutralRig({sex,discipline,motionId,playing,speed,showSkeleton,onReport,appearance,proportions,autoCadrage=false,mode='neutral'}:{
 sex:NeutralSex;discipline:LabDiscipline;motionId:string;playing:boolean;speed:number;showSkeleton:boolean;
 onReport:(r:NeutralRigReport)=>void;appearance?:NeutralAppearance;proportions?:{height:number;shoulders:number;muscle:number;waist:number};autoCadrage?:boolean;mode?:'neutral'|'appearance';
}){
 const url=import.meta.env.BASE_URL+'fighters/'+NEUTRAL_ASSETS[sex]+'/photo.glb';
 const gltf=useGLTF(url,import.meta.env.BASE_URL+'draco/');
 const scene=useMemo(()=>{
  const root=clone(gltf.scene) as Object3D;
  restoreReferencePose(root);
  // Préserver la géométrie humaine skinnée du GLB ; ne jamais la remplacer par des capsules.
  root.traverse(o=>{
   const m=o as Mesh;
   if(!m.isMesh)return;
   const mats=Array.isArray(m.material)?m.material:[m.material];
   m.material=Array.isArray(m.material)?mats.map(x=>x.clone()):mats[0].clone();
   for(const material of (Array.isArray(m.material)?m.material:[m.material])){
    const p=material as MeshStandardMaterial;
    if(!p.color)continue;
    if(m.userData.cmeHiddenSource){p.transparent=true;p.opacity=0;p.depthWrite=false;p.colorWrite=false;}
    p.roughness=.88;
    p.metalness=0;
    p.needsUpdate=true;
   }
  });
  if(mode==='neutral')applyNeutralRigMaterials(root);
  return root;
 },[gltf.scene,mode,sex]);
 useEffect(()=>{if(mode==='appearance')applyNeutralAppearance(scene,appearance);},[scene,appearance,mode]);
 useEffect(()=>{
  const height=proportions?.height??1;
  scene.scale.set(height,height,height);
  scene.traverse(object=>{
   const mesh=object as Mesh;
   if(!mesh.isMesh||!mesh.name.startsWith('CME_NEUTRAL_'))return;
   const name=mesh.name.toLowerCase();
   const volume=proportions?.muscle??1;
   const width=name.includes('spine')||name.includes('shoulder')?(proportions?.shoulders??1):name.includes('hips')?(proportions?.waist??1):volume;
   mesh.scale.set(width,1,volume);
  });
 },[scene,proportions?.height,proportions?.shoulders,proportions?.muscle,proportions?.waist]);
 const rig=useMemo(()=>new CoachRig(scene),[scene]);
 const library=useMemo(()=>getLibrary(rig,discipline),[rig,discipline]);
 const motion=library.get(motionId)??library.get('garde');
 const sampler=useMemo(()=>motion?new MotionSampler(rig,motion):null,[rig,motion]);
 const skeleton=useMemo(()=>new SkeletonHelper(scene),[scene]);
 const time=useRef(0);
 useEffect(()=>{time.current=0;},[sex,discipline,motionId]);
 useEffect(()=>{
  onReport({sex,discipline,motion:motion?.id??motionId,available:!!library.get(motionId),bones:skeleton.bones.length,duration:sampler?.duration??0});
 },[sex,discipline,motionId,motion,library,sampler,skeleton,onReport]);
 useEffect(()=>()=>{skeleton.dispose();scene.traverse(o=>{
  const m=o as Mesh;
  if(!m.isMesh)return;
  const materials=Array.isArray(m.material)?m.material:[m.material];
  materials.forEach(x=>x?.dispose());
 });},[scene,skeleton]);
 useFrame((_,delta)=>{
  if(!sampler)return;
  if(playing)time.current=(time.current+Math.min(delta,.05)*speed)%Math.max(sampler.duration,.001);
  rig.reset();
  rig.apply(sampler.sample(time.current));
  if(showSkeleton)skeleton.updateMatrixWorld(true);
 });
 return <group><primitive object={scene}/><CadrageSquelette racine={scene} actif={autoCadrage}/>{showSkeleton&&<primitive object={skeleton}/>}</group>;
}
