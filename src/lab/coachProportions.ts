import type {CoachLook} from './StudioCoach';
export type Handedness='right'|'left';
export type CoachDimensions=Pick<CoachLook,'sex'|'height'|'shoulders'|'muscle'|'waist'|'roundness'|'hips'|'thighs'|'bust'>;
/**
 * Artist-guided normalized anthropometric proxy, not a medical/body-scan fit.
 * Preserve a single waist/hip/thigh/chest envelope; no independent mesh scaling.
 * The slider values are personal offsets on top of a consistent whole-body baseline.
 */
const clamp=(x:number,a:number,b:number)=>Math.min(b,Math.max(a,x));
export function resolvedProportions(look:CoachLook,heightCm?:number,weightKg?:number):CoachDimensions{
 const baseHeight=look.sex==='femme'?165:175,baseWeight=look.sex==='femme'?63:77;
 const h=heightCm&&Number.isFinite(heightCm)&&heightCm>=100&&heightCm<=250?heightCm:baseHeight*look.height;
 const w=weightKg&&Number.isFinite(weightKg)&&weightKg>=25&&weightKg<=300?weightKg:baseWeight;
 const massRatio=clamp((w/(h/100)**2)/(baseWeight/(baseHeight/100)**2),.6,1.7);
 const fullness=massRatio-1;
 return {
  sex:look.sex,
  height:clamp(h/baseHeight,.9,1.1),
  shoulders:clamp(look.shoulders+fullness*.095,.75,1.25),
  muscle:clamp(look.muscle+fullness*.07,.7,1.35),
  waist:clamp(look.waist+fullness*.25,.75,1.3),
  roundness:clamp(look.roundness+fullness*.16,.7,1.3),
  hips:clamp(look.hips+fullness*.17,.75,1.35),
  thighs:clamp(look.thighs+fullness*.16,.75,1.3),
  bust:clamp(look.bust+fullness*.09,.75,1.35)
 };
}
export const handLabel=(hand:Handedness)=>hand==='left'?'Gaucher · garde inversée':'Droitier · garde standard';
