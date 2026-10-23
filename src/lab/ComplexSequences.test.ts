import {describe,it,expect} from 'vitest';
import sequences from './complexSequences.json';
import techniques from './techniques.json';
import {compatibleSequences} from './ComplexSequences';
describe('43 enchaînements CME-3D',()=>{
 it('a des identifiants uniques, 6 disciplines, et des gestes exploitables',()=>{
  expect(sequences).toHaveLength(43);
  expect(new Set(sequences.map(x=>x.id)).size).toBe(43);
  expect(new Set(sequences.map(x=>x.discipline)).size).toBe(6);
  expect(sequences.every(x=>x.motions.length>=2&&x.motions.length<=20)).toBe(true);
 });
 it('ne suggère que des techniques déclarées dans le laboratoire',()=>{
  const ids=new Set(techniques.map(x=>x.motion));
  for(const discipline of ['boxe','kickboxing','muaythai','mma','bjj','judo']){
   const selected=compatibleSequences(sequences,discipline,id=>ids.has(id));
   expect(selected.every(x=>x.discipline===discipline&&x.motions.every(id=>ids.has(id)))).toBe(true);
  }
 });
 it('préserve le statut expérimental et interdit la certification implicite',()=>{
  expect(sequences.every(x=>x.status==='experimental_not_biomechanically_validated')).toBe(true);
 });
});
