import {describe,it,expect,vi} from 'vitest';
import {Bone,BoxGeometry,BufferAttribute,Group,Mesh,MeshStandardMaterial,Skeleton,SkinnedMesh} from 'three';
import {applyCoachBodyShape,applyCoachFaceShapes,applyCoachLookGeometry,inspectCoachShapes} from './coachGeometry';
import {applyNeutralAppearance,inspectCoachMaterialZones} from './neutralAppearance';
import {cloneOwnedGeometry} from '../adapters/geometryOwnership';

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

function skinnedFemale(){
 const geo=new BoxGeometry(1,2,1,4,8,2),p=geo.getAttribute('position');
 const joints:number[]=[],weights:number[]=[];
 for(let i=0;i<p.count;i++){
  const y=p.getY(i),x=p.getX(i);
  const id=y>.38?0:y>-.3?1:x>=0?2:3;
  joints.push(id,0,0,0);weights.push(1,0,0,0);
 }
 geo.setAttribute('skinIndex',new BufferAttribute(new Uint16Array(joints),4));
 geo.setAttribute('skinWeight',new BufferAttribute(new Float32Array(weights),4));
 const bones=[new Bone(),new Bone(),new Bone(),new Bone()];
 bones.forEach((b,i)=>b.name=['mixamorigSpine2','mixamorigHips','mixamorigLeftUpLeg','mixamorigRightUpLeg'][i]);
 const skeleton=new Skeleton(bones);
 const body=new SkinnedMesh(geo,new MeshStandardMaterial({name:'f021_body'}));body.name='body';
 body.bind(skeleton);
 const garmentGeo=cloneOwnedGeometry(geo);
 const garment=new SkinnedMesh(garmentGeo,new MeshStandardMaterial({name:'haut-brassiere'}));garment.name='tenue:haut';
 garment.bind(skeleton);
 const root=new Group();root.add(body,garment);
 return {root,body,garment,geo,bones,reference:Array.from(p.array)};
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
 it('ne transfère jamais le marquage propriété vers la géométrie GLB source',()=>{
  const {original}=skinnedTorso();
  const owned=cloneOwnedGeometry(original);
  expect(owned).not.toBe(original);
  expect(owned.userData.cmeOwned).toBe(true);
  expect(original.userData.cmeOwned).not.toBe(true);
  owned.userData.customFlag='local';
  expect(original.userData.customFlag).toBeUndefined();
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
 it('applique le même profil Studio et Laboratoire aux volumes et morphs sans changer le rig',()=>{
  const {root,mesh,original,positions,bones}=skinnedTorso();
  const face=new Mesh(new BoxGeometry(),new MeshStandardMaterial({name:'skin_face'}));
  face.morphTargetDictionary={jawWide:0,smile:1};
  face.morphTargetInfluences=[0,.35];root.add(face);
  const initialBones=bones.map(b=>b.position.clone());
  const look={height:1.08,shoulders:1.18,muscle:1.23,waist:.9,jaw:1.2,nose:1,eyes:1};
  const first=applyCoachLookGeometry(root,look);
  expect(first.torsoVertices).toBeGreaterThan(0);
  expect(first.faceTargets).toBe(1);
  expect(root.scale.x).toBeCloseTo(1.08);
  expect(mesh.geometry).not.toBe(original);
  expect(face.morphTargetInfluences[0]).toBeGreaterThan(0);
  expect(face.morphTargetInfluences[1]).toBe(.35);
  const shaped=Array.from(mesh.geometry.getAttribute('position').array);
  applyCoachLookGeometry(root,look);
  expect(Array.from(mesh.geometry.getAttribute('position').array)).toEqual(shaped);
  const reset=applyCoachLookGeometry(root,{height:1,shoulders:1,muscle:1,waist:1,jaw:1,nose:1,eyes:1});
  expect(reset.faceTargets).toBe(1);
  expect(Array.from(mesh.geometry.getAttribute('position').array)).toEqual(Array.from(positions));
  expect(face.morphTargetInfluences[0]).toBe(0);
  expect(root.scale.x).toBe(1);
  expect(bones.every((bone,i)=>bone.position.equals(initialBones[i]))).toBe(true);
 });
 it('ajuste le tissu du haut avec une marge minime sans changer les os ou le corps source',()=>{
  const {root,mesh,original,bones}=skinnedTorso();
  const coatSource=cloneOwnedGeometry(original);
  expect(original.userData.cmeOwned).not.toBe(true);
  const garment=new SkinnedMesh(coatSource,new MeshStandardMaterial({name:'shirt_top'}));
  garment.name='tenue:haut';
  garment.bind(mesh.skeleton);
  root.add(garment);
  const disposeCoat=vi.spyOn(coatSource,'dispose');
  const disposeBody=vi.spyOn(original,'dispose');
  const before=Array.from(original.getAttribute('position').array);
  const pose=bones.map(b=>b.position.clone());
  const shape={shoulders:1.2,muscle:1.25,waist:.92};
  applyCoachBodyShape(root,shape);
  const sourceX=original.getAttribute('position').getX(0);
  const bodyX=mesh.geometry.getAttribute('position').getX(0);
  const clothX=garment.geometry.getAttribute('position').getX(0);
  expect(Math.abs(clothX/sourceX)).toBeGreaterThan(Math.abs(bodyX/sourceX));
  expect(garment.geometry.userData.cmeOwned).toBe(true);
  expect(disposeCoat).toHaveBeenCalledTimes(1);
  expect(disposeBody).not.toHaveBeenCalled();
  const current=Array.from(garment.geometry.getAttribute('position').array);
  applyCoachBodyShape(root,shape);
  expect(Array.from(garment.geometry.getAttribute('position').array)).toEqual(current);
  expect(disposeCoat).toHaveBeenCalledTimes(1);
  applyCoachBodyShape(root,neutral);
  expect(Array.from(garment.geometry.getAttribute('position').array)).toEqual(before);
  expect(bones.every((b,i)=>b.position.equals(pose[i]))).toBe(true);
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

describe('Silhouette femme — vrais volumes skinnés, sans déformation des os',()=>{
 const defaults={height:1,shoulders:1,muscle:1,waist:1,jaw:1,nose:1,eyes:1,sex:'femme' as const,roundness:1,hips:1,thighs:1};
 it('détecte de vrais sommets de bassin et de cuisse, y compris sur les tenues',()=>{
  const {root}=skinnedFemale();
  const support=inspectCoachShapes(root);
  expect(support.torsoVertices).toBeGreaterThan(0);
  expect(support.hipVertices).toBeGreaterThan(0);
  expect(support.thighVertices).toBeGreaterThan(0);
 });
 it('modifie vraiment hanches et cuisses, de façon indépendante et déterministe',()=>{
  const {root,body,geo,bones,reference}=skinnedFemale();
  const bonesBefore=bones.map(b=>b.position.clone());
  const skinIndexes=Array.from(geo.getAttribute('skinIndex').array);
  const skinWeights=Array.from(geo.getAttribute('skinWeight').array);
  applyCoachLookGeometry(root,{...defaults,hips:1.3});
  const hipsShaped=Array.from(body.geometry.getAttribute('position').array);
  expect(hipsShaped).not.toEqual(reference);
  applyCoachLookGeometry(root,{...defaults,thighs:1.2});
  const thighsShaped=Array.from(body.geometry.getAttribute('position').array);
  expect(thighsShaped).not.toEqual(reference);
  expect(thighsShaped).not.toEqual(hipsShaped);
  applyCoachLookGeometry(root,{...defaults,roundness:1.2});
  const rounded=Array.from(body.geometry.getAttribute('position').array);
  expect(rounded).not.toEqual(reference);
  expect(rounded).not.toEqual(hipsShaped);
  applyCoachLookGeometry(root,{...defaults,roundness:1.2});
  expect(Array.from(body.geometry.getAttribute('position').array)).toEqual(rounded);
  applyCoachLookGeometry(root,defaults);
  expect(Array.from(body.geometry.getAttribute('position').array)).toEqual(reference);
  expect(Array.from(geo.getAttribute('position').array)).toEqual(reference);
  expect(Array.from(body.geometry.getAttribute('skinIndex').array)).toEqual(skinIndexes);
  expect(Array.from(body.geometry.getAttribute('skinWeight').array)).toEqual(skinWeights);
  expect(bones.every((b,i)=>b.position.equals(bonesBefore[i]))).toBe(true);
 });
 it('applique les réglages au vêtement cloné sans altérer le GLB initial',()=>{
  const {root,garment,geo,reference}=skinnedFemale();
  const outfitSource=garment.geometry;
  const dispose=vi.spyOn(outfitSource,'dispose');
  applyCoachLookGeometry(root,{...defaults,hips:1.25,thighs:1.15,roundness:1.2});
  expect(Array.from(garment.geometry.getAttribute('position').array)).not.toEqual(reference);
  expect(outfitSource).not.toBe(garment.geometry);
  expect(dispose).toHaveBeenCalledTimes(1);
  expect(geo.userData.cmeOwned).not.toBe(true);
  expect(Array.from(geo.getAttribute('position').array)).toEqual(reference);
 });
 it('n’active aucun volume féminin sur un coach masculin',()=>{
  const {root,body,geo}=skinnedFemale();
  applyCoachBodyShape(root,{sex:'homme',shoulders:1,muscle:1,waist:1,hips:1.35,roundness:1.3,thighs:1.3});
  expect(body.geometry).toBe(geo);
 });
});
