import {Bone,BoxGeometry,Group,Mesh,MeshStandardMaterial,Vector3} from 'three';
import {describe,it,expect} from 'vitest';
import {applyCoachHair,HAIR_STYLES,hasEditableHairRoot} from './coachHair';
function actor(){
 const root=new Group();const head=new Bone();head.name='mixamorigHead';head.position.set(0,1.7,0);root.add(head);
 const mesh=new Mesh(new BoxGeometry(.2,.27,.2),new MeshStandardMaterial({name:'f021_head'}));
 mesh.name='f021_head';mesh.position.set(0,1.79,0);root.add(mesh);
 const sourceHair=new Mesh(new BoxGeometry(.2,.1,.2),new MeshStandardMaterial({name:'hair'}));
 sourceHair.name='hair_mesh';sourceHair.position.set(0,1.9,0);root.add(sourceHair);
 return {root,head,mesh,sourceHair};
}
describe('V0.7.53 : sept coiffures géométriques réelles et colorables',()=>{
 it('propose sept coupes avec volumes distincts, sans modifier os ou peau',()=>{
  const {root,head,mesh}=actor(),geo=mesh.geometry,originalBone=head.position.clone();
  expect(HAIR_STYLES).toHaveLength(7);
  expect(hasEditableHairRoot(root)).toBe(true);
  const counts=new Map<string,number>();
  for(const hair of HAIR_STYLES){
   const count=applyCoachHair(root,hair.id,'#dbaf73');
   counts.set(hair.id,count);
   expect(root.getObjectByName('CME_COIFFURE_ADAPTATIVE')!==undefined).toBe(hair.id!=='rase');
   expect(head.position.equals(originalBone)).toBe(true);
   expect(mesh.geometry).toBe(geo);
  }
  expect(counts.get('boucles')).toBeGreaterThan(counts.get('court')!);
  expect(counts.get('queue-haute')).toBeGreaterThan(1);
  expect(counts.get('tresse')).toBeGreaterThan(1);
  expect(counts.get('degrade')).toBeGreaterThan(1);
 });
 it('construit une coupe courte sur l’os Head et la colore',()=>{
  const {root,head,mesh,sourceHair}=actor(),original=mesh.geometry;
  expect(applyCoachHair(root,'court','#b99763')).toBeGreaterThan(1);
  const wig=head.getObjectByName('CME_COIFFURE_ADAPTATIVE') as Group;
  expect(wig.children.length).toBeGreaterThan(1);
  expect((wig.children[0] as Mesh).material).toBeInstanceOf(MeshStandardMaterial);
  expect(((wig.children[0] as Mesh).material as MeshStandardMaterial).color.getHexString()).toBe('b99763');
  expect(sourceHair.visible).toBe(false);
  expect(mesh.geometry).toBe(original);
 });
 it('change de coupe et de couleur sans ajouter des accessoires fantômes',()=>{
  const {root,head}=actor();
  applyCoachHair(root,'court','#111111');
  applyCoachHair(root,'long','#dfdcdb');
  const wig=head.getObjectByName('CME_COIFFURE_ADAPTATIVE') as Group;
  expect(wig.children.length).toBe(17);
  expect(((wig.children[0] as Mesh).material as MeshStandardMaterial).color.getHexString()).toBe('dfdcdb');
  expect(head.children.filter(x=>x.name==='CME_COIFFURE_ADAPTATIVE')).toHaveLength(1);
  expect(applyCoachHair(root,'rase','#ffffff')).toBe(1);
  expect(head.getObjectByName('CME_COIFFURE_ADAPTATIVE')).toBeUndefined();
 });
 it('n’invente aucun couvre-chef sur un GLB sans os de tête',()=>{
  const root=new Group(),p=root.position.clone();
  expect(applyCoachHair(root,'court','#ffffff')).toBe(0);
  expect(root.position.equals(p)).toBe(true);
 });
});

describe('0.7.54 — couleur capillaire instantanée et maillage stable',()=>{
 it('réutilise le même matériau et les mêmes sommets pour foncé puis clair',()=>{
  const {root,head,mesh}=actor();
  applyCoachHair(root,'tresse','#17161a');
  const accessory=head.getObjectByName('CME_COIFFURE_ADAPTATIVE') as Group;
  const child=accessory.children[0] as Mesh,geometrie=child.geometry;
  applyCoachHair(root,'tresse','#dfdcdb');
  expect(head.getObjectByName('CME_COIFFURE_ADAPTATIVE')).toBe(accessory);
  expect((accessory.children[0] as Mesh).geometry).toBe(geometrie);
  expect((child.material as MeshStandardMaterial).color.getHexString()).toBe('dfdcdb');
  applyCoachHair(root,'tresse','#17161a');
  expect((child.material as MeshStandardMaterial).color.getHexString()).toBe('17161a');
  expect(mesh.geometry).not.toBe(geometrie);
 });
 it('reconstruit réellement la géométrie quand la coupe change',()=>{
  const {root,head}=actor();
  applyCoachHair(root,'court','#4c382a');
  const first=head.getObjectByName('CME_COIFFURE_ADAPTATIVE');
  applyCoachHair(root,'boucles','#4c382a');
  const second=head.getObjectByName('CME_COIFFURE_ADAPTATIVE');
  expect(second).toBeDefined();expect(second).not.toBe(first);
 });
});
