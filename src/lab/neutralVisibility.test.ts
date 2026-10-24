import {describe,expect,it} from 'vitest';
import {Bone,BoxGeometry,Group,Mesh,MeshStandardMaterial} from 'three';
import {masquerApparenceSource} from './neutralVisibility';
describe('non-régression des surfaces neutres',()=>{
 it('conserve les enfants et os visibles sous le maillage source',()=>{
  const racine=new Group();
  const original=new Mesh(new BoxGeometry(),new MeshStandardMaterial({color:'#ff0000'}));
  const os=new Bone();os.name='mixamorigLeftArm';original.add(os);
  const surface=new Mesh(new BoxGeometry(),new MeshStandardMaterial({color:'#a7abb2'}));
  surface.name='CME_NEUTRAL_LeftArm_LeftForeArm';os.add(surface);racine.add(original);
  const count=masquerApparenceSource(racine);
  expect(count).toBe(1);
  expect(original.visible).toBe(true);
  expect(os.visible).toBe(true);
  expect(surface.visible).toBe(true);
  expect((original.material as MeshStandardMaterial).opacity).toBe(0);
  expect((original.material as MeshStandardMaterial).colorWrite).toBe(false);
  expect((surface.material as MeshStandardMaterial).opacity).toBe(1);
 });
 it('masque tous les sous-matériaux sources sans modifier le modèle GLB initial',()=>{
  const racine=new Group();const mat=new MeshStandardMaterial({color:'#aa2244'});
  const original=new Mesh(new BoxGeometry(),[mat,new MeshStandardMaterial()]);racine.add(original);
  masquerApparenceSource(racine);
  const clone=original.material as MeshStandardMaterial[];
  expect(clone).toHaveLength(2);expect(clone.every(x=>x.opacity===0&&!x.colorWrite&&!x.depthWrite)).toBe(true);
  expect(mat.opacity).toBe(1);expect(mat.colorWrite).toBe(true);
 });
});
