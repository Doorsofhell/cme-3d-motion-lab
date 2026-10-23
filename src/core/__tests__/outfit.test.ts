import {describe,it,expect} from 'vitest';
import {maskBody} from '../../adapters/outfits';
describe('original fighter outfits',()=>{
 it('hides fully covered triangles only',()=>{
  const p=[0,0,0,1,0,0,0,1,0,2,2,2],i=[0,1,2,1,2,3];
  const keys=new Set(['0,0,0','1,0,0','0,1,0']);
  expect(maskBody(p,i,keys,1)).toEqual({index:[1,2,3],matched:3});
 });
 it('preserves exposed arms even when old garment masks mark their vertices',()=>{
  const p=[0,0,0,1,0,0,0,1,0,2,2,2],i=[0,1,2,1,2,3];
  const keys=new Set(['0,0,0','1,0,0','0,1,0']);
  expect(maskBody(p,i,keys,1,new Uint8Array([1,0,0,0]))).toEqual({index:[0,1,2,1,2,3],matched:2});
 });
});
