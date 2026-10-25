import {describe,expect,it} from 'vitest';
import {BoxGeometry,Group,Mesh,MeshStandardMaterial,Texture} from 'three';
import {ANATOMICAL_VIEWS,directionAnatomique} from './AnatomicalReference';
import {applyAnatomicalMannequinMaterials} from './neutralAppearance';

describe('CME 0.7.41 — mannequin premium : jalon technique',()=>{
 it('dispose de quatre directions distinctes et opposées deux à deux',()=>{
  expect(ANATOMICAL_VIEWS.map(x=>x.id)).toEqual(['face','dos','profil-droit','profil-gauche']);
  const [face,dos,droite,gauche]=ANATOMICAL_VIEWS.map(v=>directionAnatomique(v.id));
  expect(face[2]).toBe(1);expect(dos[2]).toBe(-1);
  expect(droite[0]).toBe(-1);expect(gauche[0]).toBe(1);
 });
 it('garde le mesh originel mais applique la finition satin sans vêtements',()=>{
  const scene=new Group(),texture=new Texture();
  const body=new Mesh(new BoxGeometry(),new MeshStandardMaterial({name:'f021_body',map:texture,roughness:.88,metalness:0}));
  body.name='f021_body';
  const clothes=new Mesh(new BoxGeometry(),new MeshStandardMaterial());clothes.name='tenue:shirt';
  scene.add(body,clothes);
  const geom=body.geometry;
  expect(applyAnatomicalMannequinMaterials(scene)).toBe(1);
  expect(body.geometry).toBe(geom);
  expect((body.material as MeshStandardMaterial).map).toBeNull();
  expect((body.material as MeshStandardMaterial).roughness).toBe(.48);
  expect((body.material as MeshStandardMaterial).metalness).toBe(.32);
  expect(clothes.visible).toBe(false);
  expect(texture).toBeDefined();
 });
 it('ne réactive pas un maillage volontairement caché',()=>{
  const root=new Group();const hidden=new Mesh(new BoxGeometry(),new MeshStandardMaterial());
  hidden.userData.cmeHiddenSource=true;hidden.visible=false;root.add(hidden);
  expect(applyAnatomicalMannequinMaterials(root)).toBe(0);
  expect(hidden.visible).toBe(false);
 });
});
