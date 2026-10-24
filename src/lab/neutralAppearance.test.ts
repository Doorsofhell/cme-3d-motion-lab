import {describe,it,expect} from 'vitest';
import {Mesh,MeshStandardMaterial,Object3D,BoxGeometry} from 'three';
import {appearanceZone,applyNeutralAppearance} from './neutralAppearance';
describe('skinned appearance adapter isolation',()=>{
 it('classifies known materials and leaves unknowns untouched',()=>{
  expect(appearanceZone('fighter_face')).toBe('skin');
  expect(appearanceZone('Boxing_Glove')).toBe('gloveColor');
  expect(appearanceZone('unrecognized_mesh')).toBe(null);
 });
 it('changes only classified material colors and never skeleton transforms',()=>{
  const root=new Object3D();
  const skin=new Mesh(new BoxGeometry(),new MeshStandardMaterial({color:'#ffffff'}));
  skin.name='body_skin';
  const unknown=new Mesh(new BoxGeometry(),new MeshStandardMaterial({color:'#123456'}));
  unknown.name='mystery';
  root.add(skin,unknown);
  const appearance={skin:'#aabbcc',hairColor:'#112233',topColor:'#334455',bottomColor:'#556677',gloveColor:'#778899'};
  const before=root.position.clone();
  expect(applyNeutralAppearance(root,appearance)).toBe(1);
  expect((skin.material as MeshStandardMaterial).color.getHexString()).toBe('aabbcc');
  expect((unknown.material as MeshStandardMaterial).color.getHexString()).toBe('123456');
  expect(root.position.equals(before)).toBe(true);
 });
});
