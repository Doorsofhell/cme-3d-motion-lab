import {describe,it,expect} from 'vitest';
import {addSavedCoach,readSavedCoaches,COACH_STORAGE_KEY,coachSourceActor,findSavedCoach} from './savedCoaches';
import {defaultCoachLook} from './StudioCoach';
describe('linked coach library',()=>{
 it('persists coach profiles for the lab and studio with newest first',()=>{
  const data=new Map<string,string>();
  const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};
  addSavedCoach(storage,{id:'one',name:'Coach A',createdAt:'2026-10-24',look:defaultCoachLook});
  addSavedCoach(storage,{id:'two',name:'Coach B',createdAt:'2026-10-24',look:{...defaultCoachLook,sex:'femme'}});
  expect(readSavedCoaches(storage).map(x=>x.name)).toEqual(['Coach B','Coach A']);
  expect(data.has(COACH_STORAGE_KEY)).toBe(true);
 });
 it('handles corrupted storage without breaking lab navigation',()=>{
  expect(readSavedCoaches({getItem:()=>'{bad'})).toEqual([]);
 });
});

describe('laboratory actor link',()=>{
 it('maps coach sex to shipped rig while retaining the same animation engine',()=>{
  const male={id:'m',name:'M',createdAt:'2026-10-24',look:defaultCoachLook};
  const female={...male,id:'f',look:{...defaultCoachLook,sex:'femme' as const}};
  expect(coachSourceActor(male)).toBe('mma-kadir');
  expect(coachSourceActor(female)).toBe('mma-amara');
 });
 it('restores a selected coach from the same shared catalog',()=>{
  const data=new Map<string,string>();
  const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};
  const saved={id:'one',name:'A',createdAt:'2026-10-24',look:defaultCoachLook};
  addSavedCoach(storage,saved);
  expect(findSavedCoach(storage,'one')?.look.sex).toBe('homme');
  expect(findSavedCoach(storage,'missing')).toBeNull();
 });
});
