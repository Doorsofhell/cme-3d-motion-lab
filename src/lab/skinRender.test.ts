import {describe,it,expect} from 'vitest';
import {Mesh,MeshStandardMaterial,MeshPhysicalMaterial,Texture,BoxGeometry,Group} from 'three';
import {enhanceHumanMaterial} from '../adapters/outfits';
describe('rendues cutanés photoréalistes',()=>{
 it('préserve les textures originales du visage et une réponse non métallique',()=>{
  const map=new Texture(),normalMap=new Texture();
  const group=new Group(),face=new Mesh(new BoxGeometry(),new MeshStandardMaterial({name:'f021_head',map,normalMap}));
  group.add(face);
  enhanceHumanMaterial(group);
  const m=face.material as MeshPhysicalMaterial;
  expect(m.isMeshPhysicalMaterial).toBe(true);
  expect(m.map).toBe(map);expect(m.normalMap).toBe(normalMap);
  expect(m.metalness).toBe(0);
  expect(m.roughness).toBeGreaterThan(.6);
  expect(m.specularIntensity).toBeLessThan(.4);
 });
 it('préserve les détails de la peau en mode performance',()=>{
  const map=new Texture(),group=new Group();
  const body=new Mesh(new BoxGeometry(),new MeshStandardMaterial({name:'m021_body',map}));
  group.add(body);enhanceHumanMaterial(group,true);
  expect((body.material as MeshStandardMaterial).map).toBe(map);
  expect((body.material as MeshStandardMaterial).metalness).toBe(0);
 });
});
