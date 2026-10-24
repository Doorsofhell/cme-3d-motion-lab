import {describe,expect,it} from 'vitest';
import {Bone,Mesh,Object3D,MeshStandardMaterial} from 'three';
import {buildNeutralHumanoid,CANONICAL_SEGMENTS} from './canonicalNeutralBody';
import {LAB_DISCIPLINES,NEUTRAL_ASSETS} from './NeutralRig';
import {getLibrary} from '../shadow-engine/library';
import {CoachRig} from '../shadow-engine/rig';
import {MotionSampler} from '../shadow-engine/motion';

function skeleton(){
 const root=new Object3D();
 const names=new Set<string>(CANONICAL_SEGMENTS.flatMap(pair=>[pair[0],pair[1]]));
 const bones=new Map<string,Bone>();
 for(const name of names){const b=new Bone();b.name='mixamorig'+name;bones.set(name,b);root.add(b);}
 for(const [from,to] of CANONICAL_SEGMENTS){
  const a=bones.get(from)!,b=bones.get(to)!;
  if(b.parent===root){a.add(b);b.position.set(0,from.includes('Leg')?-.3:.2,0);}
 }
 root.updateMatrixWorld(true);
 return root;
}
describe('canonical neutral humanoid proxy',()=>{
 it.each(['homme','femme'] as const)('builds untextured bone-attached geometry for %s',sex=>{
  const root=skeleton();
  const result=buildNeutralHumanoid(root,sex);
  expect(result.missing).toEqual([]);
  expect(result.segments).toBeGreaterThan(10);
  let count=0;
  root.traverse(o=>{
   const m=o as Mesh;
   if(!m.isMesh||!m.name.startsWith('CME_NEUTRAL_'))return;
   count++;
   expect((m.material as {map?:unknown}).map).toBeFalsy();
   expect((m.parent as Bone).isBone).toBe(true);
  });
  expect(count).toBeGreaterThan(10);
  root.traverse(o=>{const m=o as Mesh;if(m.isMesh&&m.name.startsWith('CME_NEUTRAL_')){expect(m.visible).toBe(true);expect(m.frustumCulled).toBe(false);}});
 });
 it('keeps one canonical motion engine across both source rigs and six disciplines',()=>{
  expect(Object.keys(NEUTRAL_ASSETS)).toHaveLength(2);
  expect(LAB_DISCIPLINES).toHaveLength(6);
  expect(typeof CoachRig).toBe('function');
  expect(typeof MotionSampler).toBe('function');
  expect(typeof getLibrary).toBe('function');
 });
});

describe('neutral rendering regression guards',()=>{
 it.each(['homme','femme'] as const)('keeps generated study surfaces visible for %s',sex=>{
  const root=skeleton();buildNeutralHumanoid(root,sex);
  const meshes:Mesh[]=[];root.traverse(o=>{const m=o as Mesh;if(m.isMesh&&m.name.startsWith('CME_NEUTRAL_'))meshes.push(m);});
  expect(meshes.length).toBeGreaterThan(12);
  for(const m of meshes){expect(m.visible).toBe(true);expect(m.frustumCulled).toBe(false);expect((m.material as MeshStandardMaterial).color.getHexString()).toBe('a7abb2');}
 });
 it('does not hide the canonical bones when an ancestor source mesh is transparent',()=>{
  const root=skeleton();const result=buildNeutralHumanoid(root,'homme');
  expect(result.segments).toBeGreaterThan(12);
  const sample=root.getObjectByName('CME_NEUTRAL_LeftArm_LeftForeArm');
  expect(sample).toBeTruthy();
  expect(sample?.parent?.type).toBe('Bone');
 });
});
