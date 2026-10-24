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
 it('verifies all 86 authored techniques and 43 sequences against their own discipline',()=>{
  expect(techniques).toHaveLength(86);
  const disciplines=['boxe','kickboxing','muaythai','mma','bjj','judo'];
  expect(new Set(techniques.map(t=>t.motion)).size).toBe(86);
  for(const d of disciplines){
   const ids=new Set(techniques.filter(t=>t.disciplines.includes(d)).map(t=>t.motion));
   for(const sequence of sequences.filter(s=>s.discipline===d)){
    expect(sequence.motions.every(id=>ids.has(id)),`${d}: ${sequence.id}`).toBe(true);
   }
  }
 });
 it('rejects a movement belonging to another discipline even when it exists globally',()=>{
  const bjjOnly=techniques.find(t=>t.disciplines.includes('bjj')&&!t.disciplines.includes('boxe'));
  expect(bjjOnly).toBeDefined();
  const injected=[{id:'invalid-boxe',name:'invalid',discipline:'boxe',motions:['jab',bjjOnly!.motion],status:'experimental_not_biomechanically_validated'}];
  expect(compatibleSequences(injected,'boxe',()=>true)).toHaveLength(0);
 });
 it('rejects oversized combinations despite valid movement identifiers',()=>{
  const injected=[{id:'long-boxe',name:'long',discipline:'boxe',motions:Array(21).fill('jab') as string[],status:'experimental_not_biomechanically_validated'}];
  expect(compatibleSequences(injected,'boxe',()=>true)).toHaveLength(0);
 });
 it('préserve le statut expérimental et interdit la certification implicite',()=>{
  expect(sequences.every(x=>x.status==='experimental_not_biomechanically_validated')).toBe(true);
 });
});
