import {describe,it,expect} from 'vitest';
import {addSavedCoach,readSavedCoaches,COACH_STORAGE_KEY,coachSourceActor,findSavedCoach,updateSavedCoach,deleteSavedCoach,suggestCoachNickname,coachIdentityManifest,CoachStorageFullError} from './savedCoaches';
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

describe('coach editing and deletion',()=>{
 it('edits in place and deletes without duplicating character IDs',()=>{
  const data=new Map<string,string>();
  const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};
  const coach={id:'stable',name:'Initial',createdAt:'2026-10-24',look:defaultCoachLook};
  addSavedCoach(storage,coach);
  updateSavedCoach(storage,{...coach,name:'Updated'});
  expect(readSavedCoaches(storage)).toHaveLength(1);
  expect(readSavedCoaches(storage)[0].name).toBe('Updated');
  deleteSavedCoach(storage,'stable');
  expect(readSavedCoaches(storage)).toEqual([]);
 });
});

describe('identité du coach et préparation export Shadow',()=>{
 it('conserve les anciens profils sans métadonnées',()=>{
  const coach={id:'legacy',name:'Ancien',createdAt:'2026-10-24',look:defaultCoachLook};
  expect(coachIdentityManifest(coach).nickname).toBeNull();
  expect(coachIdentityManifest(coach).weightKg).toBeNull();
 });
 it('génère des surnoms déterministes et modifiables selon discipline',()=>{
  const coach={name:'Amina',look:defaultCoachLook,initialDiscipline:'judo'};
  expect(suggestCoachNickname(coach,0)).toBe(suggestCoachNickname(coach,0));
  expect(suggestCoachNickname(coach,0)).not.toBe(suggestCoachNickname(coach,1));
 });
 it('produit un manifeste identité versionné sans promettre un GLB intégré',()=>{
  const coach={id:'c1',name:'Test',nickname:'Le Roc',initialDiscipline:'judo',heightCm:178,weightKg:80,createdAt:'2026-10-25',look:defaultCoachLook};
  const manifest=coachIdentityManifest(coach);
  expect(manifest.schema).toBe('cme-coach-identity-v1');
  expect(manifest.actor).toBe('mma-kadir');
  expect(manifest.heightCm).toBe(178);
  expect(manifest.nickname).toBe('Le Roc');
 });
});
describe('quota de stockage des coachs',()=>{
 const quota=()=>new DOMException('full','QuotaExceededError');
 const coach=(id:string)=>({id,name:id,createdAt:'2026-10-27',look:{} as never,portrait:'data:image/jpeg;base64,AAAA'});
 it('retire les portraits des anciens coachs puis réessaie',()=>{
  let stored=JSON.stringify([coach('ancien')]),calls=0;
  const storage={getItem:()=>stored,setItem:(_:string,v:string)=>{calls++;if(calls===1)throw quota();stored=v;}};
  const result=addSavedCoach(storage,coach('nouveau'));
  expect(result[0].portrait).toBeDefined();
  expect(result[1].portrait).toBeUndefined();
 });
 it('signale un stockage plein avec une erreur explicite',()=>{
  const storage={getItem:()=>'[]',setItem:()=>{throw quota();}};
  expect(()=>addSavedCoach(storage,coach('x'))).toThrow(CoachStorageFullError);
 });
});
