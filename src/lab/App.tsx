import { Suspense, Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ACESFilmicToneMapping, NoToneMapping, PMREMGenerator, SRGBColorSpace } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Fighter } from './Fighter';
import type { RigReport } from '../adapters/threeRig';
import type { Technique } from '../core/motion';
import './style.css';

type Actor = 'mma-kadir'|'mma-amara';
type Quality = 'performance'|'balanced'|'detail';
export type Playback = { progress:number; playing:boolean; speed:number };
const isMobile = () => typeof window !== 'undefined' && (window.matchMedia('(max-width: 770px)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent));
const initialQuality = (): Quality => isMobile() ? 'balanced' : 'detail';

class RenderErrorBoundary extends Component<{children:ReactNode;onError:(message:string)=>void},{hasError:boolean}> {
 state={hasError:false};
 static getDerivedStateFromError(){return {hasError:true};}
 componentDidCatch(error:Error){this.props.onError(error.message || 'Échec de chargement du moteur 3D');}
 render(){return this.state.hasError ? null : this.props.children;}
}
function Lighting({quality,mobile}:{quality:Quality;mobile:boolean}){
 const {scene,gl}=useThree();
 useEffect(()=>{
   gl.outputColorSpace=SRGBColorSpace;
   gl.toneMapping=quality==='performance'?NoToneMapping:ACESFilmicToneMapping;
   gl.toneMappingExposure=quality==='performance'?1:1.15;
   if(mobile || quality!=='detail')return;
   const pmrem=new PMREMGenerator(gl);
   const room=new RoomEnvironment();
   const env=pmrem.fromScene(room).texture;
   scene.environment=env;
   scene.environmentIntensity=.65;
   return()=>{scene.environment=null;env.dispose();pmrem.dispose();room.dispose();};
 },[scene,gl,quality,mobile]);
 return <>
  <ambientLight intensity={mobile?1.1:.8}/>
  <hemisphereLight args={['#deedff','#202b38',mobile?1.25:1.35]}/>
  <directionalLight position={[2.5,4,3.5]} intensity={mobile?2:2.5} castShadow={!mobile && quality==='detail'} shadow-mapSize={[1024,1024]} />
  <directionalLight position={[-2.5,2,-3]} intensity={mobile?.9:1.3} color="#d5e3ff"/>
  <mesh receiveShadow={!mobile && quality==='detail'} rotation={[-Math.PI/2,0,0]} position={[0,-.035,0]}>
   <planeGeometry args={[12,12]}/><meshStandardMaterial color="#1a283a" roughness={.9}/>
  </mesh>
 </>;
}
function Viewer({actor,outfit,technique,playback,skeleton,quality,onReport}:{actor:Actor;outfit:string;technique:Technique;playback:RefObject<Playback>;skeleton:boolean;quality:Quality;onReport:(r:RigReport)=>void}){
 const mobile=isMobile();
 const [ready,setReady]=useState(false),[error,setError]=useState<string|null>(null),[slow,setSlow]=useState(false);
 useEffect(()=>{const id=window.setTimeout(()=>setSlow(true),18000);return()=>clearTimeout(id);},[]);
 const onReady=useCallback(()=>{setReady(true);setSlow(false);},[]);
 const glProps=useMemo(()=>({alpha:false,antialias:quality!=='performance',powerPreference:'default' as const,preserveDrawingBuffer:false,stencil:false,depth:true}),[quality]);
 const onCreated=useCallback(({gl}:{gl: {domElement:HTMLCanvasElement}})=>{
   const canvas=gl.domElement;
   const lost=(event:Event)=>{event.preventDefault();setError('Le navigateur a interrompu le rendu WebGL. Le contexte graphique a été perdu.');};
   const restored=()=>{setError(null);setReady(false);};
   canvas.addEventListener('webglcontextlost',lost,false);
   canvas.addEventListener('webglcontextrestored',restored,false);
   // These listeners live only for the canvas lifetime, removed by callback on cleanup.
   const cleanup=()=>{canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);};
   (canvas as HTMLCanvasElement & {cmeCleanup?:()=>void}).cmeCleanup=cleanup;
 },[]);
 useEffect(()=>()=>{document.querySelectorAll('canvas').forEach(el=>(el as HTMLCanvasElement & {cmeCleanup?:()=>void}).cmeCleanup?.());},[]);
 const supported=useMemo(()=>{
  try { const test=document.createElement('canvas'); const ctx=test.getContext('webgl2')||test.getContext('webgl'); ctx?.getExtension('WEBGL_lose_context')?.loseContext();return !!ctx; }catch {return false;}
 },[]);
 return <div className="viewer">
  {!supported ? <div className="viewerState viewerError" role="alert">WebGL n'est pas disponible dans ce navigateur. Essaie Chrome Android à jour.</div>:
  <RenderErrorBoundary onError={setError}>
   <Canvas key={quality} gl={glProps} shadows={!mobile&&quality==='detail'} dpr={quality==='performance'?1:quality==='balanced'?(mobile?1.15:1.35):(mobile?1.4:1.65)} camera={{position:[0,1.55,3.2],fov:35}} onCreated={onCreated}>
    <color attach="background" args={['#0d1522']}/>
    <Lighting quality={quality} mobile={mobile}/>
    <gridHelper args={[6,12,'#30435b','#1d2b3e']}/>
    <Suspense fallback={null}>
      <Fighter actor={actor} outfit={outfit} technique={technique} playback={playback} skeleton={skeleton} onReport={onReport} onReady={onReady} lowCost={mobile||quality==='performance'}/>
    </Suspense>
    <OrbitControls target={[0,1.0,0]} minDistance={1.25} maxDistance={7} enableDamping dampingFactor={.12}/>
   </Canvas>
  </RenderErrorBoundary>}
  {!error && supported && !ready && <div className="viewerState" role="status"><span className="spinner"/>Chargement du combattant et de sa tenue…{slow&&<p>Le chargement est anormalement long. Vérifie la connexion puis relance le rendu.</p>}</div>}
  {(error||slow)&&<div className="viewerState viewerError" role="alert"><strong>{error?'Erreur de rendu 3D':'Chargement trop long'}</strong><p>{error||'Le modèle n’a pas pu être affiché dans le délai attendu.'}</p><button type="button" onClick={()=>window.location.reload()}>↻ Relancer le moteur</button><p className="help">Si cela se reproduit, sélectionne le mode « Performance » et relance.</p></div>}
  {ready&&!error&&<span className="viewHint">Glisser pour tourner · Pincer pour zoomer</span>}
 </div>;
}
const actors=[{id:'mma-kadir',name:'Kadir — Homme'},{id:'mma-amara',name:'Amara — Femme'}] as const;
const disciplines=[['boxe','Boxe anglaise'],['kickboxing','Kick-boxing'],['mma','MMA'],['muaythai','Muay-thaï'],['bjj','BJJ'],['judo','Judo']] as const;
export function App(){
 const [actor,setActor]=useState<Actor>('mma-kadir'),[discipline,setDiscipline]=useState('boxe'),[technique,setTechnique]=useState<Technique>('hook-left'),[progress,setProgress]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(.5),[skeleton,setSkeleton]=useState(false),[quality,setQuality]=useState<Quality>(initialQuality),[report,setReport]=useState<RigReport|null>(null);
 const playback=useRef<Playback>({progress:0,playing:false,speed:.5});
 playback.current.playing=playing;
 playback.current.speed=speed;
 const seek=useCallback((p:number)=>{playback.current.progress=p;setProgress(p);},[]);
 const onReport=useCallback((r:RigReport)=>setReport(r),[]);
 useEffect(()=>{if(!playing)return;const id=window.setInterval(()=>setProgress(playback.current.progress),200);return()=>window.clearInterval(id);},[playing]);
 const resetActor=(id:Actor)=>{setPlaying(false);seek(0);setReport(null);setActor(id);};
 const resetDiscipline=(d:string)=>{setPlaying(false);seek(0);setReport(null);setDiscipline(d);};
 return <main className="app">
  <header><span className="eyebrow">COMBAT MOTION ENGINE · 0.3 ANATOMY FIX</span><h1>CME-3D <span>Motion Lab</span></h1><p>Prototype 3D indépendant · Optimisation Android et diagnostics de rendu</p></header>
  <section className="layout"><aside className="panel">
   <h2>Combattant</h2>
   <label>Personnage<select value={actor} onChange={e=>resetActor(e.target.value as Actor)}>{actors.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
   <label>Discipline et tenue<select value={discipline} onChange={e=>resetDiscipline(e.target.value)}>{disciplines.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
   <h2>Mouvement</h2>
   <label>Technique<select value={technique} onChange={e=>{setTechnique(e.target.value as Technique);setPlaying(false);seek(0);}}><option value="hook-left">Crochet gauche</option><option value="hook-right">Crochet droit</option></select></label>
   <div className="notice">{discipline==='boxe'?'Premières trajectoires expérimentales. Validation martiale à réaliser.':'Tenue disponible ; les animations spécifiques à cette discipline ne sont pas encore développées.'}</div>
   <label className="check"><input type="checkbox" checked={skeleton} onChange={e=>setSkeleton(e.target.checked)}/>Afficher le squelette</label>
   <h2>Qualité graphique</h2>
   <label>Rendu<select value={quality} onChange={e=>{setPlaying(false);setQuality(e.target.value as Quality);}}>
     <option value="performance">Performance · GPU réduit</option><option value="balanced">Équilibré · recommandé mobile</option><option value="detail">Détaillé · appareil puissant</option>
   </select></label>
   <h2>Lecture</h2><div className="buttons"><button onClick={()=>setPlaying(v=>!v)}>{playing?'⏸ Pause':'▶ Lecture'}</button><button onClick={()=>{setPlaying(false);seek(0);}}>↺ Début</button></div>
   <input aria-label="Position de lecture" type="range" min="0" max="1000" value={Math.round(progress*1000)} onChange={e=>{setPlaying(false);seek(Number(e.target.value)/1000);}}/>
   <p>{Math.round(progress*100)} %</p>
   <label>Vitesse<select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.25}>0,25 ×</option><option value={.5}>0,5 ×</option><option value={1}>1 ×</option></select></label>
   <div className="notice">IA locale expérimentale, entraînée sur données synthétiques. <strong>Non validée biomécaniquement.</strong> Aucun appel IA cloud pendant l'animation.</div>
  </aside>
  <div className="stage"><div className="stageTop"><strong>{actor==='mma-kadir'?'Kadir':'Amara'}</strong><span>{technique==='hook-left'?'Crochet gauche':'Crochet droit'}</span></div>
    <Viewer key={actor+'-'+discipline+'-'+quality} actor={actor} outfit={discipline} technique={technique} playback={playback} skeleton={skeleton} quality={quality} onReport={onReport}/>
    <p className="note">Modèles photo-texturés originaux avec éclairage mobile optimisé. Nouveaux visages réalistes et shaders artistiques : non développés.</p>
  </div></section>
  <section className="panel diagnostics"><h2>Contrôle des articulations</h2><div className="stats"><div>Os reconnus<strong>{report?.bones??'—'}</strong></div><div>Bras IK<strong>{report?(report.leftArm&&report.rightArm?'2/2':'Incomplet'):'—'}</strong></div><div>Jambes IK<strong>{report?(report.leftLeg&&report.rightLeg?'2/2':'Incomplet'):'—'}</strong></div><div>Erreurs bras<strong>{report?.armClamps??'—'}</strong></div><div>Erreur appuis<strong>{report?(report.footErrorMetres*100).toFixed(1)+' cm':'—'}</strong></div></div></section>
  <footer>Version expérimentale autonome, séparée de Shadow. Les animations et le rendu final restent à valider sur appareils réels.</footer>
 </main>;
}
