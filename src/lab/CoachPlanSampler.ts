import {blendResolved,type ResolvedPose} from '../shadow-engine/pose';
import {MotionSampler} from '../shadow-engine/motion';
import type {CoachRig} from '../shadow-engine/rig';
import type {MotionLibrary} from '../shadow-engine/library';
import {compileCoachTimeline,type CoachTimeline} from './coachTimeline';
import type {CoachPlan} from './coachProtocol';

/** Runs validated text-to-animation plans on the existing IK-based Shadow/CME rig. */
export class CoachPlanSampler{
 readonly timeline:CoachTimeline;
 readonly duration:number;
 private readonly samplers:Map<string,MotionSampler>;
 constructor(rig:CoachRig,library:MotionLibrary,plan:CoachPlan){
  const samplers=new Map<string,MotionSampler>();
  this.timeline=compileCoachTimeline(plan,id=>{
   const motion=library.get(id);
   if(!motion)throw Error('Motion unavailable in live rig: '+id);
   const sampler=new MotionSampler(rig,motion);
   samplers.set(id,sampler);
   return sampler.duration;
  });
  this.samplers=samplers;
  this.duration=this.timeline.duration;
 }
 sample(time:number):ResolvedPose{
  const t=Math.max(0,Math.min(this.duration-1e-7,time));
  const clips=this.timeline.clips;
  const index=Math.max(0,clips.findIndex(c=>t<c.end));
  const clip=clips[index];
  const sampler=this.samplers.get(clip.id)!;
  const local=(t-clip.start)*clip.speed;
  const current=sampler.sample(Math.max(0,Math.min(sampler.duration,local)));
  if(index===0)return current;
  const prev=clips[index-1];
  const blendWindow=Math.min(.12,(clip.end-clip.start)*.18,(prev.end-prev.start)*.18);
  if(blendWindow<=0||t>=clip.start+blendWindow)return current;
  const prior=this.samplers.get(prev.id)!;
  const from=prior.sample(prior.duration);
  const u=(t-clip.start)/blendWindow;
  return blendResolved(from,current,u*u*(3-2*u));
 }
}
