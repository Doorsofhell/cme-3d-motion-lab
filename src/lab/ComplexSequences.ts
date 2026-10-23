import {blendResolved,type ResolvedPose} from '../shadow-engine/pose';
import {MotionSampler} from '../shadow-engine/motion';
import type {CoachRig} from '../shadow-engine/rig';
import type {MotionLibrary} from '../shadow-engine/library';

export type Sequence = {id:string;name:string;discipline:string;motions:string[];status:string};
export interface SequenceStep {id:string;start:number;end:number;sampler:MotionSampler;duration:number;overlap:number;}
export class SequenceSampler {
 readonly steps:SequenceStep[]=[];
 readonly duration:number;
 constructor(rig:CoachRig,lib:MotionLibrary,motionIds:string[]){
  if(motionIds.length<2||motionIds.length>20)throw Error('Combinaison de 2 à 20 mouvements requise.');
  for(const id of motionIds){
   const motion=lib.get(id);
   if(!motion)throw Error('Mouvement de combinaison introuvable : '+id);
   const sampler=new MotionSampler(rig,motion);
   const previous=this.steps.at(-1);
   const overlap=previous?Math.min(.12,sampler.duration*.18,previous.duration*.18):0;
   const start=previous?previous.end-overlap:0;
   const end=start+sampler.duration;
   this.steps.push({id,start,end,sampler,duration:sampler.duration,overlap});
  }
  this.duration=this.steps.at(-1)?.end??0;
 }
 sample(t:number):ResolvedPose{
  const clamped=Math.max(0,Math.min(this.duration,t));
  let index=0;for(let i=0;i<this.steps.length;i++){if(clamped>=this.steps[i].start)index=i;else break;}
  const current=this.steps[index];
  const from=current.sampler.sample(Math.max(0,Math.min(current.duration,clamped-current.start)));
  if(index>0&&current.overlap>0&&clamped<current.start+current.overlap){
   const previous=this.steps[index-1];
   const to=previous.sampler.sample(Math.max(0,Math.min(previous.duration,clamped-previous.start)));
   const u=(clamped-current.start)/current.overlap;
   return blendResolved(to,from,u*u*(3-2*u));
  }
  return from;
 }
}
export function compatibleSequences<T extends Sequence>(input:T[],discipline:string,hasMotion:(motion:string)=>boolean):T[]{
 return input.filter(s=>s.discipline===discipline&&s.motions.length>=2&&s.motions.every(hasMotion));
}
