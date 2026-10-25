import {describe,it,expect} from 'vitest';
import {BoxGeometry,Group,Mesh,MeshStandardMaterial,MeshToonMaterial,Texture,Bone,Skeleton,SkinnedMesh,Color} from 'three';
import {applyNeutralAppearance} from './neutralAppearance';
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
  expect(c.color.getHexString()).toBe(f.color.getHexString()); // Uniformité textile, seule l'ombre change.
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


describe('0.7.51 : aucune tenue héroïque, mêmes habits pour les six disciplines et tous les rendus',()=>{
 const sports=['haut-boxe','rash-kickboxing','brassiere-muaythai','short-mma','kimono-bjj','veste-judo'];
 for(const nom of sports){
  it('préserve les couleurs, les textures et les propriétés du vêtement '+nom,()=>{
   for(const style of ['fitness','comic'] as const){
    const map=new Texture(),normalMap=new Texture(),alphaMap=new Texture();
    const mat=new MeshStandardMaterial({name:nom,color:'#217ad1',map,normalMap,alphaMap,opacity:.82,transparent:true,alphaTest:.15});
    const origine=mat.color.clone();
    const mesh=new Mesh(new BoxGeometry(),mat),root=new Group();
    root.add(mesh);
    if(style==='fitness')applyFitnessStyle(root);
    else applyComicStyle(root,'performance');
    const stylise=mesh.material as MeshToonMaterial;
    expect(stylise.color.getHexString()).toBe(origine.getHexString());
    expect(stylise.map).toBe(map);
    expect(stylise.normalMap).toBe(normalMap);
    expect(stylise.alphaMap).toBe(alphaMap);
    expect(stylise.opacity).toBe(.82);
    expect(stylise.transparent).toBe(true);
    expect(stylise.alphaTest).toBe(.15);
    expect(mesh.geometry.attributes.position).toBeDefined();
   }
  });
 }
 it('permet la même personnalisation chromatique des vêtements dans chaque rendu animé',()=>{
  for(const style of ['ultra','fitness','comic'] as const){
   const material=new MeshStandardMaterial({name:'haut-boxe',color:'#eeeeee'}),mesh=new Mesh(new BoxGeometry(),material),root=new Group();
   root.add(mesh);
   if(style==='fitness')applyFitnessStyle(root);
   if(style==='comic')applyComicStyle(root,'performance');
   expect(applyNeutralAppearance(root,{
    skin:'#b18f70',hairColor:'#201713',topColor:'#26aacc',bottomColor:'#b21a34',gloveColor:'#7e1c29'
   })).toBe(1);
   expect((mesh.material as MeshStandardMaterial).color.getHexString()).toBe(new Color('#26aacc').getHexString());
  }
 });
 it('ne modifie jamais les os, les poids de skinning ou le maillage canonique',()=>{
  for(const style of ['fitness','comic'] as const){
   const root=new Group(),bone=new Bone(),geometry=new BoxGeometry();
   const mesh=new SkinnedMesh(geometry,new MeshStandardMaterial({name:'haut-boxe',color:'#334455'}));
   mesh.add(bone);
   mesh.bind(new Skeleton([bone]));
   root.add(mesh);
   const bones=mesh.skeleton.bones,bind=mesh.bindMatrix.clone(),position=geometry.getAttribute('position');
   if(style==='fitness')applyFitnessStyle(root);else applyComicStyle(root,'balanced');
   expect(mesh.skeleton.bones).toBe(bones);
   expect(mesh.bindMatrix.equals(bind)).toBe(true);
   expect(mesh.geometry).toBe(geometry);
   expect(mesh.geometry.getAttribute('position')).toBe(position);
   expect(mesh.children.some(child=>child.type==='Bone')).toBe(true);
  }
 });
 it('charge les mêmes GLB sportifs et les mêmes motions, indépendamment du style',async()=>{
  const {readFileSync}=await import('node:fs');
  const source=readFileSync(new URL('./Fighter.tsx',import.meta.url),'utf8');
  expect(source).toContain("clothes=useGLTF(base+'fighters/'+sourceActor+'/tenues/'+outfit+'.glb'");
  expect(source).toContain("if(renderStyle==='fitness')applyFitnessStyle(s)");
  expect(source).toContain("if(renderStyle==='comic')applyComicStyle(s,quality)");
  expect(source.indexOf('applyNeutralAppearance(s,')).toBeGreaterThan(source.indexOf("if(renderStyle==='comic')"));
  expect(source).toContain('new MotionSampler(rig,motion)');
  expect(source).toContain('new SequenceSampler(rig,library,seq.motions)');
  expect(source).toContain('new CoachPlanSampler(rig,library,coachPlan)');
  expect(source).not.toContain('-hero-ink');
  const app=readFileSync(new URL('./App.tsx',import.meta.url),'utf8');
  expect(app).toContain('Comics · mêmes tenues');
  expect(app).not.toContain('Héros comics');
 });
});
