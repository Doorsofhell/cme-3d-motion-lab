/** Morphologie artistique harmonisée, pas mesure clinique.
 * Même étendue de réglages homme/femme, coefficients anatomiques distincts.
 * N'altère jamais les curseurs du profil sauvegardé.
 */
export type AnatomicalSex='homme'|'femme';
export type BodyPart='shoulders'|'muscle'|'waist'|'roundness'|'hips'|'glutes'|'thighs'|'arms'|'calves'|'bust';
export type BodyScalars=Record<BodyPart,number>;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:1));
export const LIMITS:Readonly<Record<BodyPart,readonly [number,number]>>={
 shoulders:[.75,1.25],muscle:[.7,1.35],waist:[.75,1.3],
 roundness:[.7,1.3],hips:[.75,1.35],glutes:[.75,1.35],
 thighs:[.75,1.3],arms:[.75,1.3],calves:[.75,1.3],bust:[.75,1.35]
};
export function harmonizeBodyScalars(sex:AnatomicalSex,raw:BodyScalars):BodyScalars{
 const s={...raw};
 for(const key of Object.keys(LIMITS) as BodyPart[]){const [a,b]=LIMITS[key];s[key]=clamp(s[key],a,b);}
 const female=sex==='femme',d=(key:BodyPart)=>s[key]-1;
 const linked:BodyScalars={
  shoulders:s.shoulders+.05*d('muscle')+(female?.025:.045)*d('bust'),
  muscle:s.muscle+.04*d('shoulders'),
  waist:s.waist+(female?.075:.055)*d('roundness')+.03*d('hips'),
  roundness:s.roundness+(female?.075:.055)*d('waist')+.06*d('glutes'),
  hips:s.hips+(female?.16:.08)*d('glutes')+(female?.1:.065)*d('thighs')+.04*d('roundness'),
  glutes:s.glutes+(female?.17:.09)*d('hips')+(female?.10:.065)*d('thighs'),
  thighs:s.thighs+(female?.12:.08)*d('hips')+(female?.10:.06)*d('glutes'),
  arms:s.arms+.07*d('muscle')+.03*d('shoulders'),
  calves:s.calves+.07*d('thighs')+.04*d('muscle'),
  bust:s.bust+(female?.05:.10)*d('muscle')+.03*d('shoulders')
 };
 for(const key of Object.keys(LIMITS) as BodyPart[]){const [a,b]=LIMITS[key];linked[key]=clamp(linked[key],a,b);}
 return linked;
}
