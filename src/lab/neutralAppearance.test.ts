import {describe,it,expect} from 'vitest';
import {Mesh,MeshStandardMaterial,MeshToonMaterial,Object3D,BoxGeometry,Texture,Color} from 'three';
import {appearanceZone,applyNeutralAppearance,inspectCoachMaterialZones,relativeSkinColor} from './neutralAppearance';
import {NATIVE_SKIN_REFERENCE,SKIN_TONES} from './skinTones';
describe('skinned appearance adapter isolation',()=>{
 it('applique les teintes aux matériaux Toon de Fitness/Comics sans perdre les textures',()=>{
  const root=new Object3D(),sourceMap=new Texture();
  const face=new Mesh(new BoxGeometry(),new MeshToonMaterial({name:'skin_head-fitness',color:'#ffffff',map:sourceMap}));
  root.add(face);
  expect(inspectCoachMaterialZones(root).skin).toBe(1);
  expect(applyNeutralAppearance(root,{skin:'#aabbcc',hairColor:'#222222',topColor:'#444444',bottomColor:'#666666',gloveColor:'#888888'})).toBe(1);
  const material=face.material as MeshToonMaterial;
  // A textured skin gets a RELATIVE correction to retain the original albedo,
  // not the raw #aabbcc double-multiplied into its texture.
  expect(material.color.getHexString()).toBe(relativeSkinColor(new Color('#ffffff'),'#aabbcc').getHexString());
  expect(material.map).toBe(sourceMap);
 });

 it('préserve la carnation d’origine à la sélection du teint de référence, sans teint rouge ajouté',()=>{
  const map=new Texture(),original=new Color('#d6b094');
  const root=new Object3D();
  const body=new Mesh(new BoxGeometry(),new MeshStandardMaterial({name:'f021_body',map,color:original}));
  root.add(body);
  const input={skin:NATIVE_SKIN_REFERENCE,hairColor:'#201713',topColor:'#222222',bottomColor:'#333333',gloveColor:'#444444'};
  applyNeutralAppearance(root,input);
  expect((body.material as MeshStandardMaterial).color.getHexString()).toBe(original.getHexString());
  expect((body.material as MeshStandardMaterial).map).toBe(map);
  applyNeutralAppearance(root,{...input,skin:SKIN_TONES[0].hex});
  const bright=(body.material as MeshStandardMaterial).color.clone();
  applyNeutralAppearance(root,{...input,skin:SKIN_TONES[7].hex});
  const deep=(body.material as MeshStandardMaterial).color.clone();
  expect(bright.getHSL({h:0,s:0,l:0}).l).toBeGreaterThan(deep.getHSL({h:0,s:0,l:0}).l);
  applyNeutralAppearance(root,input);
  expect((body.material as MeshStandardMaterial).color.getHexString()).toBe(original.getHexString());
 });
 it('distingue les gants, cheveux et tenues des maillages skinnés parents',()=>{
  expect(appearanceZone('skin_body_glove')).toBe('gloveColor');
  expect(appearanceZone('skin_head_hair')).toBe('hairColor');
  expect(appearanceZone('eye_iris')).toBe('eyeColor');
  expect(appearanceZone('tenue:boxing_shirt')).toBe('topColor');
  expect(appearanceZone('body_skin')).toBe('skin');
 });
 it('reconnaît les noms réels trouvés dans les 14 GLB de tenues',()=>{
  expect(appearanceZone('cuir-gant-boxe')).toBe('gloveColor');
  expect(appearanceZone('sangle-mma-#B3122A')).toBe('gloveColor');
  expect(appearanceZone('protection-#16181D')).toBe('shinColor');
  expect(appearanceZone('velcro-#B3122A')).toBe('shinColor');
  expect(appearanceZone('haut-brassiere-#16181D')).toBe('topColor');
  expect(appearanceZone('gi-#F7F6F2-judo')).toBe('topColor');
  expect(appearanceZone('col-#F7F6F2-judo')).toBe('topColor');
  expect(appearanceZone('haut-rash-long-#B3122A')).toBe('topColor');
  expect(appearanceZone('short-boxe-#B3122A')).toBe('bottomColor');
  expect(appearanceZone('pantalon-#F2F0EA-bjj')).toBe('bottomColor');
  expect(appearanceZone('f021_body')).toBe('skin');
  expect(appearanceZone('m021_head')).toBe('skin');
 });
 it('traite les protège-tibias distinctement des gants et des bras',()=>{
  const root=new Object3D();
  const glove=new Mesh(new BoxGeometry(),new MeshStandardMaterial({name:'cuir-gant-boxe',color:'#ffffff'}));
  const shin=new Mesh(new BoxGeometry(),new MeshStandardMaterial({name:'protection-#16181D',color:'#ffffff'}));
  root.add(glove,shin);
  expect(inspectCoachMaterialZones(root)).toMatchObject({gloveColor:1,shinColor:1,skin:0});
  applyNeutralAppearance(root,{skin:'#b97a56',hairColor:'#201713',topColor:'#ffffff',bottomColor:'#888888',gloveColor:'#be4439',shinColor:'#223344'});
  expect((glove.material as MeshStandardMaterial).color.getHexString()).toBe('be4439');
  expect((shin.material as MeshStandardMaterial).color.getHexString()).toBe('223344');
 });
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
