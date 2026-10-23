import {useEffect,useMemo,useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {SkeletonHelper, type Material, type Mesh, type Object3D} from 'three';
import {ThreeRigAdapter,type RigReport} from '../adapters/threeRig';
import {attachOutfit,enhanceHumanMaterial} from '../adapters/outfits';
import {sampleHook,type Technique} from '../core/motion';
import {correctMotionLive,ANALYTIC_NEURAL_MODEL} from '../core/neural';
import type {Playback} from './App';
export function Fighter({actor,outfit,technique,playback,skeleton,onReport,onReady,lowCost}:{
 actor:'mma-kadir'|'mma-amara';outfit:string;technique:Technique;playback:RefObject<Playback>;skeleton:boolean;onReport:(r:RigReport)=>void;onReady:()=>void;lowCost:boolean;
}){
 const base=import.meta.env.BASE_URL;
 const gltf=useGLTF(base+'fighters/'+actor+'/photo.glb',base+'draco/');
 const clothes=useGLTF(base+'fighters/'+actor+'/tenues/'+outfit+'.glb',base+'draco/');
 const scene=useMemo(()=>{const s=clone(gltf.scene) as Object3D;enhanceHumanMaterial(s,lowCost);attachOutfit(s,clothes.scene,lowCost);return s;},[gltf.scene,clothes.scene,lowCost]);
 const adapter=useMemo(()=>new ThreeRigAdapter(scene),[scene]);
 const helper=useMemo(()=>new SkeletonHelper(scene),[scene]);
 const elapsed=useRef(0);
 const lastSample=useRef<number|null>(null);
 useEffect(()=>{onReport(adapter.describe());onReady();},[adapter,onReport,onReady]);
 useEffect(()=>()=>{helper.dispose();scene.traverse(object=>{const mesh=object as Mesh;
  if(mesh.isMesh){const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];materials.forEach((m:Material)=>m?.dispose());
    if(mesh.geometry?.userData?.cmeOwned)mesh.geometry.dispose();
  }
 });},[scene,helper]);
 useFrame((_,dt)=>{
  if(playback.current.playing){playback.current.progress=(playback.current.progress+Math.min(dt,.05)*playback.current.speed/.85)%1;}
  if(!playback.current.playing && lastSample.current===playback.current.progress) return;
  lastSample.current=playback.current.progress;
  const raw=sampleHook(technique,playback.current.progress);
  const corrected=correctMotionLive(ANALYTIC_NEURAL_MODEL,raw);
  const report=adapter.apply(corrected);
  elapsed.current+=dt;
  if(elapsed.current>.75){onReport(report);elapsed.current=0;}
  if(skeleton)helper.updateMatrixWorld(true);
 });
 return <group><primitive object={scene}/>{skeleton&&<primitive object={helper}/>}</group>;
}
