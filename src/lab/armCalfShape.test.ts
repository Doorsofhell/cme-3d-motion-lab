import {Bone,BoxGeometry,BufferAttribute,Group,MeshStandardMaterial,Skeleton,SkinnedMesh} from 'three';
import {describe,it,expect} from 'vitest';
import {applyCoachBodyShape,inspectCoachShapes} from './coachGeometry';
function limbs(){
 const geo=new BoxGeometry(.3,1,.3,4,8,4),pos=geo.getAttribute('position');
 const idx=new Uint16Array(pos.count*4),weight=new Float32Array(pos.count*4);
 for(let i=0;i<pos.count;i++){idx[i*4]=pos.getY(i)>0?0:1;weight[i*4]=1;}
 geo.setAttribute('skinIndex',new BufferAttribute(idx,4));geo.setAttribute('skinWeight',new BufferAttribute(weight,4));
 const arm=new Bone();arm.name='mixamorigLeftArm';
 const calf=new Bone();calf.name='mixamorigLeftLeg';
 const mesh=new SkinnedMesh(geo,new MeshStandardMaterial());mesh.name='limbs';
 mesh.bind(new Skeleton([arm,calf]));
 const root=new Group();root.add(mesh);
 return {geo,mesh,root,bones:[arm,calf]};
}
describe('0.7.45 : bras et mollets indépendants',()=>{
 it('détecte les deux zones réellement pondérées',()=>{
  const {root}=limbs(),caps=inspectCoachShapes(root);
  expect(caps.armVertices).toBeGreaterThan(0);
  expect(caps.calfVertices).toBeGreaterThan(0);
 });
 it('déforme les vertices skinnés des bras et mollets, jamais os et poids',()=>{
  const {geo,mesh,root,bones}=limbs(),pos=Array.from(geo.getAttribute('position').array);
  const before=bones.map(x=>x.position.clone()),weights=Array.from(geo.getAttribute('skinWeight').array);
  applyCoachBodyShape(root,{shoulders:1,muscle:1,waist:1,arms:1.3,calves:.8});
  expect(Array.from(mesh.geometry.getAttribute('position').array)).not.toEqual(pos);
  expect(Array.from(geo.getAttribute('position').array)).toEqual(pos);
  expect(Array.from(mesh.geometry.getAttribute('skinWeight').array)).toEqual(weights);
  expect(bones.every((b,i)=>b.position.equals(before[i]))).toBe(true);
  applyCoachBodyShape(root,{shoulders:1,muscle:1,waist:1,arms:1,calves:1});
  expect(Array.from(mesh.geometry.getAttribute('position').array)).toEqual(pos);
 });
});
