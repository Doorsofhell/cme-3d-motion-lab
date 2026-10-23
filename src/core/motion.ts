import {ease,lerp,mix,v3,type Vec3} from './vector';
export type Side='left'|'right';
export type Technique='hook-left'|'hook-right';
export type MartialDiscipline='boxing'|'kickboxing'|'mma'|'muaythai'|'bjj'|'judo';
export interface HandMotion{ offset:Vec3; pole:Vec3 }
export interface MotionFrame{
  progress:number;phase:'guard'|'load'|'strike'|'impact'|'recover';
  hipYaw:number;chestYaw:number;headCounterYaw:number;leadFootYaw:number;
  hands:Record<Side,HandMotion>;plant:{left:boolean;right:boolean};
  contactQuality:'planned-not-validated';
}
type Key={at:number; left:Vec3; right:Vec3; hip:number; chest:number; foot:number};
// Character faces +Z, positive X is the model's left side. Offsets are
// shoulder-relative, normalized for a ~50 cm arm. In guard the fists are held
// at chin height, not at the sternum, with elbows folding outward.
const L=v3(-0.055,0.065,0.275),R=v3(0.055,0.065,0.275);
const keys:readonly Key[]=[
 {at:0,left:L,right:R,hip:0,chest:0,foot:0},
 // Load is small: move the lead elbow out while keeping the face protected.
 {at:.22,left:v3(.015,.065,.235),right:R,hip:-.055,chest:-.075,foot:-.02},
 // Short horizontal hook, fist in front of chin; strike across centreline.
 {at:.58,left:v3(-.20,.05,.37),right:R,hip:.12,chest:.17,foot:.095},
 {at:.68,left:v3(-.21,.05,.375),right:R,hip:.13,chest:.19,foot:.11},
 {at:1,left:L,right:R,hip:0,chest:0,foot:0},
];
function interpolate(t:number):Key{
  let k=0;while(k<keys.length-2&&t>keys[k+1].at)k++;
  const a=keys[k],b=keys[k+1],f=ease((t-a.at)/(b.at-a.at));
  return {at:t,left:mix(a.left,b.left,f),right:mix(a.right,b.right,f),hip:lerp(a.hip,b.hip,f),chest:lerp(a.chest,b.chest,f),foot:lerp(a.foot,b.foot,f)};
}
export function sampleHook(technique:Technique,progress:number):MotionFrame{
  const t=Math.max(0,Math.min(1,progress));const k=interpolate(t);
  const mirror=technique==='hook-right'?-1:1;
  const left=mirror===1?k.left:v3(-k.right.x,k.right.y,k.right.z);
  const right=mirror===1?k.right:v3(-k.left.x,k.left.y,k.left.z);
  // Chin-level guard: keep elbows BELOW the shoulder and near the ribs.
  // During the hook, the lead elbow rises toward the striking fist.
  const lift=t<=.22?0:t<.58?ease((t-.22)/.36):t<.70?1:ease((1-t)/.30);
  const basePole=v3(.22,-.42,.09),strikePole=v3(.38,-.18,.18);
  const punchPole=mix(basePole,strikePole,lift);
  const poleLeft=mirror===1?punchPole:basePole;
  const poleRight=mirror===-1?v3(-punchPole.x,punchPole.y,punchPole.z):v3(-basePole.x,basePole.y,basePole.z);
  return {
    progress:t,phase:t<0.02?'guard':t<0.22?'load':t<0.6?'strike':t<0.69?'impact':'recover',
    hipYaw:k.hip*mirror,chestYaw:k.chest*mirror,headCounterYaw:-k.chest*mirror*0.55,
    leadFootYaw:k.foot*mirror,
    hands:{left:{offset:left,pole:poleLeft},right:{offset:right,pole:poleRight}},
    plant:{left:true,right:true},contactQuality:'planned-not-validated',
  };
}
export const IMPLEMENTED_TECHNIQUES:readonly Technique[]=['hook-left','hook-right'];
