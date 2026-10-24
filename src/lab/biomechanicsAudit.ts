import type {Motion} from '../shadow-engine/motion';
import type {Pose,V3} from '../shadow-engine/pose';

export type MotionFinding={motionId:string;keyIndex:number;code:string;detail:string};
const finite=(v:number)=>Number.isFinite(v);
const xyz=(v:V3)=>finite(v.x)&&finite(v.y)&&finite(v.z);
const dist=(a:V3,b:V3)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
/** Catalog-wide static biomechanics audit. Does not use a camera or video. */
export function auditMotion(m:Motion):MotionFinding[]{
 const findings:MotionFinding[]=[];
 const add=(keyIndex:number,code:string,detail:string)=>findings.push({motionId:m.id,keyIndex,code,detail});
 if(m.keys.length<2){add(-1,'KEY_COUNT','Motion requires at least two poses');return findings;}
 let previous=-Infinity;
 for(let i=0;i<m.keys.length;i++){
  const k=m.keys[i],p:Pose=k.pose;
  if(!finite(k.t)||k.t<0||k.t<=previous)add(i,'TIME_ORDER','Non-increasing or invalid key time');
  if(i===0&&k.t!==0)add(i,'TIME_ORIGIN','First key should start at zero');
  if(!xyz(p.hips))add(i,'HIPS_NONFINITE','Non-finite hip position');
  for(const name of ['pelvis','chest','head'] as const){
   const r=p[name];if(!finite(r.yaw)||!finite(r.pitch)||!finite(r.roll))add(i,'ROT_NONFINITE',name);
  }
  for(const name of ['handL','handR'] as const){
   const h=p[name];if(!xyz(h.pos)||!xyz(h.pole)||![h.pron,h.fist,h.wrist??0].every(finite))add(i,'HAND_NONFINITE',name);
   if(h.fist<0||h.fist>1)add(i,'FIST_RANGE',name);
  }
  for(const name of ['footL','footR'] as const){
   const f=p[name];if(f.mode==='ground'){
    if(!xyz(f.ball)||!finite(f.yaw)||!finite(f.heel))add(i,'FOOT_NONFINITE',name);
    if(f.ball.y<-.04)add(i,'GROUND_PENETRATION',name);
   }else if(!xyz(f.ankle)||!xyz(f.pole)||![f.yaw,f.pitch,f.roll].every(finite))add(i,'FOOT_NONFINITE',name);
  }
  if(i>0){
   const before=m.keys[i-1];const dt=k.t-before.t;
   if(dt>0&&dt<.025)add(i,'KEY_INTERVAL','Less than 25ms between poses');
   if(dt>0&&dist(p.hips,before.pose.hips)/dt>4)add(i,'HIP_SPEED','Hip translation exceeds 4 m/s');
  }
  previous=k.t;
 }
 const duration=m.keys[m.keys.length-1].t;
 for(const t of m.impacts)if(!finite(t)||t<0||t>duration)add(-1,'IMPACT_TIME','Impact outside motion duration');
 return findings;
}
export function auditCatalog(motions:Iterable<Motion>):MotionFinding[]{
 const findings:MotionFinding[]=[];
 for(const motion of motions)findings.push(...auditMotion(motion));
 return findings;
}
