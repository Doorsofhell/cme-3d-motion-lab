import {validateCoachPlan,type CoachPlan} from './coachProtocol';

/** Immutable timing plan; actual duration is resolved from the live motion library. */
export type TimelineClip={id:string;start:number;end:number;speed:number;repetition:number};
export type CoachTimeline={speech:string;discipline:string;duration:number;clips:TimelineClip[]};
export function compileCoachTimeline(plan:CoachPlan,durationOf:(id:string)=>number):CoachTimeline{
 const safe=validateCoachPlan(plan);
 const clips:TimelineClip[]=[];
 let cursor=0;
 for(const step of safe.sequence){
  const raw=durationOf(step.animationId);
  if(!Number.isFinite(raw)||raw<=0||raw>120)throw Error('Invalid duration for '+step.animationId);
  const duration=raw/step.speed;
  for(let i=0;i<step.repetitions;i++){
   clips.push({id:step.animationId,start:cursor,end:cursor+duration,speed:step.speed,repetition:i+1});
   cursor+=duration;
  }
 }
 return {speech:safe.speech,discipline:safe.discipline,duration:cursor,clips};
}
export function clipAt(timeline:CoachTimeline,time:number):TimelineClip|null{
 if(!Number.isFinite(time)||time<0||time>=timeline.duration)return null;
 return timeline.clips.find(c=>time>=c.start&&time<c.end)??null;
}
