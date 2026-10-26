import {TECHNIQUE_BY_ID} from './domain/techniques';
import {EXERCISES} from './domain/exercises';
import type {DisciplineId,Exercise} from './domain/types';
import type {PlanItem} from './plan';
import importedShadowExercises from '../lab/shadowExercises.json';

/** Adaptateur lecture seule : les noms, identifiants et exercices viennent de Shadow ;
 * l'exécution est déléguée exclusivement au moteur biomécanique de CME-3D.
 * Il est interdit de substituer silencieusement 'garde' à une animation absente.
 */
const imported=new Map((importedShadowExercises as Array<{id:string;discipline:string;motions:string[]}>).map(x=>[x.id,x]));
export function shadowExerciseMotionId(item:Pick<PlanItem,'key'|'sequence'>):string|null{
 if(item.sequence.length===1){
  return TECHNIQUE_BY_ID.get(item.sequence[0])?.motion??null;
 }
 const id='shadow-'+item.key;
 const known=imported.get(id);
 const wanted=item.sequence.map(key=>TECHNIQUE_BY_ID.get(key)?.motion??'');
 if(!known||wanted.some(x=>!x)||wanted.length!==known.motions.length||
    wanted.some((m,i)=>m!==known.motions[i]))return null;
 return id;
}
export function shadowItemAvailability(item:Pick<PlanItem,'key'|'sequence'>,available:readonly string[]|null):{motion:string|null;supported:boolean;reason:string}{
 const motion=shadowExerciseMotionId(item);
 if(!motion)return {motion:null,supported:false,reason:'Mouvement Shadow sans équivalent canonique vérifié dans CME-3D'};
 if(!available)return {motion,supported:false,reason:'Chargement de la bibliothèque 3D : disponibilité non vérifiée'};
 if(!available.includes(motion))return {motion,supported:false,reason:'Animation indisponible sur le rig du coach sélectionné'};
 return {motion,supported:true,reason:''};
}
export function shadowExercisesFor(discipline:DisciplineId,level:string):Exercise[]{
 return EXERCISES.filter(x=>x.discipline===discipline&&x.level===level);
}
export const SHADOW_SUPPORTED_DISCIPLINES=['boxe','kickboxing','mma','muaythai','bjj','judo'] as const;
