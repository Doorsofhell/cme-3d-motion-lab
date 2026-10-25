/** Proof of actual 3D pose sampling, never a biomechanical quality score. */
export type ExecutionEvidence={key:string;sampleCount:number;firstMs:number;lastMs:number;maxProgress:number;lastProgress:number};
export const executionKey=(actor:string,discipline:string,coach:string,technique:string)=>
 JSON.stringify([actor,discipline,coach,technique]);
export function recordExecutionSample(previous:ExecutionEvidence|null,key:string,progress:number,nowMs:number):ExecutionEvidence|null{
 if(!key||!Number.isFinite(progress)||progress<0||progress>1||!Number.isFinite(nowMs))return previous;
 if(previous?.key!==key||nowMs<previous.lastMs||nowMs-previous.lastMs>2500){
  return {key,sampleCount:1,firstMs:nowMs,lastMs:nowMs,maxProgress:progress,lastProgress:progress};
 }
 if(nowMs-previous.lastMs<225)return previous;
 return {
  key,sampleCount:Math.min(10000,previous.sampleCount+1),firstMs:previous.firstMs,lastMs:nowMs,
  maxProgress:Math.max(previous.maxProgress,progress),lastProgress:progress
 };
}
/** Requires multiple renderer samples over time, including a late phase of the selected clip. */
export function playbackWasObserved(evidence:ExecutionEvidence|null,key:string):boolean{
 return !!evidence&&evidence.key===key&&evidence.sampleCount>=4&&evidence.lastMs-evidence.firstMs>=900&&evidence.maxProgress>=.75;
}
export type ExecutionState='catalog_incomplete'|'unresolved'|'not_observed'|'sampled';
export function executionState(catalogComplete:boolean,rigResolved:boolean,observed:boolean):ExecutionState{
 if(!catalogComplete)return 'catalog_incomplete';
 if(!rigResolved)return 'unresolved';
 if(!observed)return 'not_observed';
 return 'sampled';
}
