import {useEffect,useMemo,useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {SkeletonHelper,type Mesh,type Object3D,MeshStandardMaterial,MeshToonMaterial,DoubleSide,DataTexture,RedFormat,UnsignedByteType,NearestFilter,Color,BackSide} from 'three';
import {CoachRig} from '../shadow-engine/rig';
import {getLibrary} from '../shadow-engine/library';
import {MotionSampler} from '../shadow-engine/motion';
import {SequenceSampler} from './ComplexSequences';
import rawSequences from './complexSequences.json';
import {restoreReferencePose} from './restorePose';
import type {Playback,Quality,RenderStyle,RigReport} from './App';
import {attachOutfit,enhanceHumanMaterial} from '../adapters/outfits';
/** Original fitness-coaching aesthetic: simplified materials, not BetterMe assets. */
// Six restrained tonal steps help reveal contours without flat shading.
const fitnessGradient=new DataTexture(new Uint8Array([65,102,145,186,223,251]),6,1,RedFormat,UnsignedByteType);
fitnessGradient.magFilter=NearestFilter;
fitnessGradient.minFilter=NearestFilter;
fitnessGradient.needsUpdate=true;
function applyFitnessStyle(root:Object3D){
 root.traverse(o=>{
  const mesh=o as Mesh;
  if(!mesh.isMesh)return;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  const styled=materials.map(base=>{
   const old=base as MeshStandardMaterial;
   const name=(old.name+' '+mesh.name).toLowerCase();
   // Keep photographs only for the exposed face and skin: preserving identity.
   const skin=name.includes('f021_')||name.includes('m018_')||name.includes('body')||name.includes('head');
   const isGlove=name.includes('gant')||name.includes('cuir-gant');
   const outfitTop=name.includes('haut-')||name.includes('brassiere');
   const shorts=name.includes('short-')||name.includes('ceinture-');
   const shoes=name.includes('chaussure');
   const trim=name.includes('liseré-');
   const palette=trim?'#d6b180':shoes?'#f1f4f4':isGlove?'#24495e':outfitTop?'#393e51':shorts?'#25485c':'#f3f4f3';
   const material=new MeshToonMaterial({
    name:old.name+'-fitness',
    color:new Color(palette),
    map:skin?(old.map??null):null,
    gradientMap:fitnessGradient,
    normalMap:old.normalMap??null,
    normalScale:old.normalScale?.clone(),
    vertexColors:old.vertexColors,
    side:outfitTop?DoubleSide:old.side,
    transparent:old.transparent,
    opacity:old.opacity,
    alphaTest:old.alphaTest
   });
   // Recreate the shirt/short colours independently from the photographic material.
   if(!skin && !isGlove && !outfitTop && !shorts && !shoes && !trim)material.map=old.map??null;
   old.dispose();
   return material;
  });
  mesh.material=Array.isArray(mesh.material)?styled:styled[0];
 });
}
/** Original comic-book hero aesthetic: sculpted light, textured skin and restrained ink silhouettes. */
const comicGradient=new DataTexture(new Uint8Array([24,48,83,127,178,223,251]),7,1,RedFormat,UnsignedByteType);
comicGradient.magFilter=NearestFilter;
comicGradient.minFilter=NearestFilter;
comicGradient.needsUpdate=true;
function applyComicStyle(root:Object3D,quality:Quality){
 const outlines:Object3D[]=[];
 root.traverse(o=>{
  const mesh=o as Mesh;
  if(!mesh.isMesh||mesh.userData.cmeComicOutline)return;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  const styled=materials.map(base=>{
   const old=base as MeshStandardMaterial;
   const name=(old.name+' '+mesh.name).toLowerCase();
   const skin=/f021_|m018_|body|head|peau|visage/.test(name);
   const gloves=/gant|cuir-gant/.test(name);
   const top=/haut-|brassiere/.test(name);
   const shorts=/short-|ceinture-/.test(name);
   const shoes=/chaussure/.test(name);
   const trim=/liseré-/.test(name);
   const color=skin?'#ffffff':gloves?'#b72e42':top?'#263e68':shorts?'#192d4c':shoes?'#d9e3ee':trim?'#efc26c':'#b9c6d5';
   const material=new MeshToonMaterial({
    name:old.name+'-hero-ink',color:new Color(color),
    // Keep actual skin pigmentation, facial detail and anatomical normal maps.
    map:skin?(old.map??null):null,
    gradientMap:comicGradient,normalMap:old.normalMap??null,
    normalScale:old.normalScale?.clone(),vertexColors:old.vertexColors,
    side:top?DoubleSide:old.side,transparent:old.transparent,
    opacity:old.opacity,alphaTest:old.alphaTest
   });
   old.dispose();
   return material;
  });
  mesh.material=Array.isArray(mesh.material)?styled:styled[0];
  // Lightweight ink silhouette on desktop/detail mode; avoid doubled skinned
  // geometry and extra draw calls on mobile or low-performance devices.
  if(quality==='detail'&&!('isSkinnedMesh' in mesh && mesh.isSkinnedMesh)){
   const outline=mesh.clone(false) as Mesh;
   outline.name=mesh.name+'-ink-contour';
   outline.material=new MeshToonMaterial({color:'#101725',side:BackSide});
   outline.scale.multiplyScalar(1.012);
   outline.userData.cmeComicOutline=true;
   outlines.push(outline);
   mesh.add(outline);
  }
 });
 return outlines;
}
export function Fighter({actor,outfit,technique,playback,skeleton,quality,renderStyle,onReport,onReady}:{
 actor:'mma-kadir'|'mma-amara'|'mma-naira';outfit:string;technique:string;playback:RefObject<Playback>;skeleton:boolean;
 quality:Quality;renderStyle:RenderStyle;onReport:(r:RigReport)=>void;onReady:()=>void;
}){
 const base=import.meta.env.BASE_URL;
 // The original v0.31 Shadow coach rig + motion library is used unmodified.
 const sourceActor=actor==='mma-naira'?'mma-amara':actor;
 const url=base+'fighters/'+sourceActor+'/photo.glb';
 const gltf=useGLTF(url,base+'draco/');
 const clothes=useGLTF(base+'fighters/'+sourceActor+'/tenues/'+outfit+'.glb',base+'draco/');
 const scene=useMemo(()=>{
  const s=clone(gltf.scene) as Object3D;
  restoreReferencePose(s);
  if(actor==='mma-naira'){
   // Non-destructive skinned clone preview. Original Amara GLB remains untouched.
   s.traverse(o=>{
    const m=o as Mesh;
    if(!m.isMesh)return;
    const mats=Array.isArray(m.material)?m.material:[m.material];
    m.material=Array.isArray(m.material)?mats.map(x=>x.clone()):mats[0].clone();
    const next=Array.isArray(m.material)?m.material:[m.material];
    for(const mat of next){
     const standard=mat as MeshStandardMaterial;
     if(standard.color){
      const name=(standard.name+' '+m.name).toLowerCase();
      if(/hair|cheveu/.test(name))standard.color.set('#30212b');
      else if(/skin|peau|body|head|f021_/.test(name))standard.color.multiplyScalar(.93);
     }
    }
   });
  }
  enhanceHumanMaterial(s,quality==='performance');
  attachOutfit(s,clothes.scene,quality==='performance');
  if(renderStyle==='fitness')applyFitnessStyle(s);
  if(renderStyle==='comic')applyComicStyle(s,quality);
  return s;
 },[gltf.scene,clothes.scene,renderStyle,quality,actor]);
 const rig=useMemo(()=>new CoachRig(scene),[scene]);
 const library=useMemo(()=>getLibrary(rig,(outfit==='boxe'?'boxing':outfit.startsWith('bjj')?'bjj':outfit) as 'boxing'|'kickboxing'|'mma'|'muaythai'|'bjj'|'judo'),[rig,outfit]);
 const seq=(rawSequences as Array<{id:string;name:string;discipline:string;motions:string[]}>).find(s=>s.id===technique);
 const motion=library.get(technique)??library.get('garde');
 const seqValid=!!seq&&seq.motions.every(id=>library.has(id));
 const sampler=useMemo(()=>{
  if(seq&&seqValid)return new SequenceSampler(rig,library,seq.motions);
  return motion?new MotionSampler(rig,motion):null;
 },[rig,motion,library,seq,seqValid]);
 const helper=useMemo(()=>new SkeletonHelper(scene),[scene]);
 const lastSample=useRef<number|null>(null);
 const t=useRef(0);
 useEffect(()=>{lastSample.current=null;},[technique,outfit]);
 useEffect(()=>{
  onReport({bones:helper.bones.length,armClamps:0,footErrorMetres:0,techniqueFound:seq?seqValid:!!library.get(technique),source:seq?'CME-3D · enchaînement expérimental':'CME-3D · bibliothèque de mouvements'});
  onReady();
 },[helper,library,technique,onReport,onReady]);
 useEffect(()=>()=>{helper.dispose();scene.traverse(o=>{
  const m=o as Mesh;
  if(!m.isMesh)return;
  const mats=Array.isArray(m.material)?m.material:[m.material];
  mats.forEach(material=>material?.dispose());
  if(m.geometry?.userData?.cmeOwned)m.geometry.dispose();
 });},[scene,helper]);
 useFrame((_,dt)=>{
  if(!sampler)return;
  if(playback.current.playing){
   playback.current.progress=(playback.current.progress+Math.min(dt,.05)*playback.current.speed/Math.max(.2,sampler.duration))%1;
  }
  const p=playback.current.progress;
  if(!playback.current.playing && lastSample.current===p)return;
  lastSample.current=p;
  rig.reset();
  rig.apply(sampler.sample(p*sampler.duration));
  if(skeleton)helper.updateMatrixWorld(true);
  t.current+=dt;
  if(t.current>.9){
   onReport({bones:helper.bones.length,armClamps:0,footErrorMetres:0,techniqueFound:seq?seqValid:!!library.get(technique),source:seq?'CME-3D · enchaînement expérimental':'CME-3D · bibliothèque de mouvements'});
   t.current=0;
  }
 });
 return <group><primitive object={scene}/>{skeleton&&<primitive object={helper}/>}</group>;
}
