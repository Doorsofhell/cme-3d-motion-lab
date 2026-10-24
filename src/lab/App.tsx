import {Suspense,Component,useCallback,useEffect,useMemo,useRef,useState,type ReactNode,type RefObject} from 'react';
import {Canvas,useThree,useFrame} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {ACESFilmicToneMapping,NeutralToneMapping,SRGBColorSpace,CanvasTexture} from 'three';
import {Fighter} from './Fighter';
import {StudioCoach} from './StudioCoach';
import {ShadowCatalogPanel} from './ShadowCatalogPanel';
import {readSavedCoaches,findSavedCoach,coachSourceActor,type SavedCoach} from './savedCoaches';
import type {CoachLook} from './StudioCoach';
import {parseCoachPlan,type CoachPlan} from './coachProtocol';
import {CME_APP_VERSION} from './buildInfo';
import {captureFighterImage} from './Screenshot';
import {watchWebGLContext} from './webglRecovery';
import rawTechniques from './techniques.json';
import rawSequences from './complexSequences.json';
import shadowExercises from './shadowExercises.json';
import {ComparisonPanel} from './ComparisonPanel';
import {fighterRoster} from './fighterRoster';
import {VersionsPanel} from './VersionsPanel';
import {IncidentReporter,IssueTracker,useKnownIssues,type TestContext} from './Issues';
import {unresolvedDrafts} from './IssueLinks';
import {buildFullReport,useSessionJournal} from './SessionReport';
import {useAutoIncidentQueue,type AutoCategory} from './AutoIncidents';
import {autoClearEnabled,setAutoClearEnabled,clearApplicationCache} from './cachePolicy';
import './style.css';

