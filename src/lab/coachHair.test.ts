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
