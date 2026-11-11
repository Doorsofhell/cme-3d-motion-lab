import {describe,it,expect} from 'vitest';
import shadowExercises from './shadowExercises.json';
import techniques from './techniques.json';

const disciplines=['boxe','kickboxing','mma','muaythai','bjj','judo'];
const levels=['debutant','intermediaire','avance','expert'];

describe('Shadow read-only exercise import integrity',()=>{
 it('preserves 208 unique source exercises across six disciplines and four levels',()=>{
  expect(shadowExercises).toHaveLength(208);
  expect(new Set(shadowExercises.map(x=>x.id)).size).toBe(208);
  expect(new Set(shadowExercises.map(x=>x.discipline)).size).toBe(6);
  for(const exercise of shadowExercises){
   expect(disciplines).toContain(exercise.discipline);
   expect(levels).toContain(exercise.level);
   expect(exercise.motions.length).toBeGreaterThan(0);
   expect(exercise.status).toBe('imported_from_shadow_unvalidated');
  }
 });
 it('preserves complex expert scenarios including ten-movement Muay Thai and solo grappling',()=>{
  const longest=shadowExercises.filter(x=>x.motions.length>=6);
  expect(longest.length).toBeGreaterThan(0);
  expect(shadowExercises.some(x=>x.discipline==='muaythai'&&x.level==='expert'&&x.motions.length===10)).toBe(true);
  expect(shadowExercises.some(x=>x.discipline==='bjj'&&x.level==='expert'&&x.motions.length>=6)).toBe(true);
  expect(shadowExercises.some(x=>x.discipline==='judo'&&x.level==='expert'&&x.motions.length>=6)).toBe(true);
 });
 it('identifies incompatible motions explicitly instead of silently certifying them',()=>{
  const supported=new Set(techniques.map(t=>t.motion));
  const unresolved=shadowExercises.flatMap(x=>x.motions.filter(id=>!supported.has(id)).map(id=>x.id+':'+id));
  expect(unresolved.length).toBeGreaterThan(0);
  expect(unresolved.some(x=>x.includes('genou-clinch'))).toBe(true);
 });
});
