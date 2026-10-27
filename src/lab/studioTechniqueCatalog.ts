import techniques from './techniques.json';
import sequences from './complexSequences.json';
import shadowSequences from './shadowExercises.json';

export type StudioDiscipline='boxing'|'kickboxing'|'muaythai'|'mma'|'bjj'|'judo';
export type StudioMotionEntry={id:string;label:string;kind:'technique'|'sequence';motions:string[]};
/** Same versioned catalogs as the Laboratoire, with no Shadow repository edits.
 * A sequence can only be played if every movement exists in the current rig.
 */
const code=(discipline:StudioDiscipline)=>discipline==='boxing'?'boxe':discipline;
export function studioTechniqueCatalog(discipline:StudioDiscipline):StudioMotionEntry[]{
 const target=code(discipline);
 const moves=(techniques as Array<{id:string;name:string;discipline?:string;disciplines:string[];motion:string}>)
  .filter(t=>t.disciplines.includes(target)||t.disciplines.includes(discipline))
  .filter((t,i,all)=>all.findIndex(x=>x.motion===t.motion)===i)
  .map(t=>({id:t.motion,label:t.name,kind:'technique' as const,motions:[t.motion]}));
 const combos=[...sequences,...shadowSequences] as Array<{id:string;name:string;discipline:string;motions:string[]}>;
 const unique=combos.filter(c=>c.discipline===target||c.discipline===discipline)
  .filter((t,i,all)=>all.findIndex(x=>x.id===t.id)===i)
  .filter(t=>t.motions.length>=2)
  .map(t=>({id:t.id,label:t.name,kind:'sequence' as const,motions:t.motions}));
 return [{id:'garde',label:'Garde de base',kind:'technique',motions:['garde']},...moves.filter(t=>t.id!=='garde'),...unique];
}
export function studioMotionOptions<T extends StudioMotionEntry>(entries:T[],available:(id:string)=>boolean):Array<T&{supported:boolean}>{
 return entries.map(entry=>({...entry,supported:entry.motions.every(available)}));
}
