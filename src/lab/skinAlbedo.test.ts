import {describe,expect,it} from 'vitest';
import {Color} from 'three';
import {retintSkinPixels} from './skinAlbedo';
describe('0.7.53 — peaux sombres et claires réversibles',()=>{
 const original=new Uint8ClampedArray([82,59,44,255,115,83,64,255,99,73,52,255]);
 it('éclaircit réellement les pixels de la texture sans effacer les variations',()=>{
  const light=retintSkinPixels(original,new Color('#efcdb5'));
  const dark=retintSkinPixels(original,new Color('#553729'));
  expect(light[0]).toBeGreaterThan(dark[0]);
  expect(light[4]).toBeGreaterThan(light[0]);
  expect(light[3]).toBe(255);
 });
 it('reproduit la même texture claire après un passage foncé',()=>{
  const first=retintSkinPixels(original,new Color('#efcdb5'));
  retintSkinPixels(original,new Color('#553729'));
  const second=retintSkinPixels(original,new Color('#efcdb5'));
  expect(Array.from(second)).toEqual(Array.from(first));
  expect(Array.from(original)).toEqual([82,59,44,255,115,83,64,255,99,73,52,255]);
 });
});
