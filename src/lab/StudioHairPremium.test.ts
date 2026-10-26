import {describe,it,expect} from 'vitest';
import {Bone,BoxGeometry,Group,Mesh,MeshStandardMaterial,Texture} from 'three';
import {HAIR_STYLES,hasCoachHairAnchor,applyCoachHair} from './coachHair';
import {applyNeutralAppearance} from './neutralAppearance';
import {defaultCoachLook,normalizeCoachLook} from './StudioCoach';
// @ts-ignore — Vitest peut lire les sources locales sous Node.
import {readFileSync} from 'node:fs';
const code=(name:string)=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
function mannequin(){
 const root=new Group(),bone=new Bone();bone.name='mixamorigHead';root.add(bone);
 const face=new Mesh(new BoxGeometry(.24,.32,.24),new MeshStandardMaterial({name:'skin_head'}));face.name='skin_head';root.add(face);
 return {root,bone,face};
}
describe('0.7.53 — coiffeur 3D partagé Studio / Simulateur',()=>{
 it('propose huit coupes réelles sans reprendre un même mesh fantôme',()=>{
  expect(HAIR_STYLES).toHaveLength(8);
  expect(new Set(HAIR_STYLES.map(x=>x.id)).size).toBe(8);
  for(const hair of HAIR_STYLES){
   const {root,bone,face}=mannequin(),geom=face.geometry;
   expect(hasCoachHairAnchor(root)).toBe(true);
   expect(applyCoachHair(root,hair.id,'#7f4e32')).toBeGreaterThan(0);
   const added=bone.getObjectByName('CME_COIFFURE_ADAPTATIVE');
   if(hair.id==='rase')expect(added).toBeUndefined();
   else expect(added?.children.length).toBeGreaterThan(0);
   expect(face.geometry).toBe(geom);
  }
 });
 it('modifie le pigment des mèches sans recalculer la coiffure',()=>{
  const {root,bone}=mannequin();
  applyCoachHair(root,'tresse','#151515');
  const mesh=(bone.getObjectByName('CME_COIFFURE_ADAPTATIVE') as Group).children[0] as Mesh;
  const geo=mesh.geometry;
  applyCoachHair(root,'tresse','#f1cf82');
  expect(mesh.geometry).toBe(geo);
  expect((mesh.material as MeshStandardMaterial).color.getHexString()).toBe('f1cf82');
  expect(bone.children.filter(x=>x.name==='CME_COIFFURE_ADAPTATIVE')).toHaveLength(1);
 });
 it('préserve le rig et les motions et transmet le style aux coachs animés',()=>{
  const fighter=code('Fighter.tsx'),neutral=code('NeutralRig.tsx');
  expect(fighter).toContain('applyCoachHair(s,coachLook.hairStyle,coachLook.hairColor)');
  expect(neutral).toContain('applyCoachHair(scene,hairStyle,appearance?.hairColor');
  expect(neutral).toContain('hairReady:hasCoachHairAnchor(scene)');
  expect(code('StudioCoach.tsx')).toContain('HAIR_STYLES.map(c=>');
  expect(code('StudioCoach.tsx')).toContain('onClick={()=>update(\'hairColor\',t.hex)}');
  expect(code('NavigationPrincipale.tsx')).toContain("libelle:'Simulateur'");
 });
 it('éclaircit aussi les matières de peau à map foncée sans détruire le GLB',()=>{
  const map=new Texture(),mat=new MeshStandardMaterial({name:'skin_head',map,color:'#856345'});
  const mesh=new Mesh(new BoxGeometry(),mat),root=new Group();root.add(mesh);
  const appearance={skin:'#efcdb5',hairColor:'#201713',topColor:'#333333',bottomColor:'#222222',gloveColor:'#444444'};
  applyNeutralAppearance(root,appearance);
  const bright=mat.color.clone();
  applyNeutralAppearance(root,{...appearance,skin:'#553729'});
  const dark=mat.color.clone();
  expect(bright.r).toBeGreaterThan(dark.r);
  expect(mat.map).toBe(map);
  expect(mesh.geometry.getAttribute('position')).toBeDefined();
 });
 it('conserve les anciens profils et accepte toute nouvelle coupe',()=>{
  for(const preset of HAIR_STYLES)expect(normalizeCoachLook({...defaultCoachLook,hairStyle:preset.id}).hairStyle).toBe(preset.id);
 });
});
