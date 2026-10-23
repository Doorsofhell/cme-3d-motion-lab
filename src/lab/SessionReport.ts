import {useCallback,useRef} from 'react';
import type {TestContext} from './Issues';
import type {AutoIncident} from './AutoIncidents';

export type JournalKind='session'|'navigation'|'coach'|'discipline'|'technique'|'playback'|'style'|'quality'|'outfit'|'debug'|'incident'|'webgl'|'performance'|'error'|'rig';
export type JournalEvent={at:string;kind:JournalKind;message:string;data?:Record<string,unknown>};
export type Metric={fps:number;drawCalls:number;triangles:number;textures:number;geometries:number;webgl:string;dpr:number};
export type JournalState={
 sessionId:string;startedAt:string;events:JournalEvent[];discardedEvents:number;
 readings:number;fpsSum:number;fpsMin:number;fpsMax:number;lowFpsReadings:number;
 samples:Array<{at:string;metrics:Metric}>;discardedSamples:number;lastSampleAt:number;
};
const KEY='cme3d:diagnostics-session:v1';
const MAX_EVENTS=500,MAX_SAMPLES=100;
function fresh():JournalState{
 const at=new Date().toISOString();
 return {sessionId:'cme-'+at.replace(/\W/g,'')+'-'+Math.random().toString(36).slice(2,8),startedAt:at,
  events:[{at,kind:'session',message:'Ouverture du laboratoire CME-3D'}],
  discardedEvents:0,readings:0,fpsSum:0,fpsMin:9999,fpsMax:0,lowFpsReadings:0,
  samples:[],discardedSamples:0,lastSampleAt:0};
}
function read():JournalState{
 try{
  const v=JSON.parse(sessionStorage.getItem(KEY)||'null') as JournalState;
  if(v&&v.sessionId&&Array.isArray(v.events)&&Array.isArray(v.samples))return v;
 }catch{/* sessionStorage can be disabled */}
 return fresh();
}
function save(v:JournalState){
 try{sessionStorage.setItem(KEY,JSON.stringify(v));}catch{/* still available in memory */}
}
export function correlationId(fingerprint:string):string{
 let hash=2166136261;
 for(let i=0;i<fingerprint.length;i++){hash^=fingerprint.charCodeAt(i);hash=Math.imul(hash,16777619);}
 return 'cme-'+(hash>>>0).toString(16).padStart(8,'0');
}
export function appendEvent(state:JournalState,event:JournalEvent):JournalState{
 const events=[...state.events,event];
 const excess=Math.max(0,events.length-MAX_EVENTS);
 return {...state,events:excess?events.slice(excess):events,discardedEvents:state.discardedEvents+excess};
}
export function addReading(state:JournalState,metrics:Metric,at:string):JournalState{
 const fps=Number.isFinite(metrics.fps)?Math.max(0,Math.min(300,metrics.fps)):0;
 const active=fps>0;
 const next={...state,
  readings:state.readings+(active?1:0),fpsSum:state.fpsSum+(active?fps:0),
  fpsMin:active?Math.min(state.fpsMin,fps):state.fpsMin,
  fpsMax:active?Math.max(state.fpsMax,fps):state.fpsMax,
  lowFpsReadings:state.lowFpsReadings+(active&&fps<16?1:0)
 };
 const time=Date.parse(at);
 if(!Number.isFinite(time)||time-state.lastSampleAt<10000)return next;
 const samples=[...state.samples,{at,metrics}],excess=Math.max(0,samples.length-MAX_SAMPLES);
 return {...next,samples:excess?samples.slice(excess):samples,discardedSamples:state.discardedSamples+excess,lastSampleAt:time};
}
function environment(){
 if(typeof window==='undefined')return {};
 const nav=navigator as Navigator&{deviceMemory?:number;connection?:{effectiveType?:string;saveData?:boolean}};
 return {
  browser:navigator.userAgent,language:navigator.language,
  cpuCores:navigator.hardwareConcurrency??'inconnu',deviceMemoryGB:nav.deviceMemory??'non disponible',
  connection:nav.connection??'non disponible',
  online:navigator.onLine,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
  viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
  screen:{width:screen.width,height:screen.height,orientation:screen.orientation?.type??'inconnue'},
  page:location.origin+location.pathname,secureContext:window.isSecureContext
 };
}
export function buildFullReport(state:JournalState,context:TestContext,drafts:AutoIncident[],metrics:Metric,rig:unknown,playback:{playing:boolean;progress:number;speed:number},issues:Array<{number:number;state:string;title:string;url:string}>):string{
 const now=new Date().toISOString();
 const elapsed=Math.max(0,Math.floor((Date.parse(now)-Date.parse(state.startedAt))/1000));
 const fpsMean=state.readings?Math.round(state.fpsSum/state.readings*100)/100:null;
 const groups=state.events.reduce<Record<string,number>>((out,e)=>{out[e.kind]=(out[e.kind]||0)+1;return out;},{});
 const problems=drafts.map(x=>({
  correlation:correlationId(x.fingerprint),category:x.category,title:x.title,description:x.details,
  firstSeen:x.firstSeen,lastSeen:x.lastSeen,occurrences:x.occurrences,contextAtDetection:x.context
 }));
 const timeline=state.events.map((event,i)=>({
  event:i+state.discardedEvents+1,absolute:event.at,
  secondsSinceStart:Math.round((Date.parse(event.at)-Date.parse(state.startedAt))/100)/10,
  type:event.kind,message:event.message,details:event.data??null
 }));
 const info={
  schema:'CME3D_DIAGNOSTIC_1',extractedAt:now,sessionId:state.sessionId,
  startedAt:state.startedAt,durationSeconds:elapsed,
  environment:environment(),contextAtExport:context,playbackAtExport:playback,rigAtExport:rig,
  performance:{
   current:metrics,minimumFPS:state.readings?state.fpsMin:null,averageFPS:fpsMean,
   maximumFPS:state.readings?state.fpsMax:null,readings:state.readings,
   readingsBelow16FPS:state.lowFpsReadings,samples:state.samples,discardedSamples:state.discardedSamples
  },
  eventGroups:groups,chronology:timeline,discardedEvents:state.discardedEvents,
  detectedAnomalies:problems,githubTickets:issues
 };
 const result=[
  'RAPPORT TECHNIQUE EXHAUSTIF CME-3D — DESTINÉ À CHATGPT',
  '========================================================',
  'Ce rapport a été généré localement. Aucune donnée n’a été envoyée automatiquement.',
  'Copier l’intégralité du texte dans la discussion consacrée à CME-3D pour diagnostic et correction.',
  'Une anomalie seulement visuelle doit être expliquée ou montrée en capture/vidéo : elle peut être absente du journal.',
  '',
  'A. SESSION ET CONTEXTE',
  'ID : '+state.sessionId,
  'Début : '+state.startedAt+' ; extraction : '+now+' ; durée : '+elapsed+' secondes',
  'Coach : '+context.actor+' ; discipline : '+context.discipline+' ; tenue : '+context.outfit,
  'Technique : '+context.technique+' ; rendu : '+context.renderStyle+' ; qualité : '+context.quality,
  'Lecture : '+(playback.playing?'en cours':'arrêtée')+' ; vitesse : '+playback.speed+' ; position : '+Math.round(playback.progress*100)+' %',
  'Événements conservés : '+state.events.length+' ; événements anciens omis : '+state.discardedEvents,
  '',
  'B. MESURES 3D ET PERFORMANCES PENDANT LA SESSION',
  'FPS actuel : '+metrics.fps+' ; moyen : '+(fpsMean??'inconnu')+' ; minimum : '+(state.readings?state.fpsMin:'inconnu')+' ; maximum : '+(state.readings?state.fpsMax:'inconnu'),
  'Mesures FPS sous 16 : '+state.lowFpsReadings+' sur '+state.readings,
  'WebGL : '+metrics.webgl+' ; draw calls : '+metrics.drawCalls+' ; triangles : '+metrics.triangles,
  'Textures : '+metrics.textures+' ; géométries : '+metrics.geometries+' ; DPR : '+metrics.dpr,
  '',
  'C. ANOMALIES DÉTECTÉES ET IDENTIFIANTS DE RAPPROCHEMENT',
  ...(problems.length?problems.flatMap((p,i)=>[
    (i+1)+'. ['+p.correlation+'] '+p.title+' ('+p.category+')',
    'Première détection : '+p.firstSeen+' ; dernière : '+p.lastSeen+' ; occurrences : '+p.occurrences,
    'Description : '+p.description,
    'Contexte au moment du défaut : '+JSON.stringify(p.contextAtDetection)
  ]):['Aucune erreur interceptée automatiquement pendant le test.']),
  '',
  'D. TICKETS GITHUB CONNUS',
  ...(issues.length?issues.map(t=>'Ticket #'+t.number+' ['+t.state+'] '+t.title+' '+t.url):['Aucun ticket rapproché au moment de la copie.']),
  '',
  'E. CHRONOLOGIE DÉTAILLÉE DEPUIS LE DÉBUT DU TEST',
  ...timeline.map(e=>'#'+e.event+' à '+e.absolute+' (+'+e.secondsSinceStart+' s) ['+e.type+'] '+e.message+(e.details?' — '+JSON.stringify(e.details):'')),
  '',
  'F. JSON INTÉGRAL POUR ANALYSE TECHNIQUE',
  '~~~json',JSON.stringify(info,null,2),'~~~',
  '',
  'INSTRUCTIONS CHATGPT : rechercher les causes à partir de cette chronologie, du contexte et du dépôt CME-3D ;',
  'faire les corrections, exécuter les tests et expliquer le résultat. Mettre à jour les tickets GitHub correspondants ;',
  'ne jamais déclarer la correction terminée sans validation et publication. Ne traiter aucun autre projet.'
 ];
 return result.join('\n');
}
export function useSessionJournal(){
 const state=useRef<JournalState>(read());
 const record=useCallback((kind:JournalKind,message:string,data?:Record<string,unknown>)=>{
  state.current=appendEvent(state.current,{at:new Date().toISOString(),kind,message,data});
  save(state.current);
 },[]);
 const measure=useCallback((metrics:Metric)=>{
  const previous=state.current.lastSampleAt;
  state.current=addReading(state.current,metrics,new Date().toISOString());
  if(state.current.lastSampleAt!==previous)save(state.current);
 },[]);
 const snapshot=useCallback(()=>state.current,[]);
 return {record,measure,snapshot};
}
