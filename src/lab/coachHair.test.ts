import {Bone,BoxGeometry,Group,Mesh,MeshStandardMaterial,Vector3} from 'three';
import {describe,it,expect} from 'vitest';
import {applyCoachHair} from './coachHair';
function actor(){
 const root=new Group();const head=new Bone();head.name='mixamorigHead';head.position.set(0,1.7,0);root.add(head);
 const mesh=new Mesh(new BoxGeometry(.2,.27,.2),new MeshStandardMaterial({name:'f021_head'}));
 mesh.name='f021_head';mesh.position.set(0,1.79,0);root.add(mesh);
 const sourceHair=new Mesh(new BoxGeometry(.2,.1,.2),new MeshStandardMaterial({name:'hair'}));
 sourceHair.name='hair_mesh';sourceHair.position.set(0,1.9,0);root.add(sourceHair);
 return {root,head,mesh,sourceHair};
}
describe('V0.7.45 : coiffures réellement visibles',()=>{
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
  expect(wig.children.length).toBe(15);
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

describe('0.7.53 — coiffures en volume et recoloration sans reconstruction',()=>{
 for(const style of ['degrade','court','mi-long','long','queue-haute','tresse'] as const){
  it('crée une géométrie distincte fixée à Head : '+style,()=>{
   const {root,head,mesh}=actor(),before=mesh.geometry;
   expect(applyCoachHair(root,style,'#392018')).toBeGreaterThan(2);
   const object=head.getObjectByName('CME_COIFFURE_ADAPTATIVE') as Group;
   expect(object.userData.cmeHairStyle).toBe(style);
   expect(object.children.every(child=>(child as Mesh).geometry!==undefined)).toBe(true);
   expect(mesh.geometry).toBe(before);
  });
 }
 it('recolore en place sans réallouer de géométrie, y compris vers une couleur plus claire',()=>{
  const {root,head}=actor();
  applyCoachHair(root,'tresse','#17161a');
  const a=head.getObjectByName('CME_COIFFURE_ADAPTATIVE') as Group;
  const mesh=a.children[0] as Mesh,geometry=mesh.geometry;
  applyCoachHair(root,'tresse','#dfdcdb');
  const b=head.getObjectByName('CME_COIFFURE_ADAPTATIVE') as Group;
  expect(b).toBe(a);expect((b.children[0] as Mesh).geometry).toBe(geometry);
  expect(((b.children[0] as Mesh).material as MeshStandardMaterial).color.getHexString()).toBe('dfdcdb');
 });
 it('maintient la coiffure sous le Bone pour suivre toute pose d’animation',()=>{
  const {root,head}=actor();
  applyCoachHair(root,'queue-haute','#735132');
  const object=head.getObjectByName('CME_COIFFURE_ADAPTATIVE') as Group;
  head.rotation.z=.35;root.updateWorldMatrix(true,true);
  expect(object.parent).toBe(head);
  expect(object.matrixWorld.elements).toBeDefined();
 });
});
