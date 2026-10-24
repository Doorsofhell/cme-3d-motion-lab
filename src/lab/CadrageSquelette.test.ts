import {describe,expect,it} from 'vitest';
import {Bone,Group} from 'three';
import {mesurerSquelette} from './CadrageSquelette';
describe('cadrage 3D sur squelette',()=>{
 it('cadre un humanoïde situé loin de l’origine',()=>{
  const scene=new Group();scene.position.set(45,0,-12);
  const bassin=new Bone();bassin.position.set(0,1,0);
  const tete=new Bone();tete.position.set(0,1,0);
  bassin.add(tete);scene.add(bassin);
  const resultat=mesurerSquelette(scene);
  expect(resultat.os).toBe(2);
  expect(resultat.centre.x).toBeCloseTo(45);
  expect(resultat.centre.y).toBeCloseTo(1.5);
  expect(resultat.rayon).toBeGreaterThan(0);
 });
 it('dispose d’un repli sans os',()=>{
  const resultat=mesurerSquelette(new Group());
  expect(resultat.os).toBe(0);
  expect(resultat.rayon).toBeGreaterThan(0);
 });
});
