import {BoxGeometry,Bone,BufferAttribute,Group,MeshStandardMaterial,Skeleton,SkinnedMesh} from 'three';
import {describe,it,expect} from 'vitest';
import {applyCoachFaceGeometry,countEditableHeadVertices} from './coachFaceGeometry';
function head(){
 const root=new Group(),geometry=new BoxGeometry(.2,.29,.18,7,9,7),pos=geometry.getAttribute('position');
 const joints=new Uint16Array(pos.count*4),weights=new Float32Array(pos.count*4);
 for(let i=0;i<pos.count;i++)weights[i*4]=1;
 geometry.setAttribute('skinIndex',new BufferAttribute(joints,4));
 geometry.setAttribute('skinWeight',new BufferAttribute(weights,4));
 const bone=new Bone();bone.name='mixamorigHead';
 const mesh=new SkinnedMesh(geometry,new MeshStandardMaterial());
 mesh.name='f021_head';mesh.bind(new Skeleton([bone]));root.add(mesh);
 return {root,geometry,mesh,bone};
}
describe('0.7.45 : forme du vrai visage skinné sans morph cible',()=>{
 it('détecte les sommets réellement éditables du crâne',()=>{
  const x=head();
  expect(countEditableHeadVertices(x.root)).toBeGreaterThan(0);
 });
 it('déforme mâchoire, nez et zone des yeux, sans détruire la géométrie ni le rig',()=>{
  const x=head(),original=Array.from(x.geometry.getAttribute('position').array);
  const bones=x.bone.position.clone(),skin=Array.from(x.geometry.getAttribute('skinWeight').array);
  const touched=applyCoachFaceGeometry(x.root,{jaw:1.15,nose:1.18,eyes:1.17});
  expect(touched).toBeGreaterThan(0);
  expect(x.mesh.geometry).not.toBe(x.geometry);
  expect(Array.from(x.mesh.geometry.getAttribute('position').array)).not.toEqual(original);
  expect(Array.from(x.geometry.getAttribute('position').array)).toEqual(original);
  expect(Array.from(x.mesh.geometry.getAttribute('skinWeight').array)).toEqual(skin);
  expect(x.bone.position.equals(bones)).toBe(true);
  const first=Array.from(x.mesh.geometry.getAttribute('position').array);
  applyCoachFaceGeometry(x.root,{jaw:1.15,nose:1.18,eyes:1.17});
  expect(Array.from(x.mesh.geometry.getAttribute('position').array)).toEqual(first);
  applyCoachFaceGeometry(x.root,{jaw:1,nose:1,eyes:1});
  expect(Array.from(x.mesh.geometry.getAttribute('position').array)).toEqual(original);
 });
});
