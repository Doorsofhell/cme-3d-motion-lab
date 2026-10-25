import {useEffect,useLayoutEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {Mesh,MeshStandardMaterial,Object3D,SkeletonHelper} from 'three';
import {CoachRig} from '../shadow-engine/rig';
import {getLibrary} from '../shadow-engine/library';
import {MotionSampler} from '../shadow-engine/motion';
import {SequenceSampler} from './ComplexSequences';
import {studioTechniqueCatalog,studioMotionOptions} from './studioTechniqueCatalog';
import {restoreReferencePose} from './restorePose';
import {applyNeutralAppearance,applyNeutralRigMaterials,prepareEditableNeutralBody,inspectCoachMaterialZones,type NeutralAppearance} from './neutralAppearance';
import {applyCoachLookGeometry,inspectCoachShapes,type CoachFaceShape,type CoachBodyShape} from './coachGeometry';
import {CadrageSquelette} from './CadrageSquelette';
import type {StudioFocusZone} from './studioFocus';
import {attachOutfit} from '../adapters/outfits';

export const LAB_DISCIPLINES=['boxing','kickboxing','muaythai','mma','bjj','judo'] as const;
export type LabDiscipline=typeof LAB_DISCIPLINES[number];
export type NeutralSex='homme'|'femme';
export const NEUTRAL_ASSETS:Record<NeutralSex,string>={
 homme:'mma-kadir',
 femme:'mma-amara'
};
export type NeutralRigReport={sex:NeutralSex;discipline:LabDiscipline;motion:string;available:boolean;bones:number;duration:number;
 motions:Array<{id:string;label:string;kind:'technique'|'sequence';supported:boolean}>;
 appearanceSupport:{colors:ReturnType<typeof inspectCoachMaterialZones>;shape:ReturnType<typeof inspectCoachShapes>};
};

/** Existing Mixamo-compatible, skinned human assets, stripped of the coach wardrobe.
 * Both use the SAME CoachRig / MotionSampler implementation. No changes to canonical motion code.
 * These are neutralized reference rigs, NOT new independently certified anatomical assets.
 */
type NeutralRigProps={
 sex:NeutralSex;discipline:LabDiscipline;motionId:string;playing:boolean;speed:number;showSkeleton:boolean;
 onReport:(r:NeutralRigReport)=>void;creationPose?:boolean;noGi?:boolean;appearance?:NeutralAppearance;proportions?:CoachBodyShape & {height:number};face?:CoachFaceShape;autoCadrage?:boolean;focusZone?:StudioFocusZone;focusRequest?:number;mode?:'neutral'|'appearance'|'creator';
};
/** Appearance uses a genuine, already-shipped outfit GLB.
 * Neutral anatomy does not fetch or display an outfit.
 */
export function NeutralRig(props:NeutralRigProps){
 return props.mode==='appearance'?<OutfittedRig {...props}/>:<RigBody {...props}/>;
}
function OutfittedRig(props:NeutralRigProps){
 const costume=props.discipline==='boxing'?'boxe':props.discipline==='bjj'&&props.noGi?'bjj-nogi':props.discipline;
 const url=import.meta.env.BASE_URL+'fighters/'+NEUTRAL_ASSETS[props.sex]+'/tenues/'+costume+'.glb';
 const {scene}=useGLTF(url,import.meta.env.BASE_URL+'draco/');
 return <RigBody {...props} outfitScene={scene}/>;
}
function RigBody({sex,discipline,motionId,playing,speed,showSkeleton,onReport,creationPose=false,appearance,proportions,face,autoCadrage=false,focusZone,focusRequest=0,mode='neutral',outfitScene}:NeutralRigProps & {outfitScene?:Object3D}){
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
  if(mode==='appearance'&&outfitScene)attachOutfit(root,outfitScene,true);
  if(mode==='neutral')applyNeutralRigMaterials(root);
  if(mode==='creator')prepareEditableNeutralBody(root);
  return root;
 },[gltf.scene,mode,sex,outfitScene]);
 const appearanceSupport=useMemo(()=>({
  colors:inspectCoachMaterialZones(scene),shape:inspectCoachShapes(scene)
 }),[scene]);
 useLayoutEffect(()=>{if(mode==='appearance'||mode==='creator')applyNeutralAppearance(scene,appearance);},[scene,appearance,mode]);
 useLayoutEffect(()=>{
  if(mode==='appearance'||mode==='creator'){
   applyCoachLookGeometry(scene,{
    height:proportions?.height??1,
    shoulders:proportions?.shoulders??1,
    muscle:proportions?.muscle??1,
    waist:proportions?.waist??1,
    sex:proportions?.sex,
    roundness:proportions?.roundness??1,
    hips:proportions?.hips??1,
    thighs:proportions?.thighs??1,
    bust:proportions?.bust??1,
    jaw:face?.jaw??1,
    nose:face?.nose??1,
    eyes:face?.eyes??1
   });
  }else{
   // Anatomie reste rigoureusement neutre, y compris après changement de profil.
   scene.scale.setScalar(1);
  }
 },[scene,mode,proportions?.height,proportions?.shoulders,proportions?.muscle,proportions?.waist,proportions?.sex,proportions?.roundness,proportions?.hips,proportions?.thighs,proportions?.bust,face?.jaw,face?.nose,face?.eyes]);
 const rig=useMemo(()=>new CoachRig(scene),[scene]);
 const library=useMemo(()=>getLibrary(rig,discipline),[rig,discipline]);
 const motionEntries=useMemo(()=>studioMotionOptions(studioTechniqueCatalog(discipline),id=>library.has(id)),[discipline,library]);
 const selected=motionEntries.find(entry=>entry.id===motionId&&entry.supported);
 const isSequence=selected?.kind==='sequence';
 const motion=!isSequence?(library.get(selected?.id??'garde')??library.get('garde')):null;
 const sampler=useMemo(()=>{
  if(isSequence&&selected)return new SequenceSampler(rig,library,selected.motions);
  return motion?new MotionSampler(rig,motion):null;
 },[rig,library,motion,isSequence,selected?.id]);
 const playable=!!selected&&(isSequence?!!sampler:!!library.get(motionId));
 const skeleton=useMemo(()=>new SkeletonHelper(scene),[scene]);
 const time=useRef(0);
 useEffect(()=>{time.current=0;},[sex,discipline,motionId]);
 useEffect(()=>{
  onReport({sex,discipline,motion:selected?.id??motion?.id??'garde',available:playable,bones:skeleton.bones.length,duration:sampler?.duration??0,appearanceSupport,motions:motionEntries});
 },[sex,discipline,motionId,motion,library,sampler,skeleton,onReport,appearanceSupport,motionEntries,selected?.id,playable]);
 useEffect(()=>()=>{skeleton.dispose();scene.traverse(o=>{
  const m=o as Mesh;
  if(!m.isMesh)return;
  const materials=Array.isArray(m.material)?m.material:[m.material];
  materials.forEach(x=>x?.dispose());
  if(m.geometry?.userData?.cmeOwned)m.geometry.dispose();
 });},[scene,skeleton]);
 useFrame((_,delta)=>{
  if(!sampler)return;
  if(playing)time.current=(time.current+Math.min(delta,.05)*speed)%Math.max(sampler.duration,.001);
  rig.reset();
  if(!creationPose)rig.apply(sampler.sample(time.current));
  if(showSkeleton)skeleton.updateMatrixWorld(true);
 });
 return <group><primitive object={scene}/><CadrageSquelette racine={scene} actif={autoCadrage} zone={focusZone} refocus={focusRequest}/>{showSkeleton&&<primitive object={skeleton}/>}</group>;
}
