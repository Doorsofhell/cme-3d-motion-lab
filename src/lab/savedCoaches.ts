import type {CoachLook} from './StudioCoach';
export const COACH_STORAGE_KEY='cme-3d-coaches-v1';
export type SavedCoach={id:string;name:string;createdAt:string;look:CoachLook;portrait?:string;nickname?:string;initialDiscipline?:string;heightCm?:number;weightKg?:number;handedness?:'right'|'left';accessories?:('gloves'|'shins')[]};
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

export function coachSourceActor(coach:SavedCoach):'mma-kadir'|'mma-amara'{
 return coach.look.sex==='femme'?'mma-amara':'mma-kadir';
}
export function findSavedCoach(storage:Pick<Storage,'getItem'>,id:string|null):SavedCoach|null{
 return id?readSavedCoaches(storage).find(coach=>coach.id===id)??null:null;
}

export function updateSavedCoach(storage:Pick<Storage,'getItem'|'setItem'>,coach:SavedCoach):SavedCoach[]{
 const current=readSavedCoaches(storage);
 if(!current.some(x=>x.id===coach.id))throw Error('Coach introuvable');
 const result=current.map(x=>x.id===coach.id?coach:x);
 storage.setItem(COACH_STORAGE_KEY,JSON.stringify(result));
 return result;
}
export function deleteSavedCoach(storage:Pick<Storage,'getItem'|'setItem'>,id:string):SavedCoach[]{
 const result=readSavedCoaches(storage).filter(x=>x.id!==id);
 storage.setItem(COACH_STORAGE_KEY,JSON.stringify(result));
 return result;
}

/** Surnom reproductible à partir de l'identité et de la discipline, sans service distant. */
export function suggestCoachNickname(coach:Pick<SavedCoach,'name'|'look'|'initialDiscipline'>,variant=0):string{
 const disciplines:Record<string,string>={boxing:'Poing',kickboxing:'Foudre',mma:'Titan',muaythai:'Tigre',judo:'Roc',bjj:'Serpent'};
 const root=disciplines[coach.initialDiscipline??'']??'Phénix';
 const shape=coach.look.muscle>=1.05?'Acier':coach.look.height>=1.05?'Géant':coach.look.waist<=.9?'Éclair':'Ombre';
 const options=[root+' '+shape,shape+' du Ring',root+' Invincible',shape+' Rouge'];
 const offset=coach.name.split('').reduce((n,c)=>n+c.charCodeAt(0),0);
 return options[(offset+Math.max(0,Math.floor(variant)))%options.length];
}
/** Métadonnées exportables, sans prétendre exporter les assets GLB. */
export function coachIdentityManifest(coach:SavedCoach){
 return {schema:'cme-coach-identity-v1' as const,id:coach.id,name:coach.name,nickname:coach.nickname??null,
  initialDiscipline:coach.initialDiscipline??null,heightCm:coach.heightCm??null,weightKg:coach.weightKg??null,handedness:coach.handedness??'right',accessories:coach.accessories??['gloves','shins'],
  actor:coachSourceActor(coach),look:coach.look};
}
