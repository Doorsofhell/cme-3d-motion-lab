import {useEffect,useState} from 'react';
import {useFrame} from '@react-three/fiber';
import {AndroidTelemetry,type FpsStatistics} from './androidTelemetry';
import './AndroidDiagnostics.css';

/** Sonde R3F commune, sans setState à chaque image. */
export function AndroidFrameProbe({telemetry}:{telemetry:AndroidTelemetry}){
 useFrame(()=>{if(document.visibilityState==='visible')telemetry.frame(performance.now());});
 return null;
}
const display=(value:number|null,unit:string)=>value===null?'—':value.toLocaleString('fr-FR')+' '+unit;
const phaseLabel=(phase:FpsStatistics['phase'])=>({
 idle:'Prête',warmup:'Chauffe 3D en cours',recording:'Mesure en cours',
 complete:'Mesure complète',interrupted:'Mesure interrompue'
})[phase];

/** Les rapports restent locaux ; seule l'action Copier peut les transmettre au presse-papiers. */
export function AndroidDiagnostics({telemetry,active,context,variant='lab'}:{
 telemetry:AndroidTelemetry;active:boolean;
 context:Record<string,string|number|boolean|null>;variant?:'lab'|'studio';
}){
 const [revision,setRevision]=useState(0);
 const [fallback,setFallback]=useState('');
 const [message,setMessage]=useState('');
 useEffect(()=>{
  const id=window.setInterval(()=>setRevision(v=>v+1),1000);
  const onHidden=()=>{if(document.visibilityState!=='visible')telemetry.interrupt('Onglet navigateur masqué.');};
  document.addEventListener('visibilitychange',onHidden);
  return()=>{window.clearInterval(id);document.removeEventListener('visibilitychange',onHidden);telemetry.interrupt('Scène quittée pendant la mesure.');};
 },[telemetry]);
 useEffect(()=>{if(!active)telemetry.interrupt('Scène non visible pendant la mesure.');},[active,telemetry]);
 const stat=telemetry.statistics();
 const device=()=>{
  const nav=navigator as Navigator&{deviceMemory?:number};
  return {userAgent:nav.userAgent,language:nav.language,cpuCores:nav.hardwareConcurrency??null,
   deviceMemoryGB:nav.deviceMemory??null,viewport:{width:window.innerWidth,height:window.innerHeight,dpr:window.devicePixelRatio},
   screen:{width:window.screen.width,height:window.screen.height}};
 };
 const copy=async()=>{
  const report=telemetry.exportReport(context,device());
  try{
   if(!navigator.clipboard?.writeText)throw Error('Presse-papiers indisponible');
   await navigator.clipboard.writeText(report);
   setMessage('Rapport Android copié localement.');setFallback('');
  }catch{setFallback(report);setMessage('Copie bloquée : sélectionner le rapport ci-dessous.');}
 };
 void revision; // Rafraîchissement d'affichage toutes les secondes, jamais par frame.
 return <details className={`androidDiagnostic androidDiagnostic--${variant}`}>
  <summary>Diagnostic Android · FPS / GLB / WebGL</summary>
  <div className="androidDiagnosticBody">
   <p className="androidDiagnosticHelp">Mesure locale volontaire : 5 s de chauffe + 60 s de rendu, sans caméra ni vidéo. La scène doit rester visible pendant tout le test.</p>
   <div className="androidDiagnosticActions">
    <button type="button" onClick={()=>{telemetry.start(performance.now());setFallback('');setMessage('');setRevision(v=>v+1);}} disabled={!active||stat.phase==='warmup'||stat.phase==='recording'}>
     {stat.phase==='complete'||stat.phase==='interrupted'?'Recommencer la mesure':'Démarrer la mesure 60 s'}
    </button>
    <button type="button" onClick={()=>{void copy();}}>Copier le rapport JSON</button>
   </div>
   <p role="status">État : <strong>{phaseLabel(stat.phase)}</strong> · {stat.measuredSeconds}/60 fenêtres d'une seconde
    {stat.reason&&<span> · {stat.reason}</span>}</p>
   <div className="androidDiagnosticGrid">
    <span>FPS p05 <strong>{display(stat.fpsP05,'FPS')}</strong></span>
    <span>FPS p50 <strong>{display(stat.fpsP50,'FPS')}</strong></span>
    <span>FPS p95 <strong>{display(stat.fpsP95,'FPS')}</strong></span>
    <span>Temps image p95 <strong>{display(stat.frameMsP95,'ms')}</strong></span>
    <span>Images au-delà de 50 ms <strong>{stat.framesOver50ms}</strong></span>
    <span>Images échantillonnées <strong>{stat.frameCount}</strong></span>
   </div>
   <p>GLB initialisations : <strong>{telemetry.loads.length}</strong> · dernier délai : <strong>{telemetry.loads.length?display(telemetry.loads[telemetry.loads.length-1].durationMs,'ms'):'—'}</strong>.</p>
   {telemetry.loads.length>0&&<p className="androidDiagnosticHelp">Dernier modèle : {telemetry.loads[telemetry.loads.length-1].asset} ({telemetry.loads[telemetry.loads.length-1].kind}). Le temps inclut cache, chargement et préparation du rig.</p>}
   <p>WebGL : <strong>{telemetry.contexts.filter(x=>x.kind==='lost').length}</strong> perte(s), <strong>{telemetry.contexts.filter(x=>x.kind==='restored').length}</strong> restauration(s)
    {telemetry.contexts.some(x=>x.recoveryMs!==undefined)&&<> · dernière reprise : {display([...telemetry.contexts].reverse().find(x=>x.recoveryMs!==undefined)?.recoveryMs??null,'ms')}</>}</p>
   {stat.phase!=='complete'&&<p className="androidDiagnosticHelp">Ces statistiques sont provisoires ou incomplètes : ne pas les considérer comme une validation des 30 FPS.</p>}
   {message&&<p role="status">{message}</p>}
   {fallback&&<textarea aria-label="Rapport Android à copier manuellement" readOnly value={fallback} onFocus={e=>e.currentTarget.select()} rows={7}/>}
  </div>
 </details>;
}
