import {describe,it,expect} from 'vitest';
import {BoxGeometry,Group,Mesh,MeshStandardMaterial,MeshToonMaterial,Texture} from 'three';
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
 it('uses a distinct three-band ink gradient for adult comics',()=>{
  const comic=makeCoachMaterial('haut-boxe');
  const fitness=makeCoachMaterial('haut-boxe');
  applyComicStyle(comic.root,'balanced');
  applyFitnessStyle(fitness.root);
  const c=comic.mesh.material as MeshToonMaterial;
  const f=fitness.mesh.material as MeshToonMaterial;
  expect(c.gradientMap?.image.width).toBe(3);
  expect(f.gradientMap?.image.width).toBe(6);
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
