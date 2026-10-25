import {describe,it,expect} from 'vitest';
import {BoxGeometry,Group,Mesh,MeshStandardMaterial,Texture} from 'three';
import {prepareEditableNeutralBody,applyNeutralAppearance,inspectCoachMaterialZones} from './neutralAppearance';
import {applyBodyMeasurements} from './neutralMeasurements';
import {defaultCoachLook,normalizeCoachLook} from './StudioCoach';
import {SKIN_TONES,STYLIZED_SKIN_TONES} from './skinTones';
describe('Créateur corps neutre : H/F, textures conservées et mesures',()=>{
 it('préserve les textures de peau, cache les vêtements et permet la teinte',()=>{
  const sourceMap=new Texture(),body=new Mesh(new BoxGeometry(),new MeshStandardMaterial({name:'f021_body',map:sourceMap,color:'#ffffff'}));
  const garment=new Mesh(new BoxGeometry(),new MeshStandardMaterial({name:'shirt',color:'#ffffff'}));
  body.name='f021_body';garment.name='tenue:shirt';
  const root=new Group();root.add(body,garment);
  expect(prepareEditableNeutralBody(root)).toBe(1);
  expect(body.visible).toBe(true);
  expect(garment.visible).toBe(false);
  expect((body.material as MeshStandardMaterial).map).toBe(sourceMap);
  expect(inspectCoachMaterialZones(root).skin).toBeGreaterThan(0);
  applyNeutralAppearance(root,{skin:SKIN_TONES[7].hex,hairColor:'#222222',topColor:'#333333',bottomColor:'#444444',gloveColor:'#555555'});
  const deep=(body.material as MeshStandardMaterial).color.clone();
  applyNeutralAppearance(root,{skin:SKIN_TONES[0].hex,hairColor:'#222222',topColor:'#333333',bottomColor:'#444444',gloveColor:'#555555'});
  const fair=(body.material as MeshStandardMaterial).color.clone();
  expect(deep.getHexString()).not.toEqual(fair.getHexString());
  expect((body.material as MeshStandardMaterial).map).toBe(sourceMap);
 });
 it('propose des palettes naturelles et animation distinctes sans promettre des coiffures absentes',()=>{
  expect(STYLIZED_SKIN_TONES.length).toBeGreaterThanOrEqual(4);
  expect(new Set([...SKIN_TONES,...STYLIZED_SKIN_TONES].map(x=>x.hex)).size).toBe(SKIN_TONES.length+STYLIZED_SKIN_TONES.length);
 });
 it('convertit une taille saisie en morphologie neutre bornée',()=>{
  const short=applyBodyMeasurements(defaultCoachLook,'160','');
  const tall=applyBodyMeasurements(defaultCoachLook,'190','');
  expect(short.height).toBeLessThan(tall.height);
  expect(short.height).toBeGreaterThanOrEqual(.9);
  expect(tall.height).toBeLessThanOrEqual(1.1);
 });
 it('les mesures modifient les volumes du tronc mais ne déduisent pas arbitrairement la musculature',()=>{
  const base=normalizeCoachLook({...defaultCoachLook,sex:'femme'});
  const light=applyBodyMeasurements(base,'175','60');
  const heavy=applyBodyMeasurements(base,'175','95');
  expect(heavy.waist).toBeGreaterThan(light.waist);
  expect(heavy.hips).toBeGreaterThan(light.hips);
  expect(heavy.muscle).toBe(base.muscle);
 });
 it('conserve les proportions et saisies existantes si les mesures sont absentes ou invalides',()=>{
  const old={...defaultCoachLook,muscle:1.2,waist:1.14};
  expect(applyBodyMeasurements(old,'','')).toEqual(old);
  expect(applyBodyMeasurements(old,'abc','95')).toEqual(old);
 });
});
