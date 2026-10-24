import {describe,it,expect} from 'vitest';
import {Bone,BoxGeometry,BufferAttribute,Group,Mesh,MeshStandardMaterial,Skeleton,SkinnedMesh} from 'three';
import {applyCoachBodyShape,applyCoachFaceShapes,inspectCoachShapes} from './coachGeometry';
import {applyNeutralAppearance,inspectCoachMaterialZones} from './neutralAppearance';

function skinnedTorso(){
 const geo=new BoxGeometry(1,2,1);
 const p=geo.getAttribute('position');
 const indexes:number[]=[],weights:number[]=[];
 for(let i=0;i<p.count;i++){
  const hip=p.getY(i)<0;
  indexes.push(hip?1:0,0,0,0);
  weights.push(1,0,0,0);
 }
 geo.setAttribute('skinIndex',new BufferAttribute(new Uint16Array(indexes),4));
 geo.setAttribute('skinWeight',new BufferAttribute(new Float32Array(weights),4));
 const spine=new Bone();spine.name='mixamorigSpine1';
 const hips=new Bone();hips.name='mixamorigHips';
 const mesh=new SkinnedMesh(geo,new MeshStandardMaterial({name:'skin_body',color:'#ffffff'}));
 mesh.name='model_body';mesh.bind(new Skeleton([spine,hips]));
 const root=new Group();root.add(mesh);
 return {root,mesh,original:geo,bones:[spine,hips],positions:new Float32Array(p.array as ArrayLike<number>)};
}
const neutral={shoulders:1,muscle:1,waist:1};
describe('Studio Coach — déformations GLB non destructives',()=>{
 it('ne duplique pas la géométrie à proportions standard',()=>{
  const {root,mesh,original}=skinnedTorso();
  expect(inspectCoachShapes(root).torsoVertices).toBeGreaterThan(0);
  applyCoachBodyShape(root,neutral);
  expect(mesh.geometry).toBe(original);
 });
 it('déforme réellement un torse skinné sur une copie, sans déplacer les os ni changer les poids',()=>{
  const {root,mesh,original,bones,positions}=skinnedTorso();
  const before=mesh.skeleton.bones.map(b=>b.position.clone());
  const weight=mesh.geometry.getAttribute('skinWeight');
  const indices=mesh.geometry.getAttribute('skinIndex');
  expect(applyCoachBodyShape(root,{shoulders:1.2,muscle:1.3,waist:1.1})).toBeGreaterThan(0);
  expect(mesh.geometry).not.toBe(original);
  expect(mesh.geometry.userData.cmeOwned).toBe(true);
  expect(mesh.geometry.getAttribute('skinIndex').array).toEqual(indices.array);
  expect(mesh.geometry.getAttribute('skinWeight').array).toEqual(weight.array);
  expect(bones.every((bone,i)=>bone.position.equals(before[i]))).toBe(true);
  expect(Array.from(original.getAttribute('position').array)).toEqual(Array.from(positions));
  expect(mesh.geometry.getAttribute('position').getX(0)).not.toBe(positions[0]);
 });
 it('repart toujours de la source, sans accumulation, et revient exactement à sa forme d’origine',()=>{
  const {root,mesh,positions}=skinnedTorso();
  applyCoachBodyShape(root,{shoulders:1.2,muscle:1,waist:1});
  const first=Array.from(mesh.geometry.getAttribute('position').array);
  applyCoachBodyShape(root,{shoulders:1.2,muscle:1,waist:1});
  expect(Array.from(mesh.geometry.getAttribute('position').array)).toEqual(first);
  applyCoachBodyShape(root,neutral);
  expect(Array.from(mesh.geometry.getAttribute('position').array)).toEqual(Array.from(positions));
 });
 it('n’altère aucun mesh non skinné ou dénué de squelette de torse',()=>{
  const group=new Group();
  const mesh=new Mesh(new BoxGeometry(),new MeshStandardMaterial());
  group.add(mesh);expect(inspectCoachShapes(group).torsoVertices).toBe(0);
  expect(applyCoachBodyShape(group,{shoulders:1.2,muscle:1.2,waist:1.2})).toBe(0);
 });
 it('ne pilote que des morph targets visage explicitement nommés',()=>{
  const root=new Group(),mesh=new Mesh(new BoxGeometry(),new MeshStandardMaterial());
  mesh.morphTargetDictionary={jawWide:0,noseNarrow:1,smile:2,eyesBig:3};
  mesh.morphTargetInfluences=[0,0,.4,0];root.add(mesh);
  expect(inspectCoachShapes(root).faceMorphs).toEqual({jaw:1,nose:1,eyes:1});
  expect(applyCoachFaceShapes(root,{jaw:1.2,nose:.8,eyes:1.1})).toBe(3);
  expect(mesh.morphTargetInfluences[0]).toBeGreaterThan(0);
  expect(mesh.morphTargetInfluences[1]).toBeGreaterThan(0);
  expect(mesh.morphTargetInfluences[2]).toBe(.4);
  expect(mesh.morphTargetInfluences[3]).toBeGreaterThan(0);
 });
 it('classe chaque sous-matériau par priorité avant le nom de maillage parent',()=>{
  const root=new Group();
  const skin=new Mesh(new BoxGeometry(),[
   new MeshStandardMaterial({name:'shirt_top',color:'#abcdef'}),
   new MeshStandardMaterial({name:'eye_iris',color:'#abcdef'}),
   new MeshStandardMaterial({name:'unknown',color:'#777777'})
  ]);
  skin.name='skin_body';root.add(skin);
  const colors={skin:'#cba987',topColor:'#ff0000',eyeColor:'#22ff88',hairColor:'#999999',bottomColor:'#0000ff',gloveColor:'#444444'};
  const cap=inspectCoachMaterialZones(root);
  expect(cap.topColor).toBe(1);
  expect(cap.eyeColor).toBe(1);
  applyNeutralAppearance(root,colors);
  const materials=skin.material as MeshStandardMaterial[];
  expect(materials[0].color.getHexString()).toBe('ff0000');
  expect(materials[1].color.getHexString()).toBe('22ff88');
  // An explicitly unknown sub-material must not become skin merely because
  // it is attached under a mesh named "skin_body".
  expect(materials[2].color.getHexString()).toBe('777777');
 });
});
