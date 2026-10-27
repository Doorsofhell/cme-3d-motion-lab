import {describe,it,expect} from 'vitest';
import {BoxGeometry,Group,Mesh,MeshStandardMaterial,MeshToonMaterial,Texture,Bone,Skeleton,SkinnedMesh} from 'three';
import {applyFitnessStyle,applyComicStyle} from './Fighter';

function makeCoachMaterial(name:string,textured=true){
 const map=textured?new Texture():null;
 const normalMap=new Texture(),alphaMap=new Texture();
 const mesh=new Mesh(new BoxGeometry(),new MeshStandardMaterial({
  name,map,normalMap,alphaMap,transparent:true,opacity:.85,alphaTest:.35
 }));
 mesh.name=name;
 const root=new Group();root.add(mesh);
 return {root,mesh,map,normalMap,alphaMap};
}
describe('CME-3D toon costume detail and adult comics',()=>{
 it('keeps garment texture, normal and alpha details in fitness mode',()=>{
  const {root,mesh,map,normalMap,alphaMap}=makeCoachMaterial('haut-boxe');
  applyFitnessStyle(root);
  const mat=mesh.material as unknown as MeshToonMaterial;
  expect(mat.isMeshToonMaterial).toBe(true);
  expect(mat.map).toBe(map);
  expect(mat.normalMap).toBe(normalMap);
  expect(mat.alphaMap).toBe(alphaMap);
  expect(mat.transparent).toBe(true);
  expect(mat.opacity).toBe(.85);
  expect(mat.alphaTest).toBe(.35);
 });
 it('keeps garment texture and opacity in graphic-novel mode',()=>{
  const {root,mesh,map,normalMap,alphaMap}=makeCoachMaterial('brassiere');
  applyComicStyle(root,'balanced');
  const mat=mesh.material as unknown as MeshToonMaterial;
  expect(mat.map).toBe(map);
  expect(mat.normalMap).toBe(normalMap);
  expect(mat.alphaMap).toBe(alphaMap);
  expect(mat.transparent).toBe(true);
  expect(mat.opacity).toBe(.85);
 });
 it('adds an ink shell to a fully opaque skinned fighter on balanced/mobile tier',()=>{
  const root=new Group();
  const bone=new Bone();
  const skinned=new SkinnedMesh(new BoxGeometry(),new MeshStandardMaterial({name:'body',color:'#ffffff'}));
  skinned.add(bone);
  skinned.bind(new Skeleton([bone]));
  root.add(skinned);
  const outlines=applyComicStyle(root,'balanced');
  expect(outlines).toHaveLength(1);
  expect(outlines[0]).toBeInstanceOf(SkinnedMesh);
  expect((outlines[0] as SkinnedMesh).skeleton).toBe(skinned.skeleton);
  expect(outlines[0].parent).toBe(skinned);
 });
 it('uses stronger silhouette in detail than balanced without touching source scale',()=>{
  const balanced=makeCoachMaterial('short-boxe',false);
  const detail=makeCoachMaterial('short-boxe',false);
  // The ink shell is deliberately disabled for translucent garments.
  // Make this fixture opaque so the test exercises silhouette thickness.
  for(const {mesh} of [balanced,detail]){
   mesh.material.transparent=false;
   mesh.material.opacity=1;
  }
  const b=applyComicStyle(balanced.root,'balanced');
  const d=applyComicStyle(detail.root,'detail');
  expect(b).toHaveLength(1);
  expect(d).toHaveLength(1);
  expect(d[0].scale.x).toBeGreaterThan(b[0].scale.x);
  expect(balanced.mesh.scale.x).toBe(1);
  expect(detail.mesh.scale.x).toBe(1);
 });
 it('does not add an opaque ink shell over translucent garments',()=>{
  const {root}=makeCoachMaterial('brassiere');
  expect(applyComicStyle(root,'detail')).toHaveLength(0);
 });
 it('skips the extra ink draw call in performance tier',()=>{
  const {root}=makeCoachMaterial('haut-boxe',false);
  expect(applyComicStyle(root,'performance')).toHaveLength(0);
 });
 it('uses a distinct three-band ink gradient for adult comics',()=>{
  const comic=makeCoachMaterial('haut-boxe');
  const fitness=makeCoachMaterial('haut-boxe');
  applyComicStyle(comic.root,'balanced');
  applyFitnessStyle(fitness.root);
  const c=comic.mesh.material as unknown as MeshToonMaterial;
  const f=fitness.mesh.material as unknown as MeshToonMaterial;
  expect((c.gradientMap?.image as {width:number}).width).toBe(3);
  expect((f.gradientMap?.image as {width:number}).width).toBe(6);
  expect(c.color.getHexString()).not.toBe(f.color.getHexString());
 });
 it('preserves facial textures and flat palette for untextured costumes',()=>{
  const face=makeCoachMaterial('f021_head');
  applyFitnessStyle(face.root);
  expect((face.mesh.material as unknown as MeshToonMaterial).map).toBe(face.map);
  const plain=makeCoachMaterial('short-boxe',false);
  applyComicStyle(plain.root,'balanced');
  expect((plain.mesh.material as unknown as MeshToonMaterial).map).toBeNull();
  expect((plain.mesh.material as unknown as MeshToonMaterial).gradientMap).not.toBeNull();
 });
});
