import {Suspense,Component,lazy,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type ReactNode,type RefObject} from 'react';
import {Canvas,useThree,useFrame} from '@react-three/fiber';
import {ACESFilmicToneMapping,NeutralToneMapping,SRGBColorSpace,CanvasTexture} from 'three';
import {Fighter} from './Fighter';
import {studioLightingPreset} from './studioLighting';
import {StudioCoach} from './StudioCoach';
import {NavigationPrincipale,type DestinationPrincipale} from './NavigationPrincipale';
import {useSceneFullscreen,SceneFullscreenButton} from './SceneFullscreen';
import {SceneCameraControls,SceneToolbar,SceneLoadingIndicator} from './SceneControls';
import {shouldRenderLabFrames,shouldMonitorLabLoading} from './sceneRuntime';
import {AndroidTelemetry} from './androidTelemetry';
import {AndroidDiagnostics,AndroidFrameProbe} from './AndroidDiagnostics';
import {readSavedCoaches,findSavedCoach,coachSourceActor,type SavedCoach} from './savedCoaches';
import type {CoachLook} from './StudioCoach';
import {parseCoachPlan,type CoachPlan} from './coachProtocol';
import {CME_APP_VERSION} from './buildInfo';
import {captureFighterImage} from './Screenshot';
import {watchWebGLContext} from './webglRecovery';
import rawTechniques from './techniques.json';
import rawSequences from './complexSequences.json';
import shadowExercises from './shadowExercises.json';
import {fighterRoster} from './fighterRoster';
import type {ReviewMotion} from './MotionReview';
import {executionKey,recordExecutionSample,playbackWasObserved,type ExecutionEvidence} from './motionExecution';
import {IncidentReporter,IssueTracker,useKnownIssues,type TestContext} from './Issues';
import {unresolvedDrafts} from './IssueLinks';
import {buildFullReport,useSessionJournal} from './SessionReport';
import {useAutoIncidentQueue,type AutoCategory} from './AutoIncidents';
import {autoClearEnabled,setAutoClearEnabled,clearApplicationCache} from './cachePolicy';
import './style.css';
import './UxSystem.css';
import './CmePremiumMobile.css';
import './StudioReferenceLook.css';
import './StudioSceneLibre.css';
import './SculptorWorkspace.css';
import './SculptorFloatingPresets.css';
import {getConfigModule} from '../config/moduleRegistry';
// Secondary screens load on demand to keep the first bundle small.
const ShadowCatalogPanel=lazy(()=>import('./ShadowCatalogPanel').then(m=>({default:m.ShadowCatalogPanel})));
const ComparisonPanel=lazy(()=>import('./ComparisonPanel').then(m=>({default:m.ComparisonPanel})));
const VersionsPanel=lazy(()=>import('./VersionsPanel').then(m=>({default:m.VersionsPanel})));
const MotionReview=lazy(()=>import('./MotionReview').then(m=>({default:m.MotionReview})));
const RoadmapPanel=lazy(()=>import('./RoadmapPanel').then(m=>({default:m.RoadmapPanel})));

