import rawTechniques from './techniques.json';

/** Safe, deterministic bridge between an LLM response and the CME motion library.
 * No camera, video processing, motion capture or network calls.
 */
type Technique={motion:string;name:string;disciplines:string[]};
const techniques=rawTechniques as Technique[];
export type AnimationStep={animationId:string;speed:number;repetitions:number};
export type CoachPlan={discipline:string;speech:string;sequence:AnimationStep[]};
export const coachSystemPrompt=`Tu es un coach virtuel. Réponds uniquement avec un objet JSON contenant discipline, speech et sequence. Chaque élément de sequence contient animationId, speed et repetitions. Utilise exclusivement les IDs fournis dans le catalogue de la discipline. N'invente jamais d'animation. Aucune caméra, vidéo ni analyse vidéo.`;
export function availableAnimationIds(discipline:string):string[]{
 return techniques.filter(t=>t.disciplines.includes(discipline)).map(t=>t.motion);
}
export function validateCoachPlan(input:unknown):CoachPlan{
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Plan JSON invalide');
 const obj=input as Record<string,unknown>;
 if(typeof obj.discipline!=='string')throw Error('Discipline invalide');
 const allowed=new Set(availableAnimationIds(obj.discipline));
 if(!allowed.size)throw Error('Discipline inconnue');
 if(typeof obj.speech!=='string'||!obj.speech.trim()||obj.speech.length>500)throw Error('Texte TTS invalide');
 if(!Array.isArray(obj.sequence)||obj.sequence.length<1||obj.sequence.length>20)throw Error('Séquence invalide');
 const sequence:AnimationStep[]=obj.sequence.map((raw:unknown)=>{
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Étape invalide');
  const step=raw as Record<string,unknown>;
  if(typeof step.animationId!=='string'||!allowed.has(step.animationId))throw Error('Animation non autorisée : '+String(step.animationId));
  if(typeof step.speed!=='number'||!Number.isFinite(step.speed)||step.speed<.4||step.speed>1.5)throw Error('Vitesse invalide');
  if(typeof step.repetitions!=='number'||!Number.isInteger(step.repetitions)||step.repetitions<1||step.repetitions>20)throw Error('Répétitions invalides');
  return {animationId:step.animationId,speed:step.speed,repetitions:step.repetitions};
 });
 if(sequence.reduce((n,s)=>n+s.repetitions,0)>60)throw Error('Plan trop long');
 return {discipline:obj.discipline,speech:obj.speech,sequence};
}
export function parseCoachPlan(json:string):CoachPlan{return validateCoachPlan(JSON.parse(json));}
export function compileCoachMotionIds(plan:CoachPlan):string[]{
 const safe=validateCoachPlan(plan);
 return safe.sequence.flatMap(step=>Array.from({length:step.repetitions},()=>step.animationId));
}