function SavedCoachLibrary({openCoach,editCoach,selectedId}:{openCoach:(id:string)=>void;editCoach:(id:string)=>void;selectedId:string|null}){
 const [coaches,setCoaches]=useState<SavedCoach[]>(()=>{try{return readSavedCoaches(localStorage);}catch{return [];}});
 useEffect(()=>{const refresh=()=>{try{setCoaches(readSavedCoaches(localStorage));}catch{setCoaches([]);}};window.addEventListener('cme-coaches-changed',refresh);return()=>window.removeEventListener('cme-coaches-changed',refresh);},[]);
 return <section className="savedCoachLibrary" aria-label="Coachs créés"><h3>Mes coachs ({coaches.length})</h3>{coaches.length===0?<p>Créez votre premier coach dans Studio Coach. Il apparaîtra ici.</p>:<div className="savedCoachItems">{coaches.map(c=><div key={c.id} className="savedCoachEntry"><button aria-pressed={selectedId===c.id} onClick={()=>openCoach(c.id)}><strong>{c.name}{selectedId===c.id?' ✓':''}</strong><small>{c.look.sex} · Tester les mouvements</small></button><button type="button" onClick={()=>editCoach(c.id)}>Modifier {c.name}</button></div>)}</div>}<small>Sélectionnez un coach pour le faire exécuter les mouvements du Laboratoire. Morphologie et équipements personnalisés : rendu encore partiel.</small></section>;
}
type Actor='mma-kadir'|'mma-amara'|'mma-naira';
type TechniqueEntry={id:string;name:string;category:string;disciplines:string[];motion:string};
const techniques=(rawTechniques as TechniqueEntry[]).filter((t,i,a)=>a.findIndex(x=>x.motion===t.motion)===i);
type SequenceEntry={id:string;name:string;discipline:string;motions:string[];status:string};
const sequences=[...(rawSequences as SequenceEntry[]),...(shadowExercises as SequenceEntry[])];
const categories:Record<string,string>={garde:'Gardes',deplacement:'Déplacements',poing:'Poings',defense:'Défenses',pied:'Pieds',genou:'Genoux',coude:'Coudes',clinch:'Clinch',feinte:'Feintes',lutte:'Lutte',sol:'Sol',chute:'Chutes',projection:'Projections'};
type Metrics={fps:number;drawCalls:number;triangles:number;textures:number;geometries:number;webgl:string;dpr:number};
const emptyMetrics:Metrics={fps:0,drawCalls:0,triangles:0,textures:0,geometries:0,webgl:'Initialisation',dpr:1};
export type Quality='performance'|'balanced'|'detail';
export type RenderStyle='ultra'|'fitness'|'comic';
export type Playback={progress:number;playing:boolean;speed:number};
export type RigReport={bones:number;armClamps:number;footErrorMetres:number;techniqueFound:boolean;source:string};
const mobile=()=>typeof window!=='undefined'&&(window.matchMedia('(max-width:780px)').matches||/Android|iPhone/i.test(navigator.userAgent));
const disciplines=[['boxe','Boxe anglaise'],['kickboxing','Kick-boxing'],['mma','MMA'],['muaythai','Muay-thaï'],['bjj','BJJ'],['judo','Judo']] as const;
class ErrorBoundary extends Component<{children:ReactNode;onError:(message:string)=>void},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(e:Error){this.props.onError(e.message||'Erreur 3D');}
 render(){return this.state.failed?null:this.props.children;}
}
/** Subtle fake contact shadow: one plane rather than an expensive shadow-map on Android. */
function StudioContact({renderStyle}:{renderStyle:RenderStyle}){
 const texture=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
  const context=canvas.getContext('2d');
  if(context){
   const gradient=context.createRadialGradient(64,64,0,64,64,63);
   gradient.addColorStop(0,'rgba(0,0,0,.55)');
   gradient.addColorStop(.23,'rgba(0,0,0,.42)');
   gradient.addColorStop(.56,'rgba(0,0,0,.14)');
   gradient.addColorStop(1,'rgba(0,0,0,0)');
   context.fillStyle=gradient;context.fillRect(0,0,128,128);
  }
  return new CanvasTexture(canvas);
 },[]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh rotation={[-Math.PI/2,0,0]} position={[0,.007,0]}>
  <planeGeometry args={[2.15,1.40]}/>
  <meshBasicMaterial map={texture} transparent opacity={renderStyle==='fitness'?.38:.52} depthWrite={false} toneMapped={false}/>
 </mesh>;
}
function Lights({quality,renderStyle}:{quality:Quality;renderStyle:RenderStyle}){
 const {gl}=useThree();
 const fitness=renderStyle==='fitness';
 const comic=renderStyle==='comic';
 useEffect(()=>{
  gl.outputColorSpace=SRGBColorSpace;
  gl.toneMapping=fitness?ACESFilmicToneMapping:NeutralToneMapping;
  gl.toneMappingExposure=fitness?1.04:comic?1.0:1.12;
 },[gl,fitness,comic]);
 return <>
  <hemisphereLight args={fitness?['#fffdf5','#e4e6e7',1.5]:comic?['#d9e4ff','#1a2642',0.64]:['#fffaf4','#919aa2',1.42]}/>
  <directionalLight position={[2.1,3.7,3.3]} intensity={fitness?1.65:comic?2.35:2.05}
   color={fitness?'#ffffff':'#fff7f1'} castShadow={quality==='detail'&&!mobile()} shadow-mapSize={[1024,1024]}/>
  <directionalLight position={[-3.1,1.8,2.2]} intensity={fitness?.78:comic?.12:.83} color={fitness?'#ffffff':'#cadff3'}/>
  <directionalLight position={[0.8,2.6,-2.6]} intensity={fitness?.64:comic?.18:1.20} color={fitness?'#f4f8fa':'#f2f5ff'}/>
  <directionalLight position={[-1,4.5,-1]} intensity={fitness?.25:comic?.06:.33} color="#fff6ea"/>
  <directionalLight position={[.3,1.8,4.5]} intensity={fitness?.25:comic?.06:.36} color="#f9fbfc"/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.013,0]} receiveShadow>
   <planeGeometry args={[8,8]}/>
   <meshStandardMaterial color={fitness?'#d7dce0':comic?'#151c31':'#313940'} roughness={1} metalness={0}/>
  </mesh>
  <StudioContact renderStyle={renderStyle}/>
 </>;
}
function PerfProbe({onMetrics}:{onMetrics:(metrics:Metrics)=>void}){
 const {gl}=useThree();
 const sample=useRef({frames:0,seconds:0});
 useFrame((_,dt)=>{
  sample.current.frames++;
  sample.current.seconds+=Math.min(dt,.2);
  if(sample.current.seconds<1)return;
  const ctx=gl.getContext();
  const webgl=(typeof WebGL2RenderingContext!=='undefined'&&ctx instanceof WebGL2RenderingContext)?'WebGL 2':'WebGL 1';
  onMetrics({fps:Math.round(sample.current.frames/sample.current.seconds),drawCalls:gl.info.render.calls,triangles:gl.info.render.triangles,
   textures:gl.info.memory.textures,geometries:gl.info.memory.geometries,webgl,dpr:gl.getPixelRatio()});
  sample.current.frames=0;sample.current.seconds=0;
 });
 return null;
}
function Viewer({actor,discipline,technique,coachPlan,quality,renderStyle,playback,skeleton,onReport,onMetrics,onLog,onIncident,onCaptureReady,coachLook}:{
 actor:Actor;discipline:string;technique:string;coachPlan:CoachPlan|null;quality:Quality;renderStyle:RenderStyle;
 playback:RefObject<Playback>;skeleton:boolean;coachLook?:CoachLook|null;onReport:(r:RigReport)=>void;onMetrics:(m:Metrics)=>void;onLog:(message:string)=>void;onIncident:(category:AutoCategory,title:string,details:string)=>void;onCaptureReady:(capture:()=>string|null)=>void;
}){
 const [ready,setReady]=useState(false),[error,setError]=useState<string|null>(null),[slow,setSlow]=useState(false);
 const [retry,setRetry]=useState(0);
 const canvasRef=useRef<(HTMLCanvasElement & {cmeCleanup?:()=>void})|null>(null);
 const captureContext=useRef({actor,discipline,technique,renderStyle});
 captureContext.current={actor,discipline,technique,renderStyle};
 useEffect(()=>{setReady(false);setSlow(false);},[actor,discipline,renderStyle]);
 // Timeout never appears once a coach is ready.
 useEffect(()=>{
  if(ready||error)return;
  const id=window.setTimeout(()=>{setSlow(true);onIncident('loading','Chargement 3D anormalement long','Coach '+actor+', tenue '+discipline+' : aucun signal de fin de chargement après 24 secondes');},24000);
  return()=>window.clearTimeout(id);
 },[ready,error,retry,actor,discipline,onIncident]);
 const onReady=useCallback(()=>{setReady(true);setSlow(false);onLog('Coach et tenue décodés, rig initialisé');},[onLog]);
 // Retain one GPU context when users change render style, coach or outfit.
 const gl=useMemo(()=>({alpha:false,antialias:!mobile(),powerPreference:'default' as const}),[]);
 const onCreated=useCallback(({gl:renderer,scene:argumentsScene,camera:argumentsCamera}:Parameters<NonNullable<React.ComponentProps<typeof Canvas>['onCreated']>>[0])=>{
  const canvas=renderer.domElement;
  onCaptureReady(()=>{const current=captureContext.current;return captureFighterImage(canvas,()=>{renderer.render(argumentsScene,argumentsCamera);},{
   actor:current.actor==='mma-amara'?'Amara':current.actor==='mma-naira'?'Naïra (prototype cloné)':'Kadir',discipline:current.discipline,technique:current.technique,
   renderStyle:current.renderStyle,progress:playback.current.progress
  });});
  canvasRef.current?.cmeCleanup?.();
  const activeCanvas=canvas as HTMLCanvasElement & {cmeCleanup?:()=>void};
  canvasRef.current=activeCanvas;
  activeCanvas.cmeCleanup=watchWebGLContext(activeCanvas,{
   onLost:()=>{
    onLog('WebGL perdu pendant l’utilisation : récupération en cours');
    onIncident('webgl','Perte du contexte graphique WebGL','Contexte WebGL perdu pendant une session active');
    setError('Contexte graphique perdu : restauration automatique attendue. Relancer si nécessaire.');
   },
   onRestored:()=>{
    onLog('Contexte WebGL restauré automatiquement');
    setError(v=>v?.startsWith('Contexte graphique perdu')?null:v);
   }
  },()=>canvasRef.current===activeCanvas&&activeCanvas.isConnected);
 },[onLog,onIncident,playback,onCaptureReady]);
 useEffect(()=>()=>{canvasRef.current?.cmeCleanup?.();canvasRef.current=null;},[]);
 const dpr=quality==='performance'?1:quality==='balanced'?(mobile()?1.1:1.35):(mobile()?1.4:1.6);
 return <div className="viewer">
   <ErrorBoundary key={retry} onError={message=>{setError(message);onIncident('javascript','Erreur du composant de rendu 3D',message);}}>
    <Canvas key={retry} gl={gl} onCreated={onCreated} dpr={dpr} shadows={quality==='detail'&&!mobile()} camera={{position:[0,1.54,2.78],fov:34}} frameloop="always">
     <color attach="background" args={[renderStyle==='fitness'?'#e7eeef':renderStyle==='comic'?'#111827':'#1d252c']}/>
     <Lights quality={quality} renderStyle={renderStyle}/>
     <PerfProbe onMetrics={onMetrics}/>

     <Suspense fallback={null}>
      <Fighter actor={actor} outfit={discipline} technique={technique} coachPlan={coachPlan} playback={playback} skeleton={skeleton} quality={quality} renderStyle={renderStyle} onReady={onReady} onReport={onReport} coachLook={coachLook}/>
     </Suspense>
     <OrbitControls target={[0,1,0]} minDistance={1.35} maxDistance={6} enableDamping dampingFactor={.12}/>
    </Canvas>
   </ErrorBoundary>
   {!error&&!ready&&<div className="viewerOverlay" role="status"><span className="spinner"/>Chargement du coach…{slow&&<span className="muted">Le chargement dépasse 24 s. Connexion ou décodage 3D lent.</span>}</div>}
   {error&&<div className="viewerOverlay error" role="alert"><strong>Rendu 3D interrompu</strong><span>{error}</span><button onClick={()=>{setError(null);setReady(false);setSlow(false);setRetry(x=>x+1);}}>↻ Relancer</button></div>}
   {ready&&!error&&<div className="hint" style={{color:renderStyle==='fitness'?'#476677':'#b7cbdb'}}>Glisser : rotation · Pincer : zoom</div>}
 </div>;
}
export function App(){
 const [actor,setActor]=useState<Actor>(()=>{try{const c=findSavedCoach(localStorage,localStorage.getItem('cme-lab-coach'));return c?coachSourceActor(c):'mma-amara';}catch{return 'mma-amara';}});
 const [selectedCoach,setSelectedCoach]=useState<SavedCoach|null>(()=>{try{return findSavedCoach(localStorage,localStorage.getItem('cme-lab-coach'));}catch{return null;}});
 useEffect(()=>{const refresh=()=>{try{setSelectedCoach(findSavedCoach(localStorage,localStorage.getItem('cme-lab-coach')));}catch{setSelectedCoach(null);}};window.addEventListener('cme-coaches-changed',refresh);return()=>window.removeEventListener('cme-coaches-changed',refresh);},[]);
 const selectSavedCoach=(id:string)=>{try{const saved=findSavedCoach(localStorage,id);if(!saved)return;setSelectedCoach(saved);setActor(coachSourceActor(saved));localStorage.setItem('cme-lab-coach',id);setReport(null);setProgress(0);}catch{/* unavailable local storage */}};
 const [discipline,setDiscipline]=useState('boxe');
 const [nogi,setNogi]=useState(false);
 const [technique,setTechnique]=useState('crochet-avant');
 const [coachJson,setCoachJson]=useState(JSON.stringify({discipline:'boxe',speech:'Garde haute, jab puis direct.',sequence:[{animationId:'garde',speed:1,repetitions:1},{animationId:'jab',speed:.8,repetitions:1},{animationId:'direct',speed:.9,repetitions:1}]}));
 const [coachPlan,setCoachPlan]=useState<CoachPlan|null>(null);
 const [coachError,setCoachError]=useState('');
 const [quality,setQuality]=useState<Quality>('balanced');
 const [renderStyle,setRenderStyle]=useState<RenderStyle>('ultra');
 const [skeleton,setSkeleton]=useState(false);
 const [progress,setProgress]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(.5);
 const [report,setReport]=useState<RigReport|null>(null);
 const [extra,setExtra]=useState(false);
 const [moreOpen,setMoreOpen]=useState(false);
 const [stageFullscreen,setStageFullscreen]=useState(false);
 useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setStageFullscreen(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[]);
 const [tab,setTab]=useState<'lab'|'tracking'|'comparison'|'versions'|'options'|'studio'>('lab');
 const [clearCacheOnOpen,setClearCacheOnOpen]=useState(autoClearEnabled);
 const [cacheMessage,setCacheMessage]=useState('');
 const [catalogMode,setCatalogMode]=useState<'techniques'|'sequences'>('techniques');
 const [comparisonSnapshot,setComparisonSnapshot]=useState<string|null>(null);
 const [incidentOpen,setIncidentOpen]=useState(false);
 const [debug,setDebug]=useState(false),[catalogOpen,setCatalogOpen]=useState(false),[query,setQuery]=useState(''),[allCatalog,setAllCatalog]=useState(false);
 const [metrics,setMetrics]=useState<Metrics>(emptyMetrics);
 const [messages,setMessages]=useState<string[]>([]);
 const [reportText,setReportText]=useState('');
 const [snapshot,setSnapshot]=useState<string|null>(null);
 const screenshotHandler=useRef<(()=>string|null)|null>(null);
 const setScreenshotHandler=useCallback((handler:()=>string|null)=>{screenshotHandler.current=handler;},[]);
 const captureNow=useCallback(()=>{const next=screenshotHandler.current?.()??null;setSnapshot(next);return next;},[]);
 const journal=useSessionJournal();
 const known=useKnownIssues();
 const onLog=useCallback((message:string)=>{journal.record(/ERREUR|JS :|PROMISE/i.test(message)?'error':'debug',message);setMessages(a=>[(new Date()).toLocaleTimeString('fr-FR')+'  '+message,...a].slice(0,40));},[journal.record]);
 const outfit=discipline==='bjj'&&nogi?'bjj-nogi':discipline;
 const currentTechniques=useMemo(()=>techniques.filter(t=>t.disciplines.includes(discipline)),[discipline]);
 const currentSequences=useMemo(()=>sequences.filter(t=>t.discipline===discipline),[discipline]);
 const visibleSequences=useMemo(()=>currentSequences.filter(t=>(t.name+' '+t.motions.join(' ')).toLocaleLowerCase('fr-FR').includes(query.toLocaleLowerCase('fr-FR'))),[currentSequences,query]);
 const knownMotions=useMemo(()=>new Set(techniques.map(t=>t.motion)),[]);
 const canRunSequence=(entry:SequenceEntry)=>entry.motions.every(m=>knownMotions.has(m));
 const palette=useMemo(()=>techniques.filter(t=>(allCatalog||t.disciplines.includes(discipline))&&
   ((t.name+' '+t.id+' '+t.category).toLocaleLowerCase('fr-FR').includes(query.toLocaleLowerCase('fr-FR')))),[discipline,query,allCatalog]);
 const onMetrics=useCallback((m:Metrics)=>{journal.measure(m);setMetrics(m);},[journal.measure]);
 const techniqueLabel=techniques.find(t=>t.motion===technique)?.name??sequences.find(x=>x.id===technique)?.name??technique;
 const selectTechnique=(motion:string)=>{journal.record('technique','Technique sélectionnée : '+motion,{previous:technique,discipline,coach:actor});reset();setTechnique(motion);setCatalogOpen(false);onLog('Technique : '+motion);};
 const incidentContext:TestContext={actor:actor==='mma-amara'?'Amara':'Kadir',discipline,outfit,technique,renderStyle,quality,userAgent:navigator.userAgent,diagnostics:JSON.stringify({report,metrics,messages},null,2)};
 const {items:autoDrafts,record:autoRecord,dismiss:autoDismiss,clear:autoClear}=useAutoIncidentQueue(incidentContext,onLog);
 const pendingDrafts=useMemo(()=>unresolvedDrafts(autoDrafts,known.issues),[autoDrafts,known.issues]);
 const playback=useRef<Playback>({progress:0,playing:false,speed:.5});
 const exportReport=useCallback(()=>{
  journal.record('debug','Export du rapport intégral de la session vers ChatGPT');
  const text=buildFullReport(journal.snapshot(),incidentContext,autoDrafts,metrics,report,playback.current,
   known.issues.map(x=>({number:x.number,state:x.state,title:x.title,url:x.html_url})));
  if(navigator.clipboard?.writeText){
   void navigator.clipboard.writeText(text).then(()=>onLog('Rapport complet copié : '+text.length+' caractères'))
    .catch(()=>{setReportText(text);onLog('Presse-papiers indisponible : rapport affiché pour sélection manuelle');});
  }else setReportText(text);
 },[journal.record,journal.snapshot,incidentContext,autoDrafts,metrics,report,known.issues,onLog]);
 useEffect(()=>{
  const fail=(e:ErrorEvent)=>onLog('JS : '+String(e.message).slice(0,180));
  const reject=(e:PromiseRejectionEvent)=>onLog('PROMISE : '+String(e.reason).slice(0,180));
  window.addEventListener('error',fail);window.addEventListener('unhandledrejection',reject);
  return()=>{window.removeEventListener('error',fail);window.removeEventListener('unhandledrejection',reject);};
 },[onLog]);
 playback.current.playing=playing;playback.current.speed=speed;
 const seek=useCallback((p:number)=>{playback.current.progress=p;setProgress(p);},[]);
 const lastRigLogged=useRef('');
 const onReport=useCallback((r:RigReport)=>{setReport(r);const signature=[r.bones,r.techniqueFound,r.source].join('|');if(lastRigLogged.current!==signature){journal.record('rig','Rig analysé : '+r.bones+' os, mouvement '+(r.techniqueFound?'disponible':'introuvable'),{technique,discipline,source:r.source});lastRigLogged.current=signature;}if(!r.techniqueFound)autoRecord('motion','Mouvement indisponible','Aucune animation correspondante : '+technique+' pour la discipline '+discipline);},[autoRecord,technique,discipline,journal.record]);
 useEffect(()=>{if(!playing)return;const i=window.setInterval(()=>setProgress(playback.current.progress),150);return()=>window.clearInterval(i);},[playing]);
 const slowFpsSince=useRef<number|null>(null);
 useEffect(()=>{
  if(!playing||tab!=='lab'||document.visibilityState!=='visible'||metrics.fps<=0||metrics.fps>=16){slowFpsSince.current=null;return;}
  if(slowFpsSince.current===null)slowFpsSince.current=Date.now();
  else if(Date.now()-slowFpsSince.current>=18000){autoRecord('performance','Fréquence d’images insuffisante','Rendu actif sous 16 FPS pendant au moins 18 secondes, mesure récente : '+metrics.fps+' FPS');slowFpsSince.current=null;}
 },[metrics.fps,playing,tab,autoRecord]);
 const reset=()=>{setPlaying(false);seek(0);setReport(null);};
 const openComparison=()=>{
  journal.record('navigation','Ouverture comparatif moteurs 3D',{coach:actor,discipline,technique});
  const captured=screenshotHandler.current?.()??null;
  if(captured)setComparisonSnapshot(captured);
  setTab('comparison');setDebug(false);setCatalogOpen(false);
 };
 return <main className="labApp">
  <header className="labHeader">
   <div className="branding"><span className="brandDot">C</span><div><strong>CME<span>–3D</span> <small>LAB</small> <span className="cmeVersion" aria-label={'Version '+CME_APP_VERSION}>v{CME_APP_VERSION}</span></strong><p>Laboratoire · Tests A/B</p></div></div>
   <div className="headerActions"><span className="liveTag"><i/> Moteur local</span><button className="iconButton" title="Console de débogage" aria-label="Console de débogage" aria-expanded={debug} onClick={()=>setDebug(v=>!v)}>⌘</button><button className="iconButton" title="Réglages avancés" aria-label="Réglages avancés" aria-expanded={extra} onClick={()=>setExtra(v=>!v)}>⚙</button></div>
  </header>
  
  <div className="labContent" style={{display:tab==='lab'?'contents':'none'}}>
  <section className="quickBar" aria-label="Sélection de test">
   <label><span>Coach</span><select aria-label="Coach" value={actor} onChange={e=>{journal.record('coach','Changement de coach : '+actor+' → '+e.target.value);reset();setSelectedCoach(null);try{localStorage.removeItem('cme-lab-coach');}catch{}setActor(e.target.value as Actor);}}>{fighterRoster.map(f=><option key={f.id} value={f.id} disabled={f.status!=='available'&&f.id!=='mma-naira'}>{f.name}{f.status==='in-production'?' · prototype cloné (non validé)':''}</option>)}</select></label>
   <label><span>Discipline</span><select aria-label="Discipline" value={discipline} onChange={e=>{journal.record('discipline','Discipline : '+discipline+' → '+e.target.value,{coach:actor,style:renderStyle});reset();setDiscipline(e.target.value);setTechnique(techniques.find(t=>t.disciplines.includes(e.target.value))?.motion??'garde');onLog('Discipline : '+e.target.value);}}>{disciplines.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
   <label><span>{technique.startsWith('seq-')?'Enchaînement':'Technique'} · {currentTechniques.length}</span><div className="motionSelector"><button type="button" className="catalogButton" aria-label="Choisir une technique" onClick={()=>{setCatalogMode('techniques');setCatalogOpen(true);setQuery('');}}><span>{techniqueLabel}</span><strong>⌕</strong></button><button type="button" className="comboChoose" aria-label="Choisir un enchaînement complexe" onClick={()=>{setCatalogMode('sequences');setCatalogOpen(true);setQuery('');}}>×{currentSequences.length}</button></div></label>
  </section>
  <section className={`stage ${stageFullscreen?"cmeFullscreen":""}`} aria-label="Vue de test 3D" onDoubleClick={()=>setStageFullscreen(v=>!v)}>\n   <button type="button" className="cmeFullscreenToggle" onClick={()=>setStageFullscreen(v=>!v)} aria-label={stageFullscreen?"Quitter le plein écran":"Agrandir le coach"}>{stageFullscreen?"Réduire ✕":"⛶"}</button>
   <div className="stageTitle"><span>{actor==='mma-amara'?'AMARA':'KADIR'} <em>· {renderStyle==='fitness'?'Animation fitness':renderStyle==='comic'?'Roman graphique · héros':'Ultra-réaliste'}</em></span><span className="stagePill">MOTION / IK</span></div>
   {selectedCoach&&<div className="labSelectedCoach" role="status">Coach personnalisé : <strong>{selectedCoach.name}</strong> · {selectedCoach.look.sex} · animations canoniques</div>}
   <Viewer coachLook={selectedCoach?.look??null} actor={actor} coachPlan={coachPlan} discipline={outfit} quality={quality} renderStyle={renderStyle} technique={technique} playback={playback} skeleton={skeleton} onReport={onReport} onMetrics={onMetrics} onLog={onLog} onIncident={autoRecord} onCaptureReady={setScreenshotHandler}/>
   <div className="stageBottom"><span>{report?report.bones+' os · '+(report.techniqueFound?'Technique disponible':'Garde de secours'):'Initialisation du rig'}</span><span>{report?('Tenue '+outfit+' ✓'):'Chargement'}</span></div>
  </section>
  <details className="labTechnicalDetails"><summary>Outils techniques · Coach IA JSON</summary><section aria-label="Coach JSON Text-to-Animation" style={{padding:12,display:'grid',gap:8}}>
<strong>Coach IA · Text-to-Animation (prototype local)</strong>
<textarea aria-label="Plan JSON du coach" rows={4} value={coachJson} onChange={e=>setCoachJson(e.target.value)} style={{width:'100%',boxSizing:'border-box'}}/>
<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
<button onClick={()=>{try{const plan=parseCoachPlan(coachJson);if(plan.discipline!==(outfit==='bjj-nogi'?'bjj':outfit))throw Error('Discipline JSON différente de la discipline sélectionnée');setCoachPlan(plan);setCoachError('');reset();onLog('Plan JSON activé');}catch(e){setCoachError(e instanceof Error?e.message:String(e));}}}>Exécuter le JSON</button>
<button onClick={()=>{setCoachPlan(null);setCoachError('');reset();}}>Revenir au catalogue</button>
</div>
{coachError&&<span role="alert">{coachError}</span>}
{coachPlan&&<span role="status">Plan actif : {coachPlan.sequence.length} étapes · TTS : {coachPlan.speech}</span>}
</section></details>
<section className="transport" aria-label="Commandes d'animation">
   <div className="transportMain"><button className="playButton" onClick={()=>{journal.record('playback',playing?'Pause de l’animation':'Démarrage de l’animation',{technique,progress:playback.current.progress,speed});setPlaying(x=>!x);}}>{playing?'❚❚':'▶'} <span>{playing?'Pause':'Lecture'}</span></button><button className="resetButton" aria-label="Revenir au début" onClick={()=>{journal.record('playback','Retour au début de l’animation',{technique});reset();}}>↺</button>
    <div className="seek"><input aria-label="Position de lecture" type="range" min="0" max="1000" value={Math.round(progress*1000)} onChange={e=>{setPlaying(false);seek(Number(e.target.value)/1000);}} onPointerUp={()=>journal.record('playback','Positionnement manuel de l’animation',{technique,progress:playback.current.progress})}/><span>{Math.round(progress*100)}%</span></div>
    <select aria-label="Vitesse" className="speed" value={speed} onChange={e=>{journal.record('playback','Vitesse modifiée : '+speed+'× → '+e.target.value+'×',{technique});setSpeed(Number(e.target.value));}}><option value={.25}>¼×</option><option value={.5}>½×</option><option value={1}>1×</option></select>
   </div>
   <div className="compareBar">
    <div className="switchGroup" aria-label="Comparaison visuelle"><button className={renderStyle==='ultra'?'active':''} onClick={()=>{journal.record('style','Passage en Ultra-réaliste',{previous:renderStyle});reset();setRenderStyle('ultra');}}>Ultra-réaliste</button><button className={renderStyle==='fitness'?'active':''} onClick={()=>{journal.record('style','Passage en Animation fitness',{previous:renderStyle});reset();setRenderStyle('fitness');}}>Animation fitness</button><button className={renderStyle==='comic'?'active':''} onClick={()=>{journal.record('style','Passage en Roman graphique',{previous:renderStyle});reset();setRenderStyle('comic');}}>Héros comics</button></div>
    <label className="inlineSelect"><span>Qualité</span><select aria-label="Qualité graphique" value={quality} onChange={e=>{journal.record('quality','Qualité graphique '+quality+' → '+e.target.value);reset();setQuality(e.target.value as Quality);}}><option value="performance">Rapide</option><option value="balanced">Auto</option><option value="detail">Détail</option></select></label>
    <label className="checkMini"><input type="checkbox" checked={skeleton} onChange={e=>{journal.record('debug','Squelette '+(e.target.checked?'affiché':'masqué'));setSkeleton(e.target.checked);}}/>Os</label>
    {discipline==='bjj'&&<button className="outfitToggle" aria-label="Changer tenue BJJ" onClick={()=>{journal.record('outfit','BJJ : '+(nogi?'no-gi → gi':'gi → no-gi'));reset();setNogi(x=>!x);}}>{nogi?'No-gi':'Gi'}</button>}
   </div>
  </section>
  <details className="labTechnicalDetails"><summary>Diagnostic et signalement</summary><section className="bottomDebug" aria-label="Debug et incident"><button className="bottomDebugTrigger" onClick={()=>{journal.record('debug',debug?'Fermeture du debug':'Ouverture du debug');setDebug(x=>!x);}} aria-expanded={debug}><span className="debugDot"/> <strong>Debug en direct</strong> <span className="miniMetrics">{metrics.fps||'–'} FPS · {metrics.webgl} · {pendingDrafts.length} à examiner</span><span className="expandSymbol">{debug?'⌃':'⌄'}</span></button><button className="incidentButton" onClick={()=>{journal.record('incident','Ouverture de la déclaration manuelle d’incident',{technique,discipline,actor,progress:playback.current.progress});captureNow();setDebug(false);setIncidentOpen(true);}}>⚑ Signaler</button></section>
  <section className="diagnostics" aria-label="Diagnostics">
   <span><i className={report?.techniqueFound?'good':'bad'}/> {report?.techniqueFound?'Mouvement prêt ✓':'Motion à vérifier'}</span>
   <span>Rig : {report?.bones??'–'} os</span><span>{metrics.fps||'–'} FPS · {metrics.drawCalls} appels</span>
   <span className="footnote">IA locale expérimentale : entraînement validé en attente</span>
  </section></details>
  </div>
  {tab==='lab'&&<ShadowCatalogPanel/>}
  {tab==='lab'&&<SavedCoachLibrary selectedId={selectedCoach?.id??null} openCoach={selectSavedCoach} editCoach={id=>{try{localStorage.setItem('cme-selected-coach',id);}catch{}setTab('studio');}}/>}
  {tab==='studio'&&<StudioCoach/>}
  {tab==='versions'&&<VersionsPanel/>}
  {tab==='options'&&<section className="cmeOptions" aria-label="Options CME-3D">
   <h2>Options du laboratoire</h2>
   <label className="cacheOption"><input type="checkbox" checked={clearCacheOnOpen} onChange={e=>{const enabled=e.target.checked;setClearCacheOnOpen(enabled);setAutoClearEnabled(enabled);setCacheMessage(enabled?'Vidage automatique activé pour chaque ouverture.':'Vidage automatique désactivé.');}}/><span><strong>Vider automatiquement le cache à chaque ouverture</strong><small>Activé par défaut. Supprime les caches CME-3D et désactive son service worker avant le chargement du moteur. Les préférences locales sont conservées.</small></span></label>
   <button className="resetButton" onClick={()=>{void clearApplicationCache().then(({caches,workers})=>setCacheMessage(caches+' cache(s) supprimé(s), '+workers+' service worker(s) désenregistré(s).')).catch(()=>setCacheMessage('Nettoyage impossible dans ce navigateur.'));}}>Vider le cache maintenant</button>
   {cacheMessage&&<p role="status">{cacheMessage}</p>}
  </section>}
  {tab==='tracking'&&<IssueTracker drafts={pendingDrafts} onDismiss={autoDismiss} onClear={autoClear} onCopyReport={exportReport} {...known}/>}
  {tab==='comparison'&&<ComparisonPanel metrics={metrics} report={report} snapshot={comparisonSnapshot} actor={actor==='mma-amara'?'Amara':'Kadir'} discipline={discipline} technique={techniqueLabel} renderStyle={renderStyle} onOpenLab={()=>setTab('lab')} onCopyReport={exportReport}/>}
  {tab==='lab'&&catalogOpen&&<div className="paletteBackdrop" onClick={()=>setCatalogOpen(false)}>
    <section className="catalogPalette" role="dialog" aria-label="Catalogue complet des techniques" onClick={e=>e.stopPropagation()}>
      <div className="paletteTitle"><strong>{catalogMode==='sequences'?'Enchaînements expérimentaux · '+visibleSequences.length:'Techniques · '+palette.length+' / '+techniques.length}</strong><button aria-label="Fermer le catalogue" onClick={()=>setCatalogOpen(false)}>×</button></div>
      <div className="paletteFilters"><input autoFocus aria-label="Rechercher une technique" value={query} onChange={e=>setQuery(e.target.value)} placeholder={catalogMode==='sequences'?'Jab → direct → crochet, lutte, genoux…':'Rechercher jab, crochet, projection…'}/>{catalogMode==='techniques'&&<label><input type="checkbox" checked={allCatalog} onChange={e=>setAllCatalog(e.target.checked)}/> Toutes disciplines</label>}</div>
      <div className="paletteList">{catalogMode==='sequences'?visibleSequences.map(t=><button key={t.id} disabled={!canRunSequence(t)} onClick={()=>selectTechnique(t.id)}><span>{t.name}<small>{t.motions.join(' → ')} · {t.motions.length} mouvements · {t.id.startsWith('shadow-')?'Shadow Studio · '+(t as SequenceEntry & {level?:string}).level:'expérimental'}{!canRunSequence(t)?' · gestes manquants':''}</small></span>{technique===t.id&&<b>✓</b>}</button>):palette.map(t=><button key={t.motion} onClick={()=>selectTechnique(t.motion)}><span>{t.name}<small>{categories[t.category]??t.category} · {t.motion}</small></span>{technique===t.motion&&<b>✓</b>}</button>)}</div>
    </section>
   </div>}
  {tab==='lab'&&debug&&<aside className="debugPanel" role="region" aria-label="Console de débogage">
   <div className="debugTitle"><strong>⌘ Diagnostic · CME-3D</strong><div><button onClick={exportReport}>Copier rapport complet</button><button aria-label="Fermer la console" onClick={()=>setDebug(false)}>×</button></div></div>
   <div className="debugGrid"><span>WebGL <b>{metrics.webgl}</b></span><span>FPS <b>{metrics.fps}</b></span><span>Draw calls <b>{metrics.drawCalls}</b></span><span>Triangles <b>{metrics.triangles.toLocaleString('fr-FR')}</b></span><span>Textures <b>{metrics.textures}</b></span><span>Géométries <b>{metrics.geometries}</b></span><span>DPR <b>{metrics.dpr.toFixed(2)}</b></span><span>Rig <b>{report?.bones??'–'} os</b></span></div>
   <div className="debugSubject"><strong>{actor==='mma-amara'?'Amara':'Kadir'} · {discipline}</strong><span>Tenue : {outfit}</span><span>Style : {renderStyle} · {quality}</span><span>Mouvement : {technique} · {report?.techniqueFound?'résolu':'non trouvé'}</span></div>
   <div className="debugLog"><strong>Événements et erreurs</strong>{messages.length?messages.map((x,i)=><p key={i}>{x}</p>):<p>Aucun événement anormal signalé</p>}</div>
   <div className="debugFootnote">{pendingDrafts.length} anomalie(s) à soumettre (hors tickets existants). Aucun envoi automatique. <button className="debugReview" onClick={()=>{setDebug(false);setTab('tracking');}}>Examiner les signalements ↗</button> FPS mesurés dans la boucle Three.js.</div>
  </aside>}
  {tab==='lab'&&extra&&<aside className="advanced" role="region" aria-label="Informations du banc d'essai"><button className="close" onClick={()=>setExtra(false)} aria-label="Fermer">×</button><h2>Banc d’essai · CME-3D</h2><p>Le rendu et les techniques utilisent des poses articulées et un moteur de mouvements intégrés dans CME-3D.</p><p>Comparaison des rendus Ultra-réaliste et Animation fitness en un clic, sur la même animation. Le module neuronal historique est expérimental, entraîné sur des données synthétiques : aucune amélioration biomécanique par IA n’est encore revendiquée.</p><p>La prochaine étape sera un correcteur temporel léger quantifié (ONNX Runtime WASM), entraîné et évalué sur un jeu de mouvements de combat adapté au modèle.</p><p>Un seul écran, sans défilement vertical. Aucune transmission cloud pendant l’animation.</p></aside>}
  {tab==='lab'&&incidentOpen&&<IncidentReporter context={incidentContext} image={snapshot} onCapture={captureNow} onClose={()=>setIncidentOpen(false)}/>}
  {!!reportText&&<div className="reportFallback" role="dialog" aria-label="Rapport complet CME-3D"><div className="reportFallbackInner"><div className="reportFallbackHead"><strong>Rapport complet · Copier vers ChatGPT</strong><button onClick={()=>setReportText('')} aria-label="Fermer le rapport">×</button></div><p>La copie automatique n’est pas autorisée par ton navigateur. Sélectionne le texte ci-dessous puis copie-le pour me l’envoyer ici.</p><textarea aria-label="Texte complet du rapport" value={reportText} readOnly onFocus={e=>e.currentTarget.select()}/><button onClick={()=>{if(navigator.clipboard?.writeText)void navigator.clipboard.writeText(reportText).then(()=>{setReportText('');onLog('Rapport copié manuellement');});}}>Réessayer la copie</button></div></div>}
 <nav className="labTabs" aria-label="Navigation principale CME-3D">
   <button className={tab==='lab'?'selected':''} aria-current={tab==='lab'?'page':undefined} onClick={()=>{journal.record('navigation','Ouverture Laboratoire');setTab('lab');setDebug(false);}}>◉ <span>Laboratoire</span></button>
   <button className={tab==='studio'?'selected':''} aria-current={tab==='studio'?'page':undefined} onClick={()=>{setTab('studio');setDebug(false);}}>♙ <span>Studio Coach</span></button>
   <button className={tab==='comparison'?'selected':''} aria-current={tab==='comparison'?'page':undefined} onClick={openComparison}>⇄ <span>Comparatif 3D</span></button>
   <div className="labMore">
    <button className={['tracking','versions','options'].includes(tab)?'selected':''} aria-haspopup="true" aria-expanded={moreOpen} aria-controls="cmeMoreMenu" onClick={()=>setMoreOpen(v=>!v)}>⋯ <span>Plus</span>{pendingDrafts.length>0&&<i className="labMoreDot"/>}</button>
    {moreOpen&&<div id="cmeMoreMenu" className="labMoreMenu" role="group" aria-label="Fonctions complémentaires">
      <button onClick={()=>{journal.record('navigation','Ouverture Suivi des corrections');void known.refresh();setTab('tracking');setDebug(false);setMoreOpen(false);}}>Incidents {pendingDrafts.length>0&&`(${pendingDrafts.length})`}</button>
      <button onClick={()=>{setTab('versions');setMoreOpen(false);}}>Versions</button>
      <button onClick={()=>{setTab('options');setMoreOpen(false);}}>Options</button>
    </div>}
   </div>
  </nav>
 </main>;
}
