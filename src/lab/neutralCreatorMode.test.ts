import {describe,it,expect} from 'vitest';
import {Mesh,MeshStandardMaterial,BoxGeometry,Texture,Group} from 'three';
import {prepareEditableNeutralBody,applyNeutralAppearance} from './neutralAppearance';
import {SKIN_TONES} from './skinTones';
describe('Studio : corps neutre réellement éditable',()=>{
 it('conserve carte de peau originale, n’affiche pas les vêtements et module le teint',()=>{
  const map=new Texture(),skin=new Mesh(new BoxGeometry(),new MeshStandardMaterial({name:'f021_body',map,color:'#ffffff'}));
  const top=new Mesh(new BoxGeometry(),new MeshStandardMaterial({name:'haut-tshirt'}));
  skin.name='f021_body';top.name='tenue:tshirt';
  const root=new Group();root.add(skin,top);
  expect(prepareEditableNeutralBody(root)).toBe(1);
  expect(skin.visible).toBe(true);
  expect(top.visible).toBe(false);
  const props={skin:SKIN_TONES[0].hex,hairColor:'#222222',topColor:'#333333',bottomColor:'#444444',gloveColor:'#555555'};
  applyNeutralAppearance(root,props);
  const light=(skin.material as MeshStandardMaterial).color.getHexString();
  applyNeutralAppearance(root,{...props,skin:SKIN_TONES[7].hex});
  const deep=(skin.material as MeshStandardMaterial).color.getHexString();
  expect(light).not.toBe(deep);
  expect((skin.material as MeshStandardMaterial).map).toBe(map);
 });
 it('respecte le masquage volontaire des sources internes du moteur',()=>{
  const mesh=new Mesh(new BoxGeometry(),new MeshStandardMaterial({name:'f021_body'}));
  mesh.userData.cmeHiddenSource=true;mesh.visible=false;
  const root=new Group();root.add(mesh);
  prepareEditableNeutralBody(root);
  expect(mesh.visible).toBe(false);
 });
});
