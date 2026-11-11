import {describe,it,expect} from 'vitest';
import {shadowImportReadiness,shadowStressCandidates} from './shadowImport';

describe('Shadow exercise compatibility diagnostics',()=>{
 it('returns all source entries without mutating their sequence',()=>{
  const entries=shadowImportReadiness();
  expect(entries).toHaveLength(208);
  expect(entries[0].exercise.motions).toEqual(['garde']);
 });
 it('flags missing motions and does not label incomplete imports ready',()=>{
  const entries=shadowImportReadiness();
  expect(entries.some(x=>!x.ready&&x.missing.length>0)).toBe(true);
  expect(entries.every(x=>x.ready=== (x.missing.length===0))).toBe(true);
 });
 it('prioritizes playable stress cases and preserves complex sequence length',()=>{
  const candidates=shadowStressCandidates();
  expect(candidates).toHaveLength(20);
  expect(candidates.every(x=>x.complexity>=2)).toBe(true);
  const firstUnavailable=candidates.findIndex(x=>!x.ready);
  if(firstUnavailable>=0)expect(candidates.slice(firstUnavailable).every(x=>!x.ready)).toBe(true);
 });
});
