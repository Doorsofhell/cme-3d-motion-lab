import type {CoachLook} from './StudioCoach';
import {harmonizeBodyScalars,type BodyScalars} from './anatomicalHarmony';
export type Handedness='right'|'left';
export type CoachDimensions=Pick<CoachLook,'sex'|'height'|'shoulders'|'muscle'|'waist'|'roundness'|'hips'|'glutes'|'thighs'|'arms'|'calves'|'bust'>;
/** Art-directed BMI proxy, not a diagnostic or verified anthropometric model.
 * Female and male source GLBs are independent; the saved sliders stay intact.
 */
const clamp=(x:number,a:number,b:number)=>Math.min(b,Math.max(a,x));
export function resolvedProportions(look:CoachLook,heightCm?:number,weightKg?:number):CoachDimensions{
 const female=look.sex==='femme',baseHeight=female?165:175,baseWeight=female?63:77;
 const h=heightCm&&Number.isFinite(heightCm)&&heightCm>=100&&heightCm<=250?heightCm:baseHeight*look.height;
 const w=weightKg&&Number.isFinite(weightKg)&&weightKg>=25&&weightKg<=300?weightKg:baseWeight;
 const fullness=clamp((w/(h/100)**2)/(baseWeight/(baseHeight/100)**2),.6,1.7)-1;
 const values:BodyScalars={
  shoulders:look.shoulders+fullness*(female?.055:.105),
  muscle:look.muscle+fullness*(female?.055:.075),
  waist:look.waist+fullness*(female?.16:.24),
  roundness:look.roundness+fullness*(female?.18:.11),
  hips:look.hips+fullness*(female?.18:.10),
  glutes:look.glutes+fullness*(female?.17:.085),
  thighs:look.thighs+fullness*(female?.17:.115),
  arms:look.arms+fullness*(female?.07:.11),
  calves:look.calves+fullness*(female?.105:.085),
  bust:look.bust+fullness*(female?.08:.075)
 };
 return {sex:look.sex,height:clamp(h/baseHeight,.9,1.1),...harmonizeBodyScalars(look.sex,values)};
}
export const handLabel=(hand:Handedness)=>hand==='left'?'Gaucher · garde inversée':'Droitier · garde standard';
