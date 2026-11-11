import shadowExercises from './shadowExercises.json';
import techniques from './techniques.json';

export type ShadowExercise=typeof shadowExercises[number];
export type ImportReadiness={exercise:ShadowExercise;missing:string[];ready:boolean;complexity:number};
const available=new Set(techniques.map(t=>t.motion));

/** Immutable projection of the vendored Shadow catalogue. Never writes to Shadow. */
export function shadowImportReadiness(exercises:readonly ShadowExercise[]=shadowExercises):ImportReadiness[]{
 return exercises.map(exercise=>{
  const missing=[...new Set(exercise.motions.filter(id=>!available.has(id)))];
  return {exercise,missing,ready:missing.length===0,complexity:exercise.motions.length};
 });
}

/** Stable test cases: complex sequences first, then longer expert chains. */
export function shadowStressCandidates(limit=20):ImportReadiness[]{
 return shadowImportReadiness()
  .filter(entry=>entry.complexity>=2)
  .sort((a,b)=>Number(b.ready)-Number(a.ready)||b.complexity-a.complexity||a.exercise.id.localeCompare(b.exercise.id))
  .slice(0,limit);
}
