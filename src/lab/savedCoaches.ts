import type {CoachLook} from './StudioCoach';
export const COACH_STORAGE_KEY='cme-3d-coaches-v1';
export type SavedCoach={id:string;name:string;createdAt:string;look:CoachLook};
export function readSavedCoaches(storage:Pick<Storage,'getItem'>):SavedCoach[]{
 try{
  const data=JSON.parse(storage.getItem(COACH_STORAGE_KEY)??'[]') as unknown;
  if(!Array.isArray(data))return [];
  return data.filter((x):x is SavedCoach=>typeof x==='object'&&x!==null&&typeof x.id==='string'&&typeof x.name==='string'&&typeof x.look==='object'&&x.look!==null).slice(0,24);
 }catch{return [];}
}
export function addSavedCoach(storage:Pick<Storage,'getItem'|'setItem'>,coach:SavedCoach):SavedCoach[]{
 const result=[coach,...readSavedCoaches(storage).filter(x=>x.id!==coach.id)].slice(0,24);
 storage.setItem(COACH_STORAGE_KEY,JSON.stringify(result));
 return result;
}
