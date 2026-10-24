import {describe,it,expect} from 'vitest';
import {BoxGeometry,Mesh,MeshStandardMaterial,Object3D,Texture} from 'three';
import {applyNeutralRigMaterials,applyNeutralAppearance} from './neutralAppearance';

describe('strict separation of neutral rig and dressed appearance',()=>{
 it('neutral rig removes skin maps and forces one matte neutral material color',()=>{
  const root=new Object3D();
  const map=new Texture();
  const skin=new Mesh(new BoxGeometry(),new MeshStandardMaterial({color:'#a34120',map}));
  skin.name='skin_body';
  root.add(skin);
  expect(applyNeutralRigMaterials(root)).toBe(1);
  expect((skin.material as MeshStandardMaterial).map).toBe(null);
  expect((skin.material as MeshStandardMaterial).color.getHexString()).toBe('a7abb2');
 });
 it('neutral rig hides separately named boxing gloves',()=>{
  const root=new Object3D();
  const glove=new Mesh(new BoxGeometry(),new MeshStandardMaterial());
  glove.name='boxing_glove';
  root.add(glove);
  applyNeutralRigMaterials(root);
  expect(glove.visible).toBe(false);
 });
 it('appearance mode retains source maps and applies skin tint',()=>{
  const root=new Object3D();
  const map=new Texture();
  const skin=new Mesh(new BoxGeometry(),new MeshStandardMaterial({color:'#ffffff',map}));
  skin.name='skin_body';
  root.add(skin);
  applyNeutralAppearance(root,{skin:'#b97a56',hairColor:'#201713',topColor:'#252934',bottomColor:'#d6363c',gloveColor:'#d6363c'});
  expect((skin.material as MeshStandardMaterial).map).toBe(map);
  // La référence ne teinte plus une seconde fois la texture naturelle.
  expect((skin.material as MeshStandardMaterial).color.getHexString()).toBe('ffffff');
 });
});
