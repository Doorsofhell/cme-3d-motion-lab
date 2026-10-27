import {describe,it,expect} from 'vitest';
import {studioTechniqueCatalog,studioMotionOptions} from './studioTechniqueCatalog';
import {LAB_DISCIPLINES} from './NeutralRig';
describe('Studio Coach — catalogue réel de techniques et d’enchaînements',()=>{
 it('liste techniques et enchaînements pour les six disciplines sans saisir d’identifiant libre',()=>{
  for(const discipline of LAB_DISCIPLINES){
   const list=studioTechniqueCatalog(discipline);
   expect(list.length).toBeGreaterThan(3);
   expect(list.some(x=>x.kind==='technique')).toBe(true);
   expect(list.some(x=>x.kind==='sequence')).toBe(true);
   expect(list.find(x=>x.id==='garde')?.kind).toBe('technique');
   expect(new Set(list.map(x=>x.id)).size).toBe(list.length);
  }
 });
 it('rattache la boxe au catalogue historique code boxe et non boxing',()=>{
  const entries=studioTechniqueCatalog('boxing');
  expect(entries.some(x=>x.id==='jab')).toBe(true);
  expect(entries.some(x=>x.kind==='sequence'&&x.motions.includes('jab'))).toBe(true);
 });
 it('désactive les suites incomplètes au lieu de les jouer avec une garde de secours',()=>{
  const entries=studioTechniqueCatalog('boxing');
  const list=studioMotionOptions(entries,id=>id==='garde'||id==='jab');
  expect(list.find(x=>x.id==='garde')?.supported).toBe(true);
  expect(list.filter(x=>x.kind==='sequence'&&x.motions.some(m=>m!=='garde'&&m!=='jab')).every(x=>!x.supported)).toBe(true);
 });
});
