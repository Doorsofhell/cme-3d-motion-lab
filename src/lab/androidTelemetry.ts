/** Instrumentation locale. Ni capture vidéo, ni service externe, ni stockage persistant. */
export type TelemetryPhase='idle'|'warmup'|'recording'|'complete'|'interrupted';
export type LoadKind='initial'|'switch'|'mode'|'retry';
export type LoadEvent={asset:string;kind:LoadKind;durationMs:number;at:string};
export type ContextEvent={kind:'lost'|'restored';at:string;recoveryMs?:number};
export type FpsStatistics={
 phase:TelemetryPhase;reason:string|null;warmupSeconds:number;measuredSeconds:number;
 fpsP05:number|null;fpsP50:number|null;fpsP95:number|null;frameMsP95:number|null;
 framesOver50ms:number;frameCount:number;fpsBuckets:number;complete:boolean;
};
export const TELEMETRY_WARMUP_MS=5000;
export const TELEMETRY_MEASURE_BUCKETS=60;
const round=(n:number)=>Math.round(n*10)/10;
export function percentile(values:number[],p:number):number|null{
 if(values.length===0)return null;
 const sorted=[...values].sort((a,b)=>a-b);
 const rank=Math.min(sorted.length-1,Math.max(0,p)*(sorted.length-1));
 const lower=Math.floor(rank),upper=Math.ceil(rank);
 return sorted[lower]+(sorted[upper]-sorted[lower])*(rank-lower);
}
type PendingLoad={key:string;kind:LoadKind;started:number};
export class AndroidTelemetry{
 readonly scene:'laboratoire'|'studio';
 private phase:TelemetryPhase='idle';
 private reason:string|null=null;
 private warmupUntil=0;
 private startAt=0;
 private bucketStart=0;
 private bucketFrames=0;
 private lastFrame:number|null=null;
 private fpsBuckets:number[]=[];
 private frameMs:number[]=[];
 private over50=0;
 private frames=0;
 private loadPending:PendingLoad|null=null;
 readonly loads:LoadEvent[]=[];
 readonly contexts:ContextEvent[]=[];
 private lostAt:number|null=null;
 constructor(scene:'laboratoire'|'studio'){this.scene=scene;}
 start(now:number):void{
  this.phase='warmup';this.reason=null;this.startAt=now;
  this.warmupUntil=now+TELEMETRY_WARMUP_MS;
  this.bucketStart=this.warmupUntil;this.bucketFrames=0;this.lastFrame=null;
  this.fpsBuckets=[];this.frameMs=[];this.frames=0;this.over50=0;
 }
 interrupt(reason:string):void{
  if(this.phase==='warmup'||this.phase==='recording'){
   this.phase='interrupted';this.reason=reason;
  }
 }
 frame(now:number):void{
  if(this.phase!=='warmup'&&this.phase!=='recording')return;
  if(!Number.isFinite(now))return;
  if(this.lastFrame!==null&&now-this.lastFrame>1500){
   this.interrupt('Interruption du rendu supérieure à 1,5 s ; nouvelle mesure nécessaire.');
   return;
  }
  const gap=this.lastFrame===null?0:now-this.lastFrame;
  this.lastFrame=now;
  if(now<this.warmupUntil)return;
  if(this.phase==='warmup'){
   this.phase='recording';this.bucketStart=now;this.bucketFrames=0;
   return;
  }
  if(gap>0){
   this.frameMs.push(gap);
   if(gap>50)this.over50++;
  }
  this.frames++;
  this.bucketFrames++;
  const elapsed=now-this.bucketStart;
  if(elapsed>=1000){
   this.fpsBuckets.push(this.bucketFrames*1000/elapsed);
   this.bucketFrames=0;this.bucketStart=now;
   if(this.fpsBuckets.length>=TELEMETRY_MEASURE_BUCKETS)this.phase='complete';
  }
 }
 beginLoad(key:string,kind:LoadKind,now:number):void{
  if(!Number.isFinite(now))return;
  this.loadPending={key,kind,started:now};
 }
 finishLoad(key:string,now:number):LoadEvent|null{
  const pending=this.loadPending;
  if(!pending||pending.key!==key||!Number.isFinite(now)||now<pending.started)return null;
  const item:LoadEvent={asset:key,kind:pending.kind,durationMs:Math.round(now-pending.started),at:new Date().toISOString()};
  this.loads.push(item);if(this.loads.length>30)this.loads.shift();
  this.loadPending=null;
  return item;
 }
 recordContextLost(now:number):void{
  if(this.lostAt===null)this.lostAt=now;
  this.contexts.push({kind:'lost',at:new Date().toISOString()});
  if(this.contexts.length>30)this.contexts.shift();
  this.interrupt('Contexte WebGL perdu pendant la mesure.');
 }
 recordContextRestored(now:number):void{
  const recoveryMs=this.lostAt===null?undefined:Math.max(0,Math.round(now-this.lostAt));
  this.contexts.push({kind:'restored',at:new Date().toISOString(),recoveryMs});
  this.lostAt=null;
  if(this.contexts.length>30)this.contexts.shift();
 }
 statistics():FpsStatistics{
  const p05=percentile(this.fpsBuckets,.05);
  const p50=percentile(this.fpsBuckets,.5);
  const p95=percentile(this.fpsBuckets,.95);
  const frame95=percentile(this.frameMs,.95);
  return {phase:this.phase,reason:this.reason,warmupSeconds:TELEMETRY_WARMUP_MS/1000,
   measuredSeconds:this.fpsBuckets.length,fpsP05:p05===null?null:round(p05),
   fpsP50:p50===null?null:round(p50),fpsP95:p95===null?null:round(p95),
   frameMsP95:frame95===null?null:round(frame95),framesOver50ms:this.over50,
   frameCount:this.frames,fpsBuckets:this.fpsBuckets.length,complete:this.phase==='complete'};
 }
 exportReport(context:Record<string,string|number|boolean|null>,device:Record<string,unknown>):string{
  return JSON.stringify({
   schema:'CME3D_ANDROID_TELEMETRY_V1',capturedAt:new Date().toISOString(),
   scene:this.scene,context,device,statistics:this.statistics(),
   fpsBySecond:this.fpsBuckets.map(round),
   glbTimings:this.loads,webglEvents:this.contexts,
   qualifications:[
    'FPS issus de fenêtres glissantes de rendu d’environ une seconde, p50/p95 en ordre croissant.',
    'Mesure complète : 5 s de chauffe puis 60 fenêtres de rendu ; enregistrement local uniquement.',
    'Durées GLB : du déclenchement de la sélection à l’initialisation du rig ; réseau, cache, décodage et React ne sont pas isolés.',
    'Une restauration WebGL observée ne certifie pas le rendu visuel ni une reprise biomécanique.',
    'Aucune comparaison avec Shadow Studio ni mesure d’énergie/GPU matérielle.'
   ]
  },null,2);
 }
}