function SavedCoachLibrary({openCoach,editCoach,selectedId}:{openCoach:(id:string)=>void;editCoach:(id:string)=>void;selectedId:string|null}){
 const [coaches,setCoaches]=useState<SavedCoach[]>(()=>{try{return readSavedCoaches(localStorage);}catch{return [];}});
 useEffect(()=>{const refresh=()=>{try{setCoaches(readSavedCoaches(localStorage));}catch{setCoaches([]);}};window.addEventListener('cme-coaches-changed',refresh);return()=>window.removeEventListener('cme-coaches-changed',refresh);},[]);
 return <section className="savedCoachLibrary" aria-label="Coachs créés"><h3>Mes coachs ({coaches.length})</h3>{coaches.length===0?<p>Créez votre premier coach dans Studio Coach. Il apparaîtra ici.</p>:<div className="savedCoachItems">{coaches.map(c=><div key={c.id} className="savedCoachEntry"><button aria-pressed={selectedId===c.id} onClick={()=>openCoach(c.id)}>{c.portrait&&c.portrait.startsWith('data:image/jpeg;base64,')?<img className="savedCoachPortrait" src={c.portrait} alt={'Portrait 3D de '+c.name} loading="lazy"/>:<div className="savedCoachPortraitPlaceholder" role="img" aria-label={'Portrait indisponible pour '+c.name}>♙</div>}<strong>{c.name}{selectedId===c.id?' ✓':''}</strong>{c.nickname&&<small>« {c.nickname} »</small>}<small>{c.initialDiscipline??'Discipline non renseignée'} · {c.heightCm?c.heightCm+' cm':'Taille non renseignée'} · {c.weightKg?c.weightKg+' kg':'Poids non renseigné'}</small><small>{c.look.sex} · Tester les mouvements</small></button><button type="button" onClick={()=>editCoach(c.id)}>Modifier {c.name}</button></div>)}</div>}<small>Sélectionnez un coach pour le faire exécuter les mouvements du Laboratoire. Morphologie et équipements personnalisés : rendu encore partiel.</small></section>;
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
export type RigReport={bones:number;armClamps:number;footErrorMetres:number;techniqueFound:boolean;source:string;availableMotions?:string[]};
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
 const profile=studioLightingPreset(renderStyle);
 useEffect(()=>{
  gl.outputColorSpace=SRGBColorSpace;
  gl.toneMapping=fitness?ACESFilmicToneMapping:NeutralToneMapping;
  gl.toneMappingExposure=profile.exposure;
 },[gl,fitness,comic,profile.exposure]);
 return <>
  <hemisphereLight args={[profile.hemisphere.sky,profile.hemisphere.ground,profile.hemisphere.intensity]}/>
  <directionalLight position={profile.key.position} intensity={profile.key.intensity} color={profile.key.color}
   castShadow={quality==='detail'&&!mobile()} shadow-mapSize={[1024,1024]}/>
  <directionalLight position={profile.fill.position} intensity={profile.fill.intensity} color={profile.fill.color}/>
  <directionalLight position={profile.rim.position} intensity={profile.rim.intensity} color={profile.rim.color}/>
  <directionalLight position={profile.front.position} intensity={profile.front.intensity} color={profile.front.color}/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.013,0]} receiveShadow>
   <planeGeometry args={[8,8]}/>
   <meshStandardMaterial color={profile.floor} roughness={1} metalness={0}/>
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
function Viewer({actor,discipline,technique,coachPlan,quality,renderStyle,playback,skeleton,onReport,onMetrics,onLog,onIncident,onCaptureReady,onMotionSample,coachLook,handedness='right',accessories,active,telemetry}:{
 actor:Actor;discipline:string;technique:string;coachPlan:CoachPlan|null;quality:Quality;renderStyle:RenderStyle;
 playback:RefObject<Playback>;skeleton:boolean;active:boolean;telemetry:AndroidTelemetry;coachLook?:CoachLook|null;handedness?:'right'|'left';accessories?:('gloves'|'shins')[];onReport:(r:RigReport)=>void;onMetrics:(m:Metrics)=>void;onLog:(message:string)=>void;onIncident:(category:AutoCategory,title:string,details:string)=>void;onCaptureReady:(capture:()=>string|null)=>void;onMotionSample:(id:string,progress:number,nowMs:number)=>void;
}){
 const [ready,setReady]=useState(false),[error,setError]=useState<string|null>(null),[slow,setSlow]=useState(false);
 const [retry,setRetry]=useState(0);
 const canvasRef=useRef<(HTMLCanvasElement & {cmeCleanup?:()=>void})|null>(null);
 const captureContext=useRef({actor,discipline,technique,renderStyle});
 captureContext.current={actor,discipline,technique,renderStyle};
 useLayoutEffect(()=>{
  setReady(false);setSlow(false);
  telemetry.beginLoad(actor+'/'+discipline,retry>0?'retry':telemetry.loads.length===0?'initial':'switch',performance.now());
 },[actor,discipline,retry,telemetry]);
 // Un changement de style ne recharge pas les GLB : conserver le signal de rig prêt.
 // Sinon l'effet parent pouvait effacer le onReady() de Fighter (effet enfant),
 // puis créer une fausse alerte 24 secondes après le rendu effectif.
 // Le chronomètre ne tourne que si le Laboratoire est visible et actif.
 useEffect(()=>{
  if(!shouldMonitorLabLoading(active,ready,error))return;
  const id=window.setTimeout(()=>{setSlow(true);onIncident('loading','Chargement 3D anormalement long','Coach '+actor+', tenue '+discipline+' : aucun signal de fin de chargement après 24 secondes');},24000);
  return()=>window.clearTimeout(id);
 },[active,ready,error,retry,actor,discipline,onIncident]);
 const onReady=useCallback(()=>{
  setReady(true);setSlow(false);
  const load=telemetry.finishLoad(actor+'/'+discipline,performance.now());
  onLog('Coach et tenue décodés, rig initialisé'+(load?' · '+load.durationMs+' ms':''));
 },[actor,discipline,onLog,telemetry]);
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
    telemetry.recordContextLost(performance.now());
    onLog('WebGL perdu pendant l’utilisation : récupération en cours');
    onIncident('webgl','Perte du contexte graphique WebGL','Contexte WebGL perdu pendant une session active');
    setError('Contexte graphique perdu : restauration automatique attendue. Relancer si nécessaire.');
   },
   onRestored:()=>{
    telemetry.recordContextRestored(performance.now());
    onLog('Contexte WebGL restauré automatiquement');
    setError(v=>v?.startsWith('Contexte graphique perdu')?null:v);
   }
  });
 },[onLog,onIncident,playback,onCaptureReady,telemetry]);
 useEffect(()=>()=>{canvasRef.current?.cmeCleanup?.();canvasRef.current=null;},[]);
 const dpr=quality==='performance'?1:quality==='balanced'?(mobile()?1.1:1.35):(mobile()?1.4:1.6);
 return <div className="viewer">
   <ErrorBoundary key={retry} onError={message=>{setError(message);onIncident('javascript','Erreur du composant de rendu 3D',message);}}>
    <Canvas key={retry} gl={gl} onCreated={onCreated} dpr={dpr} shadows={quality==='detail'&&!mobile()} camera={{position:[0,1.54,2.78],fov:34}} frameloop={active?"always":"never"}>
     <color attach="background" args={[renderStyle==='fitness'?'#e7eeef':renderStyle==='comic'?'#111827':'#1d252c']}/>
     <Lights quality={quality} renderStyle={renderStyle}/>
     <PerfProbe onMetrics={onMetrics}/>
      <AndroidFrameProbe telemetry={telemetry}/>

     <Suspense fallback={null}>
      <Fighter actor={actor} outfit={discipline} technique={technique} coachPlan={coachPlan} playback={playback} skeleton={skeleton} quality={quality} renderStyle={renderStyle} onReady={onReady} onReport={onReport} onMotionSample={onMotionSample} coachLook={coachLook} handedness={handedness} accessories={accessories}/>
     </Suspense>
     <SceneCameraControls target={[0,1,0]} minDistance={1.35} maxDistance={6}/>
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
 const [savedCoaches,setSavedCoaches]=useState<SavedCoach[]>(()=>{try{return readSavedCoaches(localStorage);}catch{return [];}});
 useEffect(()=>{
  const refresh=()=>{
   try{
    const items=readSavedCoaches(localStorage);
    setSavedCoaches(items);
    const saved=findSavedCoach(localStorage,localStorage.getItem('cme-lab-coach'));
    setSelectedCoach(saved);
    if(saved)setActor(coachSourceActor(saved));
   }catch{setSavedCoaches([]);setSelectedCoach(null);}
  };
  window.addEventListener('cme-coaches-changed',refresh);
  window.addEventListener('storage',refresh);
  return()=>{window.removeEventListener('cme-coaches-changed',refresh);window.removeEventListener('storage',refresh);};
 },[]);
 const selectSavedCoach=(id:string)=>{try{const saved=findSavedCoach(localStorage,id);if(!saved)return;setSelectedCoach(saved);setActor(coachSourceActor(saved));if(saved.initialDiscipline){const d=saved.initialDiscipline==='boxing'?'boxe':saved.initialDiscipline;if(disciplines.some(([code])=>code===d))setDiscipline(d);}setTechnique('garde');setPlaying(false);localStorage.setItem('cme-lab-coach',id);setReport(null);setProgress(0);setExecutionEvidence(null);}catch{/* unavailable local storage */}};
 const [discipline,setDiscipline]=useState('boxe');
 const [nogi,setNogi]=useState(false);
 const [technique,setTechnique]=useState('garde');
 const [executionEvidence,setExecutionEvidence]=useState<ExecutionEvidence|null>(null);
 const [coachJson,setCoachJson]=useState(JSON.stringify({discipline:'boxe',speech:'Garde haute, jab puis direct.',sequence:[{animationId:'garde',speed:1,repetitions:1},{animationId:'jab',speed:.8,repetitions:1},{animationId:'direct',speed:.9,repetitions:1}]}));
 const [coachPlan,setCoachPlan]=useState<CoachPlan|null>(null);
 const [coachError,setCoachError]=useState('');
 const [quality,setQuality]=useState<Quality>('balanced');
 const [renderStyle,setRenderStyle]=useState<RenderStyle>('ultra');
 const [skeleton,setSkeleton]=useState(false);
 const [progress,setProgress]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1);
 const [report,setReport]=useState<RigReport|null>(null);
 const [extra,setExtra]=useState(false);
 const [moreOpen,setMoreOpen]=useState(false);
 const stageFullscreen=useSceneFullscreen();

 const [theme,setTheme]=useState<'auto'|'light'|'dark'>(()=>{try{const v=localStorage.getItem('cme-theme');return v==='light'||v==='dark'?v:getConfigModule('navigation').defaultTheme as 'auto';}catch{return getConfigModule('navigation').defaultTheme as 'auto';}});
 useEffect(()=>{
  document.documentElement.setAttribute('data-cme-theme',theme);
  try{localStorage.setItem('cme-theme',theme);}catch{}
  const meta=document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const media=window.matchMedia?.('(prefers-color-scheme: dark)');
  const update=()=>{if(meta)meta.content=theme==='dark'||(theme==='auto'&&media?.matches)?'#101116':'#f0f3f8';};
  update();media?.addEventListener?.('change',update);
  return()=>media?.removeEventListener?.('change',update);
 },[theme]);
 const [tab,setTab]=useState<'lab'|'gallery'|'tracking'|'comparison'|'versions'|'options'|'studio'|'technical'|'roadmap'|'other'>('studio');
 const ongletActif:DestinationPrincipale=tab==='studio'||tab==='lab'||tab==='gallery'?tab:'other';
 useEffect(()=>{const open=()=>setTab('lab');window.addEventListener('cme-open-lab-coach',open);return()=>window.removeEventListener('cme-open-lab-coach',open);},[]);
 const [pageVisible,setPageVisible]=useState(()=>typeof document==='undefined'||document.visibilityState==='visible');
 useEffect(()=>{const sync=()=>setPageVisible(document.visibilityState==='visible');document.addEventListener('visibilitychange',sync);return()=>document.removeEventListener('visibilitychange',sync);},[]);
 const labActive=shouldRenderLabFrames(tab,pageVisible);
 const [androidTelemetry]=useState(()=>new AndroidTelemetry('laboratoire'));
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
 const reviewEntries=useMemo<ReviewMotion[]>(()=>[{id:'garde',name:'Garde de base',kind:'technique',motions:['garde']},...currentTechniques.filter(t=>t.motion!=='garde').map(t=>({id:t.motion,name:t.name,kind:'technique' as const,motions:[t.motion]})),...currentSequences.map(t=>({id:t.id,name:t.name,kind:'sequence' as const,motions:t.motions}))],[currentTechniques,currentSequences]);
 const runnableEntries=useMemo(()=>reviewEntries.filter(e=>report?.availableMotions?.includes(e.id)),[reviewEntries,report?.availableMotions]);
 const canRunSequence=(entry:SequenceEntry)=>entry.motions.every(m=>knownMotions.has(m));
 const palette=useMemo(()=>techniques.filter(t=>(allCatalog||t.disciplines.includes(discipline))&&
   ((t.name+' '+t.id+' '+t.category).toLocaleLowerCase('fr-FR').includes(query.toLocaleLowerCase('fr-FR')))),[discipline,query,allCatalog]);
 const onMetrics=useCallback((m:Metrics)=>{journal.measure(m);setMetrics(m);},[journal.measure]);
 const techniqueLabel=techniques.find(t=>t.motion===technique)?.name??sequences.find(x=>x.id===technique)?.name??technique;
 const currentExecutionKey=executionKey(actor,discipline,selectedCoach?.id??'',technique);
 const onMotionSample=useCallback((id:string,position:number,nowMs:number)=>{
  setExecutionEvidence(prev=>recordExecutionSample(prev,executionKey(actor,discipline,selectedCoach?.id??'',id),position,nowMs));
 },[actor,discipline,selectedCoach?.id]);
 const selectTechnique=(motion:string)=>{setExecutionEvidence(null);journal.record('technique','Technique sélectionnée : '+motion,{previous:technique,discipline,coach:actor});reset();setCoachPlan(null);setTechnique(motion);setCatalogOpen(false);setPlaying(true);onLog('Lecture : '+motion);};
 const incidentContext:TestContext={actor:actor==='mma-amara'?'Amara':'Kadir',discipline,outfit,technique,renderStyle,quality,userAgent:navigator.userAgent,diagnostics:JSON.stringify({report,metrics,messages},null,2)};
 const {items:autoDrafts,record:autoRecord,dismiss:autoDismiss,clear:autoClear}=useAutoIncidentQueue(incidentContext,onLog);
 const pendingDrafts=useMemo(()=>unresolvedDrafts(autoDrafts,known.issues),[autoDrafts,known.issues]);
 const playback=useRef<Playback>({progress:0,playing:false,speed:.5});
 const exportReport=useCallback(()=>{
  journal.record('debug','Export du rapport intégral de la session vers ChatGPT');
  const text=buildFullReport(journal.snapshot(),incidentContext,autoDrafts,metrics,report,playback.current,
   known.issues.map(x=>({number:x.number,state:x.state,title:x.title,url:x.html_url})))+
   '\\n\\nG. INSTRUMENTATION ANDROID (mesures locales)\\n'+
   androidTelemetry.exportReport({coach:actor,discipline,technique,rendu:renderStyle,qualite:quality},
   {userAgent:navigator.userAgent,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio});
  if(navigator.clipboard?.writeText){
   void navigator.clipboard.writeText(text).then(()=>onLog('Rapport complet copié : '+text.length+' caractères'))
    .catch(()=>{setReportText(text);onLog('Presse-papiers indisponible : rapport affiché pour sélection manuelle');});
  }else setReportText(text);
 },[journal.record,journal.snapshot,incidentContext,autoDrafts,metrics,report,known.issues,onLog,androidTelemetry,actor,discipline,technique,renderStyle,quality]);
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
 useEffect(()=>{if(!playing||!labActive)return;const i=window.setInterval(()=>setProgress(playback.current.progress),150);return()=>window.clearInterval(i);},[playing,labActive]);
 const slowFpsSince=useRef<number|null>(null);
 useEffect(()=>{
  if(!playing||tab!=='lab'||document.visibilityState!=='visible'||metrics.fps<=0||metrics.fps>=16){slowFpsSince.current=null;return;}
  if(slowFpsSince.current===null)slowFpsSince.current=Date.now();
  else if(Date.now()-slowFpsSince.current>=18000){autoRecord('performance','Fréquence d’images insuffisante','Rendu actif sous 16 FPS pendant au moins 18 secondes, mesure récente : '+metrics.fps+' FPS');slowFpsSince.current=null;}
 },[metrics.fps,playing,tab,autoRecord]);
 const reset=()=>{setPlaying(false);seek(0);setReport(null);setExecutionEvidence(null);};
 const openComparison=()=>{
  journal.record('navigation','Ouverture comparatif moteurs 3D',{coach:actor,discipline,technique});
  const captured=screenshotHandler.current?.()??null;
  if(captured)setComparisonSnapshot(captured);
  setTab('comparison');setDebug(false);setCatalogOpen(false);
 };
 return <main className="labApp" data-cme-screen={tab}>
  <header className="labHeader">
   <div className="branding"><span className="brandDot">C</span><div><strong>CME<span>–3D</span> <span className="cmeVersion" aria-label={'Version '+CME_APP_VERSION}>v{CME_APP_VERSION}</span></strong><p>{tab==='studio'?'Créer et personnaliser':tab==='lab'?'Simuler les mouvements':tab==='gallery'?'Mes coachs':tab==='other'?'Outils et ressources':'Fonctions complémentaires'}</p></div></div>
   <div className="headerActions"><span className="liveTag"><i/> Moteur local</span></div>
  </header>
  
  <div className="cmeAppContent" role="region" aria-label="Contenu de la rubrique active" tabIndex={-1}>
   {['technical','versions','roadmap','tracking','options','comparison'].includes(tab)&&<button type="button" className="cmeRetourPlus" onClick={()=>setTab('other')}>‹ Retour à Plus</button>}
  <div className="labContent" style={{display:tab==='lab'?'contents':'none'}}>
  <section className="quickBar" aria-label="Sélection de test">
   <label><span>Coach · {savedCoaches.length} personnalisé(s)</span><select aria-label="Coach" value={selectedCoach?'saved:'+selectedCoach.id:actor} onChange={e=>{
    const value=e.target.value;
    if(value.startsWith('saved:')){
     selectSavedCoach(value.slice(6));
     journal.record('coach','Coach personnalisé sélectionné : '+value.slice(6));
    }else{
     journal.record('coach','Changement de coach : '+actor+' → '+value);
     reset();setSelectedCoach(null);
     try{localStorage.removeItem('cme-lab-coach');}catch{}
     setActor(value as Actor);
    }
   }}>
    <optgroup label="Coachs de référence">{fighterRoster.map(f=><option key={f.id} value={f.id} disabled={f.status!=='available'&&f.id!=='mma-naira'}>{f.name}{f.status==='in-production'?' · prototype cloné (non validé)':''}</option>)}</optgroup>
    {savedCoaches.length>0&&<optgroup label="Mes coachs personnalisés">{savedCoaches.map(c=><option key={c.id} value={'saved:'+c.id}>{c.name} · {c.look.sex}</option>)}</optgroup>}
   </select></label>
   <label><span>Discipline</span><select aria-label="Discipline" value={discipline} onChange={e=>{journal.record('discipline','Discipline : '+discipline+' → '+e.target.value,{coach:actor,style:renderStyle});reset();setDiscipline(e.target.value);setTechnique('garde');onLog('Discipline : '+e.target.value);}}>{disciplines.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
   <label className="cmeQuickMotion"><span>Mouvement ou enchaînement</span>
    <select aria-label="Mouvement ou enchaînement" value={runnableEntries.some(e=>e.id===technique)?technique:''} disabled={!runnableEntries.length} onChange={e=>selectTechnique(e.target.value)}>
     {!runnableEntries.some(e=>e.id===technique)&&<option value="">Choisir un geste compatible</option>}
     <optgroup label="Techniques disponibles">{runnableEntries.filter(e=>e.kind==='technique').map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</optgroup>
     <optgroup label="Enchaînements disponibles">{runnableEntries.filter(e=>e.kind==='sequence').map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</optgroup>
    </select>
   </label>
   <button type="button" className="cmeQuickRun" disabled={!runnableEntries.some(e=>e.id===technique)} onClick={()=>{seek(0);setExecutionEvidence(null);setCoachPlan(null);setPlaying(true);}}>▶ Exécuter</button>
  </section>
  <section ref={stageFullscreen.ref as React.RefObject<HTMLElement>} className={`stage ${stageFullscreen.fullscreen?"cmeFullscreen":""}`} aria-label="Vue de test 3D" onDoubleClick={stageFullscreen.onDoubleClick} onTouchEnd={stageFullscreen.onTouchEnd}>
   <SceneToolbar actions={<SceneFullscreenButton fullscreen={stageFullscreen.fullscreen} onClick={stageFullscreen.toggle}/>}/>
   <div className="stageTitle"><span>{actor==='mma-amara'?'AMARA':'KADIR'} <em>· {renderStyle==='fitness'?'Animation fitness':renderStyle==='comic'?'Comics sportif · tenue d’origine':'Ultra-réaliste'}</em></span><span className="stagePill">MOTION / IK</span></div>
   {selectedCoach&&<div className="labSelectedCoach" role="status">Coach personnalisé : <strong>{selectedCoach.name}</strong> · {selectedCoach.look.sex} · animations canoniques</div>}
   <Viewer active={labActive} telemetry={androidTelemetry} coachLook={selectedCoach?.look??null} handedness={selectedCoach?.handedness??'right'} accessories={selectedCoach?.accessories} actor={actor} coachPlan={coachPlan} discipline={outfit} quality={quality} renderStyle={renderStyle} technique={technique} playback={playback} skeleton={skeleton} onReport={onReport} onMetrics={onMetrics} onLog={onLog} onIncident={autoRecord} onCaptureReady={setScreenshotHandler} onMotionSample={onMotionSample}/>
   <SceneLoadingIndicator/>
   <div className="stageBottom"><span>{report?(report.techniqueFound?'Mouvement reconnu · '+report.bones+' os':'Mouvement non compatible · choisir un autre'):'Chargement du modèle 3D'}</span><span>{report?('Tenue '+outfit+' ✓'):'Chargement'}</span></div>
  </section>
  

<section className="transport" aria-label="Commandes d'animation">
   <div className="transportMain"><button className="playButton" onClick={()=>{journal.record('playback',playing?'Pause de l’animation':'Démarrage de l’animation',{technique,progress:playback.current.progress,speed});setPlaying(x=>!x);}}>{playing?'❚❚':'▶'} <span>{playing?'Pause':'Lecture'}</span></button><button className="resetButton" aria-label="Revenir au début" onClick={()=>{journal.record('playback','Retour au début de l’animation',{technique});reset();}}>↺</button>
    <div className="seek"><input aria-label="Position de lecture" type="range" min="0" max="1000" value={Math.round(progress*1000)} onChange={e=>{setPlaying(false);seek(Number(e.target.value)/1000);}} onPointerUp={()=>journal.record('playback','Positionnement manuel de l’animation',{technique,progress:playback.current.progress})}/><span>{Math.round(progress*100)}%</span></div>
    <select aria-label="Vitesse" className="speed" value={speed} onChange={e=>{journal.record('playback','Vitesse modifiée : '+speed+'× → '+e.target.value+'×',{technique});setSpeed(Number(e.target.value));}}><option value={.25}>¼×</option><option value={.5}>½×</option><option value={1}>1×</option></select>
   </div>
   <div className="compareBar">
    <div className="switchGroup" aria-label="Comparaison visuelle"><button className={renderStyle==='ultra'?'active':''} onClick={()=>{journal.record('style','Passage en Ultra-réaliste',{previous:renderStyle});reset();setRenderStyle('ultra');}}>Ultra-réaliste</button><button className={renderStyle==='fitness'?'active':''} onClick={()=>{journal.record('style','Passage en Animation fitness',{previous:renderStyle});reset();setRenderStyle('fitness');}}>Animation fitness</button><button className={renderStyle==='comic'?'active':''} onClick={()=>{journal.record('style','Passage en Roman graphique',{previous:renderStyle});reset();setRenderStyle('comic');}}>Comics · mêmes tenues</button></div>
    <label className="inlineSelect"><span>Qualité</span><select aria-label="Qualité graphique" value={quality} onChange={e=>{journal.record('quality','Qualité graphique '+quality+' → '+e.target.value);reset();setQuality(e.target.value as Quality);}}><option value="performance">Rapide</option><option value="balanced">Auto</option><option value="detail">Détail</option></select></label>
    <label className="checkMini"><input type="checkbox" checked={skeleton} onChange={e=>{journal.record('debug','Squelette '+(e.target.checked?'affiché':'masqué'));setSkeleton(e.target.checked);}}/>Os</label>
    {discipline==='bjj'&&<button className="outfitToggle" aria-label="Changer tenue BJJ" onClick={()=>{journal.record('outfit','BJJ : '+(nogi?'no-gi → gi':'gi → no-gi'));reset();setNogi(x=>!x);}}>{nogi?'No-gi':'Gi'}</button>}
   </div>
  </section>

  </div>
  {tab==='lab'&&<details className="cmeMotionExpert"><summary>Validation et rapport technique · avancé</summary><Suspense fallback={null}><MotionReview entries={reviewEntries} discipline={discipline} coach={selectedCoach?.id??actor} selected={technique} onSelect={selectTechnique} availableIds={report?.availableMotions??[]} engineVersion={CME_APP_VERSION} metrics={{...metrics,bones:report?.bones??null,techniqueFound:report?.techniqueFound??false}} rigReady={!!report} rigTechniqueFound={!!report?.techniqueFound} executionEvidence={executionEvidence?.key===currentExecutionKey?executionEvidence:null} playbackObserved={playbackWasObserved(executionEvidence,currentExecutionKey)} onPlay={()=>{seek(0);setExecutionEvidence(null);setPlaying(true);document.querySelector('.cmeAppContent')?.scrollTo({top:0,behavior:'smooth'});}}/></Suspense></details>}

  {tab==='gallery'&&<section className="cmeCoachGallery" aria-label="Galerie Coachs"><header><h2>Galerie Coachs</h2><p>Choisissez un combattant enregistré. Sa configuration est partagée avec Studio et le banc d'essai.</p></header><SavedCoachLibrary selectedId={selectedCoach?.id??null} openCoach={id=>{selectSavedCoach(id);setTab('lab');}} editCoach={id=>{try{localStorage.setItem('cme-selected-coach',id);sessionStorage.setItem('cme-edit-request',id);}catch{}setTab('studio');}}/><button className="galleryCreate" type="button" onClick={()=>setTab('studio')}>Créer un combattant dans Studio</button></section>}
  {tab==='studio'&&<div className="cmeStudioHub"><StudioCoach/></div>}
  {tab==='versions'&&<Suspense fallback={null}><VersionsPanel/></Suspense>}
  {tab==='other'&&<section className="cmeOtherScreen" aria-label="Fonctions complémentaires"><h2>Plus</h2><p>Les outils spécialisés restent accessibles sans encombrer le Studio.</p>
    <div className="cmeOtherGrid">
      <button type="button" onClick={openComparison}>⇄ Comparatif CME / Shadow</button>
      <a href="https://github.com/Doorsofhell/cme-3d-motion-lab/blob/main/docs/biomecanique/README.md" target="_blank" rel="noopener noreferrer">☷ Atlas biomécanique · référentiel</a>
      <details className="cmeOtherAdvanced"><summary>Outils techniques avancés</summary><button type="button" onClick={()=>setTab('technical')}>Ouvrir le laboratoire technique</button></details>
      <button type="button" onClick={()=>setTab('versions')}>✦ Nouveautés et versions</button>
      <button type="button" onClick={()=>setTab('roadmap')}>☷ Feuille de route</button>
      <button type="button" onClick={()=>{void known.refresh();setTab('tracking');}}>⚑ Incidents</button>
      <button type="button" onClick={()=>setTab('options')}>⚙ Options et cache</button>
    </div>
    <label className="cmeThemeSetting">Apparence de l'application<select aria-label="Thème de CME-3D" value={theme} onChange={e=>setTheme(e.target.value as 'auto'|'light'|'dark')}><option value="auto">Automatique · selon le système (jour/nuit)</option><option value="light">Toujours clair</option><option value="dark">Toujours sombre</option></select></label>
   </section>}
  {tab==='roadmap'&&<Suspense fallback={null}><RoadmapPanel/></Suspense>}
  {tab==='technical'&&<section className="cmeTechnicalScreen" aria-label="Centre technique"><header className="cmePageHeader"><h2>Technique</h2><p>Vérifier les mesures réelles, inspecter le rig et exporter un rapport de diagnostic.</p></header><div className="cmeDiagnosticGrid"><span>FPS <strong>{metrics.fps>0?metrics.fps:'Non mesuré'}</strong></span><span>WebGL <strong>{metrics.webgl}</strong></span><span>Draw calls <strong>{metrics.drawCalls}</strong></span><span>Triangles <strong>{metrics.triangles}</strong></span><span>Rig <strong>{report?.bones??'–'} os</strong></span></div><div className="cmeTechnicalActions"><button type="button" onClick={exportReport}>Exporter le rapport de session</button><button type="button" onClick={()=>{journal.record('incident','Signalement manuel depuis Technique',{technique,discipline,actor});captureNow();setIncidentOpen(true);}}>Signaler un incident</button></div><AndroidDiagnostics telemetry={androidTelemetry} active={tab==='technical'} context={{coach:actor,discipline,technique,qualite:quality,rendu:renderStyle}}/><details className="cmeTechnicalFold"><summary>Prototype avancé · Exécuter un plan JSON</summary>   <details className="labTechnicalDetails"><summary>Outils techniques · Coach IA JSON</summary><section aria-label="Coach JSON Text-to-Animation" style={{padding:12,display:'grid',gap:8}}>
<strong>Coach IA · Text-to-Animation (prototype local)</strong>
<textarea aria-label="Plan JSON du coach" rows={4} value={coachJson} onChange={e=>setCoachJson(e.target.value)} style={{width:'100%',boxSizing:'border-box'}}/>
<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
<button onClick={()=>{try{const plan=parseCoachPlan(coachJson);if(plan.discipline!==(outfit==='bjj-nogi'?'bjj':outfit))throw Error('Discipline JSON différente de la discipline sélectionnée');setCoachPlan(plan);setCoachError('');reset();onLog('Plan JSON activé');}catch(e){setCoachError(e instanceof Error?e.message:String(e));}}}>Exécuter le JSON</button>
<button onClick={()=>{setCoachPlan(null);setCoachError('');reset();}}>Revenir au catalogue</button>
</div>
{coachError&&<span role="alert">{coachError}</span>}
{coachPlan&&<span role="status">Plan actif : {coachPlan.sequence.length} étapes · TTS : {coachPlan.speech}</span>}
</section></details></details><details className="cmeTechnicalFold"><summary>Référentiels et techniques historiques</summary><Suspense fallback={null}><ShadowCatalogPanel/></Suspense><div className="cmeTechnicalActions"><button onClick={()=>{setCatalogMode('techniques');setCatalogOpen(true);setQuery('');}}>Parcourir les techniques</button><button onClick={()=>{setCatalogMode('sequences');setCatalogOpen(true);setQuery('');}}>Parcourir les enchaînements</button></div></details></section>}
  {tab==='options'&&<section className="cmeOptions" aria-label="Options CME-3D">
   <h2>Options du laboratoire</h2>
   <label className="cacheOption"><input type="checkbox" checked={clearCacheOnOpen} onChange={e=>{const enabled=e.target.checked;setClearCacheOnOpen(enabled);setAutoClearEnabled(enabled);setCacheMessage(enabled?'Vidage automatique activé pour chaque ouverture.':'Vidage automatique désactivé.');}}/><span><strong>Vider automatiquement le cache à chaque ouverture</strong><small>Désactivé par défaut pour permettre l'usage hors ligne. Supprime les caches CME-3D et désactive son service worker à chaque ouverture. Les préférences locales sont conservées.</small></span></label>
   <button className="resetButton" onClick={()=>{void clearApplicationCache().then(({caches,workers})=>setCacheMessage(caches+' cache(s) supprimé(s), '+workers+' service worker(s) désenregistré(s).')).catch(()=>setCacheMessage('Nettoyage impossible dans ce navigateur.'));}}>Vider le cache maintenant</button>
   {cacheMessage&&<p role="status">{cacheMessage}</p>}
  </section>}
  {tab==='tracking'&&<IssueTracker drafts={pendingDrafts} onDismiss={autoDismiss} onClear={autoClear} onCopyReport={exportReport} {...known}/>}
  {tab==='comparison'&&<Suspense fallback={null}><ComparisonPanel metrics={metrics} report={report} snapshot={comparisonSnapshot} actor={actor==='mma-amara'?'Amara':'Kadir'} discipline={discipline} technique={techniqueLabel} renderStyle={renderStyle} onOpenLab={()=>setTab('lab')} onCopyReport={exportReport}/></Suspense>}
  </div>
  {tab==='technical'&&catalogOpen&&<div className="paletteBackdrop" onClick={()=>setCatalogOpen(false)}>
    <section className="catalogPalette" role="dialog" aria-label="Catalogue complet des techniques" onClick={e=>e.stopPropagation()}>
      <div className="paletteTitle"><strong>{catalogMode==='sequences'?'Enchaînements expérimentaux · '+visibleSequences.length:'Techniques · '+palette.length+' / '+techniques.length}</strong><button aria-label="Fermer le catalogue" onClick={()=>setCatalogOpen(false)}>×</button></div>
      <div className="paletteFilters"><input autoFocus aria-label="Rechercher une technique" value={query} onChange={e=>setQuery(e.target.value)} placeholder={catalogMode==='sequences'?'Jab → direct → crochet, lutte, genoux…':'Rechercher jab, crochet, projection…'}/>{catalogMode==='techniques'&&<label><input type="checkbox" checked={allCatalog} onChange={e=>setAllCatalog(e.target.checked)}/> Toutes disciplines</label>}</div>
      <div className="paletteList">{catalogMode==='sequences'?visibleSequences.map(t=><button key={t.id} disabled={!canRunSequence(t)} onClick={()=>selectTechnique(t.id)}><span>{t.name}<small>{t.motions.join(' → ')} · {t.motions.length} mouvements · {t.id.startsWith('shadow-')?'Shadow Studio · '+(t as SequenceEntry & {level?:string}).level:'expérimental'}{!canRunSequence(t)?' · gestes manquants':''}</small></span>{technique===t.id&&<b>✓</b>}</button>):palette.map(t=><button key={t.motion} onClick={()=>selectTechnique(t.motion)}><span>{t.name}<small>{categories[t.category]??t.category} · {t.motion}</small></span>{technique===t.motion&&<b>✓</b>}</button>)}</div>
    </section>
   </div>}
  {tab==='technical'&&debug&&<aside className="debugPanel" role="region" aria-label="Console de débogage">
   <div className="debugTitle"><strong>⌘ Diagnostic · CME-3D</strong><div><button onClick={exportReport}>Copier rapport complet</button><button aria-label="Fermer la console" onClick={()=>setDebug(false)}>×</button></div></div>
   <div className="debugGrid"><span>WebGL <b>{metrics.webgl}</b></span><span>FPS <b>{metrics.fps>0?metrics.fps:'Non mesuré'}</b></span><span>Draw calls <b>{metrics.drawCalls}</b></span><span>Triangles <b>{metrics.triangles.toLocaleString('fr-FR')}</b></span><span>Textures <b>{metrics.textures}</b></span><span>Géométries <b>{metrics.geometries}</b></span><span>DPR <b>{metrics.dpr.toFixed(2)}</b></span><span>Rig <b>{report?.bones??'–'} os</b></span></div>
   <div className="debugSubject"><strong>{actor==='mma-amara'?'Amara':'Kadir'} · {discipline}</strong><span>Tenue : {outfit}</span><span>Style : {renderStyle} · {quality}</span><span>Mouvement : {technique} · {report?.techniqueFound?'résolu':'non trouvé'}</span></div>
   <div className="debugLog"><strong>Événements et erreurs</strong>{messages.length?messages.map((x,i)=><p key={i}>{x}</p>):<p>Aucun événement anormal signalé</p>}</div>
   <div className="debugFootnote">{pendingDrafts.length} anomalie(s) à soumettre (hors tickets existants). Aucun envoi automatique. <button className="debugReview" onClick={()=>{setDebug(false);setTab('tracking');}}>Examiner les signalements ↗</button> FPS mesurés dans la boucle Three.js.</div>
  </aside>}
  {tab==='technical'&&extra&&<aside className="advanced" role="region" aria-label="Informations du banc d'essai"><button className="close" onClick={()=>setExtra(false)} aria-label="Fermer">×</button><h2>Banc d’essai · CME-3D</h2><p>Le rendu et les techniques utilisent des poses articulées et un moteur de mouvements intégrés dans CME-3D.</p><p>Comparaison des rendus Ultra-réaliste et Animation fitness en un clic, sur la même animation. Aucun réseau neuronal n’intervient dans l’animation : aucune amélioration biomécanique par IA n’est revendiquée.</p><p>Un seul écran, sans défilement vertical. Aucune transmission cloud pendant l’animation.</p></aside>}
  {tab==='technical'&&incidentOpen&&<IncidentReporter context={incidentContext} image={snapshot} onCapture={captureNow} onClose={()=>setIncidentOpen(false)}/>}
  {!!reportText&&<div className="reportFallback" role="dialog" aria-label="Rapport complet CME-3D"><div className="reportFallbackInner"><div className="reportFallbackHead"><strong>Rapport complet · Copier vers ChatGPT</strong><button onClick={()=>setReportText('')} aria-label="Fermer le rapport">×</button></div><p>La copie automatique n’est pas autorisée par ton navigateur. Sélectionne le texte ci-dessous puis copie-le pour me l’envoyer ici.</p><textarea aria-label="Texte complet du rapport" value={reportText} readOnly onFocus={e=>e.currentTarget.select()}/><button onClick={()=>{if(navigator.clipboard?.writeText)void navigator.clipboard.writeText(reportText).then(()=>{setReportText('');onLog('Rapport copié manuellement');});}}>Réessayer la copie</button></div></div>}
 <NavigationPrincipale actif={ongletActif} ouvrir={destination=>{setTab(destination);setDebug(false);}}/>
 </main>;
}
