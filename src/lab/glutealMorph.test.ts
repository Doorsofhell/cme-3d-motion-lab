import {describe,it,expect} from 'vitest';
import {Bone,BoxGeometry,BufferAttribute,Group,MeshStandardMaterial,Skeleton,SkinnedMesh} from 'three';
import {applyCoachBodyShape} from './coachGeometry';
function rig(){
 const geo=new BoxGeometry(1,2,1,8,12,6),p=geo.getAttribute('position'),indexes:number[]=[],weights:number[]=[];
 for(let i=0;i<p.count;i++){indexes.push(p.getY(i)<.25?1:0,0,0,0);weights.push(1,0,0,0);}
 geo.setAttribute('skinIndex',new BufferAttribute(new Uint16Array(indexes),4));
 geo.setAttribute('skinWeight',new BufferAttribute(new Float32Array(weights),4));
 const chest=new Bone(),pelvis=new Bone();chest.name='mixamorigSpine2';pelvis.name='mixamorigHips';
 const mesh=new SkinnedMesh(geo,new MeshStandardMaterial());mesh.name='body';mesh.bind(new Skeleton([chest,pelvis]));
 const root=new Group();root.add(mesh);return {geo,mesh,root,bones:[chest,pelvis]};
}
describe('0.7.43 — projection des fessiers sur maillage skinné',()=>{
 it('agit uniquement en arrière du bassin et ne déplace ni os ni weights',()=>{
  const {geo,mesh,root,bones}=rig();
  const initialBones=bones.map(b=>b.position.clone());
  const savedWeights=Array.from(geo.getAttribute('skinWeight').array);
  const savedVertices=Array.from(geo.getAttribute('position').array);
  expect(applyCoachBodyShape(root,{sex:'femme',shoulders:1,muscle:1,waist:1,glutes:1.35})).toBeGreaterThan(0);
  const a=geo.getAttribute('position'),b=mesh.geometry.getAttribute('position');
  const rear=Array.from({length:a.count},(_,i)=>i).filter(i=>a.getZ(i)<0&&a.getY(i)<.25);
  const front=Array.from({length:a.count},(_,i)=>i).filter(i=>a.getZ(i)>0&&a.getY(i)<.25);
  expect(rear.some(i=>b.getZ(i)<a.getZ(i))).toBe(true);
  expect(front.every(i=>b.getZ(i)===a.getZ(i))).toBe(true);
  expect(Array.from(mesh.geometry.getAttribute('skinWeight').array)).toEqual(savedWeights);
  expect(bones.every((bone,i)=>bone.position.equals(initialBones[i]))).toBe(true);
  applyCoachBodyShape(root,{sex:'femme',shoulders:1,muscle:1,waist:1,glutes:1});
  expect(Array.from(mesh.geometry.getAttribute('position').array)).toEqual(savedVertices);
 });
 it('adapte le volume féminin et masculin sans appliquer la même projection',()=>{
  const female=rig(),male=rig(),shape={shoulders:1,muscle:1,waist:1,glutes:1.3};
  applyCoachBodyShape(female.root,{...shape,sex:'femme'});
  applyCoachBodyShape(male.root,{...shape,sex:'homme'});
  const delta=(r:ReturnType<typeof rig>)=>{
   const o=r.geo.getAttribute('position'),n=r.mesh.geometry.getAttribute('position');
   return Array.from({length:o.count},(_,i)=>Math.abs(n.getZ(i)-o.getZ(i))).reduce((sum,d)=>sum+d,0);
  };
  expect(delta(female)).toBeGreaterThan(delta(male));
  expect(delta(male)).toBeGreaterThan(0);
 });
});
