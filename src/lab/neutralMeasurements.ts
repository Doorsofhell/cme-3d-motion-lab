import type {CoachLook} from './StudioCoach';

/** Physical measurements seed the silhouette; they do not estimate body composition.
 * Clamped to the supported deformation envelope of the current humanoid GLBs.
 * Manual sliders and presets remain available afterwards.
 */
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function applyBodyMeasurements(look:CoachLook,heightText:string,weightText:string):CoachLook{
 const height=Number(heightText),weight=Number(weightText);
 let next={...look};
 if(heightText.trim()&&Number.isFinite(height)&&height>=100&&height<=250){
  const baseHeightCm=look.sex==='femme'?169:178;
  next.height=clamp(height/baseHeightCm,.9,1.1);
 }
 if(heightText.trim()&&weightText.trim()&&height>=100&&height<=250&&weight>=25&&weight<=300){
  const bmi=weight/(height/100)**2;
  // Deliberately conservative visual envelope; BMI is not a muscle/fat estimator.
  const fullness=clamp((bmi-23)/17,-.65,.85);
  next.waist=clamp(1+fullness*.23,.75,1.3);
  next.roundness=clamp(1+fullness*.18,.7,1.3);
  next.hips=clamp(1+fullness*(look.sex==='femme' ? 0.14 : 0.10),.75,1.35);
  next.thighs=clamp(1+fullness*.12,.75,1.3);
 }
 return next;
}
