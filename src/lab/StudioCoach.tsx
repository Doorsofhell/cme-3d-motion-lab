import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {SceneCameraControls,SceneCameraButton,SceneLoadingBoundary,SceneToolbar,SceneLoadingIndicator} from './SceneControls';
import {useSceneFullscreen,SceneFullscreenButton} from './SceneFullscreen';
import {useGLTF} from '@react-three/drei';
import {alternateRigAsset} from './sceneRuntime';
import {watchWebGLContext} from './webglRecovery';
import {AndroidTelemetry,type LoadKind} from './androidTelemetry';
import {AndroidDiagnostics,AndroidFrameProbe} from './AndroidDiagnostics';
import {NeutralRig,LAB_DISCIPLINES,type LabDiscipline,type NeutralRigReport} from './NeutralRig';
import './StudioCoach.css';
import {SKIN_TONES} from './skinTones';
import {focusForSection,focusForSetting,FOCUS_LABELS,type StudioFocusZone} from './studioFocus';
import {addSavedCoach,readSavedCoaches,updateSavedCoach,deleteSavedCoach} from './savedCoaches';
import {studioTechniqueCatalog} from './studioTechniqueCatalog';
import {activeShapeGroups,applyShapePreset,randomShapeLook,type ShapeGroup} from './visualShapePresets';

type Category='corps'|'silhouette'|'visage'|'peau'|'cheveux'|'tenue'|'protections';
export type CoachLook={
 sex:'homme'|'femme';height:number;shoulders:number;muscle:number;waist:number;
 roundness:number;hips:number;thighs:number;bust:number;
 jaw:number;nose:number;eyes:number;skin:string;eyeColor:string;
 hairStyle:'rase'|'court'|'long';hairColor:string;
 top:'rashguard'|'tshirt'|'aucun';topColor:string;
 bottom:'short'|'legging';bottomColor:string;
 gloves:'boxe'|'mma'|'aucun';gloveColor:string;
 shins:boolean;shinColor:string;
};
export const defaultCoachLook:CoachLook={
 sex:'homme',height:1,shoulders:1,muscle:1,waist:1,roundness:1,hips:1,thighs:1,bust:1,jaw:1,nose:1,eyes:1,
 skin:'#b97a56',eyeColor:'#4a2f1e',hairStyle:'court',hairColor:'#201713',
 top:'aucun',topColor:'#252934',bottom:'short',bottomColor:'#d6363c',
 gloves:'aucun',gloveColor:'#d6363c',shins:false,shinColor:'#20232c'
};
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(v)?v:min));
export function normalizeCoachLook(input:Partial<CoachLook>):CoachLook{
 const out={...defaultCoachLook,...input};
 const num=(k:'height'|'shoulders'|'muscle'|'waist'|'roundness'|'hips'|'thighs'|'bust'|'jaw'|'nose'|'eyes',a:number,b:number)=>{out[k]=clamp(out[k],a,b);};
 num('height',.9,1.1);num('shoulders',.75,1.25);num('muscle',.7,1.35);num('waist',.75,1.3);
 num('jaw',.8,1.2);num('nose',.8,1.2);num('eyes',.8,1.2);
 num('roundness',.7,1.3);num('hips',.75,1.35);num('thighs',.75,1.3);num('bust',.75,1.35);
 for(const k of ['skin','eyeColor','hairColor','topColor','bottomColor','gloveColor','shinColor'] as const){
  if(!/^#[0-9a-fA-F]{6}$/.test(out[k]))out[k]=defaultCoachLook[k];
 }
 if(!['homme','femme'].includes(out.sex))out.sex='homme';
 if(out.sex!=='femme'){out.roundness=1;out.hips=1;out.thighs=1;out.bust=1;}
 if(!['rase','court','long'].includes(out.hairStyle))out.hairStyle='court';
 if(!['rashguard','tshirt','aucun'].includes(out.top))out.top='rashguard';
 if(!['short','legging'].includes(out.bottom))out.bottom='short';
 if(!['boxe','mma','aucun'].includes(out.gloves))out.gloves='boxe';
 out.shins=out.shins===true;
 return out;
}
export function parseCoachLookJson(text:string):CoachLook{
 const parsed:unknown=JSON.parse(text);
 if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('Format JSON invalide');
 const doc=parsed as Record<string,unknown>;
 if(doc.schema!=='cme-coach-look-v1')throw Error('Version de profil non prise en charge');
 if(!doc.look||typeof doc.look!=='object'||Array.isArray(doc.look))throw Error('Apparence absente');
 const input=doc.look as Record<string,unknown>;
 const legacy=Object.keys(defaultCoachLook).filter(k=>!['roundness','hips','thighs','bust'].includes(k));
 if(legacy.some(k=>!(k in input)))throw Error('Profil incomplet');
 for(const k of Object.keys(defaultCoachLook)){
  if(!(k in input))continue;
  const expected=typeof defaultCoachLook[k as keyof CoachLook];
  if(typeof input[k]!==expected)throw Error('Type de paramètre incorrect : '+k);
 }
 return normalizeCoachLook(input as CoachLook);
}
const sections:Category[]=['corps','silhouette','visage','peau','cheveux','tenue','protections'];
const sectionNames:Record<Category,string>={corps:'Morphologie',silhouette:'Silhouette femme',visage:'Visage',peau:'Peau',cheveux:'Cheveux',tenue:'Tenue',protections:'Protections'};
const disciplineNames:Record<LabDiscipline,string>={boxing:'Boxe anglaise',kickboxing:'Kick-boxing',muaythai:'Muay-thaï',mma:'MMA',bjj:'JJB',judo:'Judo'};
export function StudioCoach(){
 const [look,setLook]=useState<CoachLook>(()=>{try{const id=localStorage.getItem('cme-selected-coach');return normalizeCoachLook(readSavedCoaches(localStorage).find(x=>x.id===id)?.look??defaultCoachLook);}catch{return defaultCoachLook;}});
 const [selectedId,setSelectedId]=useState<string|null>(()=>{try{return localStorage.getItem('cme-selected-coach');}catch{return null;}});
 const [section,setSection]=useState<Category>('corps');
 const [message,setMessage]=useState('');
 const [rigMode,setRigMode]=useState(false);
 const [cameraAuto,setCameraAuto]=useState(false);
 const [focusZone,setFocusZone]=useState<StudioFocusZone>('corps');
 const [focusRequest,setFocusRequest]=useState(0);
 const selectFocus=(zone:StudioFocusZone)=>setFocusZone(zone);
 const recenter=(zone:StudioFocusZone)=>{setFocusZone(zone);setFocusRequest(n=>n+1);};
 const sceneFullscreen=useSceneFullscreen();
 const [advancedOpen,setAdvancedOpen]=useState(false);
 const [discipline,setDiscipline]=useState<LabDiscipline>('boxing');
 const [noGi,setNoGi]=useState(false);
 const [motionId,setMotionId]=useState('garde');
 const catalog=useMemo(()=>studioTechniqueCatalog(discipline),[discipline]);
 const [playing,setPlaying]=useState(false);
 const [testingMotion,setTestingMotion]=useState(false);
 const [showSkeleton,setShowSkeleton]=useState(false);
 const [report,setReport]=useState<NeutralRigReport|null>(null);
 const support=report?.appearanceSupport;
 const colors=useMemo(()=>({
  skin:look.skin,hairColor:look.hairColor,eyeColor:look.eyeColor,topColor:look.topColor,bottomColor:look.bottomColor,gloveColor:look.gloveColor,shinColor:look.shinColor
 }),[look.skin,look.hairColor,look.eyeColor,look.topColor,look.bottomColor,look.gloveColor,look.shinColor]);
 const dimensions=useMemo(()=>({height:look.height,shoulders:look.shoulders,muscle:look.muscle,waist:look.waist,
  sex:look.sex,roundness:look.roundness,hips:look.hips,thighs:look.thighs,bust:look.bust}),
  [look.height,look.shoulders,look.muscle,look.waist,look.sex,look.roundness,look.hips,look.thighs,look.bust]);
 const faceDimensions=useMemo(()=>({jaw:look.jaw,nose:look.nose,eyes:look.eyes}),[look.jaw,look.nose,look.eyes]);
 const colorAvailable=(key:'skin'|'eyeColor'|'hairColor'|'topColor'|'bottomColor'|'gloveColor'|'shinColor')=>!rigMode&&!!support?.colors[key];
 const faceAvailable=(key:'jaw'|'nose'|'eyes')=>!rigMode&&!!support?.shape.faceMorphs[key];

 const [androidTelemetry]=useState(()=>{
  const meter=new AndroidTelemetry('studio');
  meter.beginLoad(look.sex+'/'+(rigMode?'anatomie':'apparence'),'initial',performance.now());
  return meter;
 });
 const [webglStatus,setWebglStatus]=useState('');
 const [canvasRetry,setCanvasRetry]=useState(0);
 const canvasCleanup=useRef<(()=>void)|null>(null);
 useEffect(()=>()=>{canvasCleanup.current?.();canvasCleanup.current=null;},[]);
 const beginRigLoad=(sex:CoachLook['sex'],mode:boolean,kind:LoadKind)=>{
  androidTelemetry.beginLoad(sex+'/'+(mode?'anatomie':'apparence'),kind,performance.now());
 };
 const handleRigReport=useCallback((value:NeutralRigReport)=>{
  androidTelemetry.finishLoad(value.sex+'/'+(rigMode?'anatomie':'apparence'),performance.now());
  setReport(value);
 },[androidTelemetry,rigMode]);
 const onCanvasCreated=useCallback(({gl}:{gl:{domElement:HTMLCanvasElement}})=>{
  canvasCleanup.current?.();
  canvasCleanup.current=watchWebGLContext(gl.domElement,{
   onLost:()=>{
    androidTelemetry.recordContextLost(performance.now());
    setWebglStatus('Contexte WebGL perdu. La scène peut être relancée.');
   },
   onRestored:()=>{
    androidTelemetry.recordContextRestored(performance.now());
    setWebglStatus('Contexte WebGL restauré. Vérifier le mannequin et les commandes.');
   }
  });
 },[androidTelemetry]);
 // Ne pas charger les deux GLB au démarrage du Laboratoire. Précharger
 // l'autre silhouette seulement une fois le modèle courant effectivement prêt.
 useEffect(()=>{
  if(!report)return;
  const other=alternateRigAsset(report.sex);
  useGLTF.preload(import.meta.env.BASE_URL+'fighters/'+other+'/photo.glb',import.meta.env.BASE_URL+'draco/');
 },[report?.sex]);
 const importRef=useRef<HTMLInputElement>(null);
 const update=<K extends keyof CoachLook>(key:K,value:CoachLook[K])=>{
  if(key==='sex'&&look.sex!==value){beginRigLoad(value as CoachLook['sex'],rigMode,'switch');setReport(null);setSection('corps');recenter('corps');}
  if(key!=='sex')selectFocus(focusForSetting(key,section));
  setLook(l=>normalizeCoachLook({...l,[key]:value}));
 };
 const isShapeSupported=(group:ShapeGroup)=>!rigMode&&!!support&&(group.requires==='torso'?support.shape.torsoVertices>0:group.requires==='hip'?support.shape.hipVertices>0:group.requires==='thigh'?support.shape.thighVertices>0:group.requires==='bust'?support.shape.bustVertices>0:!!support.shape.faceMorphs[group.id as 'jaw'|'nose'|'eyes']);
 const shapePicker=(ids:string[])=><div className="coachShapeGroups">{activeShapeGroups(look.sex).filter(g=>ids.includes(g.id)).map(g=><section key={g.id} className="coachShapeGroup"><div className="coachShapeGroupTitle"><strong>{g.label}</strong><span>{isShapeSupported(g)?'Formes actives':'Asset 3D manquant'}</span></div><div className="coachShapeGrid">{g.presets.map(p=><button key={p.id} type="button" disabled={!isShapeSupported(g)} className={'coachShapeOption'+(Math.abs(look[g.id]-p.value)<.001?' active':'')} aria-pressed={Math.abs(look[g.id]-p.value)<.001} onClick={()=>{setTestingMotion(false);setPlaying(false);setMotionId('garde');setLook(v=>normalizeCoachLook(applyShapePreset(v,g.id,p.value)));recenter(g.zone);}}><span className="coachShapeSymbol" aria-hidden="true">{p.symbol}</span><span>{p.label}</span></button>)}</div></section>)}</div>;
 const range=(key:'height'|'shoulders'|'muscle'|'waist'|'roundness'|'hips'|'thighs'|'bust'|'jaw'|'nose'|'eyes',label:string,min:number,max:number,enabled=true)=>
  <label className="coachField"><span>{label} <b>{look[key].toFixed(2)}</b></span>
   <input type="range" min={min} max={max} step=".01" disabled={!enabled} value={look[key]} onFocus={()=>selectFocus(focusForSetting(key,section))} onChange={e=>update(key,Number(e.target.value))}/>
   {!enabled&&<small>Déformation non disponible sur ce GLB</small>}</label>;
 const color=(key:'skin'|'eyeColor'|'hairColor'|'topColor'|'bottomColor'|'gloveColor'|'shinColor',label:string)=>
  <label className="coachColor"><span>{label}{!colorAvailable(key)&&<small> · maillage non identifié</small>}</span>
   <input type="color" disabled={rigMode||!colorAvailable(key)} value={look[key]} onFocus={()=>selectFocus(focusForSetting(key,section))} onChange={e=>update(key,e.target.value)}/></label>;
 const choose=<K extends 'sex'|'hairStyle'|'top'|'bottom'|'gloves'>(key:K,label:string,values:CoachLook[K][],enabled=true)=>
  <label className="coachField"><span>{label}</span>
   <select disabled={!enabled} value={look[key]} onChange={e=>update(key,e.target.value as CoachLook[K])}>
    {values.map(v=><option key={v} value={v}>{v}</option>)}</select>
   {!enabled&&<small>Maillage/asset distinct non disponible</small>}</label>;
 const importJson=async(file:File|undefined)=>{
  if(!file)return;
  try{
   if(file.size>100_000)throw Error('Fichier trop volumineux');
   const next=parseCoachLookJson(await file.text());
   if(next.sex!==look.sex)beginRigLoad(next.sex,rigMode,'switch');
   setLook(next);setMessage('Profil importé et paramètres validés.');
  }catch(error){setMessage('Import refusé : '+(error instanceof Error?error.message:'fichier invalide'));}
 };
 const saveCoach=()=>{try{const existing=readSavedCoaches(localStorage).find(c=>c.id===selectedId);const name=window.prompt('Nom du coach',existing?.name??(look.sex==='homme'?'Coach homme':'Coach femme'))?.trim();if(!name)return;const id=existing?.id??crypto.randomUUID();const profile={id,name:name.slice(0,60),createdAt:existing?.createdAt??new Date().toISOString(),look:normalizeCoachLook(look)};if(existing)updateSavedCoach(localStorage,profile);else addSavedCoach(localStorage,profile);localStorage.setItem('cme-selected-coach',id);localStorage.setItem('cme-lab-coach',id);setSelectedId(id);window.dispatchEvent(new Event('cme-coaches-changed'));setMessage(existing?'Coach mis à jour et sélectionné dans le Laboratoire.':'Coach enregistré et sélectionné dans le Laboratoire.');}catch{setMessage('Enregistrement impossible sur cet appareil.');}};
 const newCoach=()=>{if(look.sex!=='homme')beginRigLoad('homme',rigMode,'switch');setSelectedId(null);setLook(defaultCoachLook);try{localStorage.removeItem('cme-selected-coach');}catch{}setMessage('Nouveau personnage : choisissez un modèle neutre, puis personnalisez-le.');};
 const removeCoach=()=>{if(!selectedId||!window.confirm('Supprimer définitivement ce coach de cet appareil ?'))return;try{deleteSavedCoach(localStorage,selectedId);if(localStorage.getItem('cme-lab-coach')===selectedId)localStorage.removeItem('cme-lab-coach');localStorage.removeItem('cme-selected-coach');setSelectedId(null);setLook(defaultCoachLook);window.dispatchEvent(new Event('cme-coaches-changed'));setMessage('Coach supprimé.');}catch{setMessage('Suppression impossible.');}};
 const exportJson=()=>{const json=JSON.stringify({schema:'cme-coach-look-v1',look},null,2);const blob=new Blob([json],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='cme-coach-look.json';a.click();URL.revokeObjectURL(url);setMessage('Configuration exportée : apparence uniquement, sans modification du moteur.');};
 return <section className="coachStudio" aria-label="Studio Coach">
  <header className="coachStudioHeader"><div><small>STUDIO COACH</small><h2>Votre combattant</h2></div></header>
  <div className="coachStudioLayout">
   <div ref={sceneFullscreen.ref as React.RefObject<HTMLDivElement>} className={`coachPreview ${sceneFullscreen.fullscreen?"cmeFullscreen":""}`} onDoubleClick={sceneFullscreen.onDoubleClick} onTouchEnd={sceneFullscreen.onTouchEnd} aria-label="Aperçu 3D du mannequin ; double clic pour agrandir">
    <SceneToolbar variant="studio" actions={<><SceneCameraButton automatic={cameraAuto} onToggle={()=>setCameraAuto(v=>!v)}/><SceneFullscreenButton fullscreen={sceneFullscreen.fullscreen} onClick={sceneFullscreen.toggle}/></>}>
     <div className="coachRigSwitch" role="group" aria-label="Mode du modèle 3D"><button type="button" className={!rigMode?'active':''} aria-pressed={!rigMode} onClick={()=>{if(rigMode){beginRigLoad(look.sex,false,'mode');setRigMode(false);}}}>Coach</button><button type="button" className={rigMode?'active':''} aria-pressed={rigMode} onClick={()=>{if(!rigMode){beginRigLoad(look.sex,true,'mode');setRigMode(true);}}}>Anatomie</button></div>
    </SceneToolbar>
    <SceneLoadingIndicator/>
    <div className="coachCanvasViewport"><Canvas key={canvasRetry} onCreated={onCanvasCreated} camera={{position:[0,1.3,4.5],fov:38}} dpr={[1,1.5]} gl={{antialias:true}}>
     <AndroidFrameProbe telemetry={androidTelemetry}/>
     <color attach="background" args={['#e6edf6']}/><hemisphereLight args={['#fff8ef','#677388',1.05]}/><ambientLight intensity={0.65}/><directionalLight position={[3,5,4]} intensity={1.55}/>
     <SceneLoadingBoundary><NeutralRig key={`${look.sex}-${rigMode?'neutral':'appearance'}`} mode={rigMode?'neutral':'appearance'} sex={look.sex} discipline={discipline} noGi={noGi} motionId={testingMotion?motionId:'garde'} creationPose={!testingMotion} playing={testingMotion&&playing} speed={1} showSkeleton={showSkeleton} autoCadrage={!cameraAuto} focusZone={focusZone} focusRequest={focusRequest} onReport={handleRigReport} appearance={colors} proportions={dimensions} face={faceDimensions}/></SceneLoadingBoundary>
     <SceneCameraControls automatic={cameraAuto} motion={motionId}/>
    </Canvas></div>
    <span className="coachPreviewLabel">{rigMode?'Anatomie 3D':'Coach en direct · '+(look.sex==='femme'?'Femme':'Homme')}</span>
    {!rigMode&&look.sex==='femme'&&<span className="coachLiveValues" role="status">Poitrine {Math.round(look.bust*100)} % · Rondeur {Math.round(look.roundness*100)} % · Hanches {Math.round(look.hips*100)} % · Cuisses {Math.round(look.thighs*100)} %</span>}
    {webglStatus&&<div className="coachWebglAlert" role="status"><span>{webglStatus}</span>
     <button type="button" onClick={()=>{beginRigLoad(look.sex,rigMode,'retry');setWebglStatus('');setCanvasRetry(v=>v+1);}}>Relancer la scène 3D</button>
     <button type="button" aria-label="Masquer le diagnostic WebGL" onClick={()=>setWebglStatus('')}>×</button>
    </div>}
   </div>
   <div className="coachEditor">
    <div className="coachQuickChoice" role="group" aria-label="Choisir le modèle">
      <button className={look.sex==='homme'?'active':''} onClick={()=>update('sex','homme')}>Homme</button>
      <button className={look.sex==='femme'?'active':''} onClick={()=>update('sex','femme')}>Femme</button>
    </div>
    <div className="coachFocusLine" role="status"><span>Cadre : {cameraAuto?'caméra pédagogique':FOCUS_LABELS[focusZone]}</span><button type="button" onClick={()=>{setCameraAuto(false);recenter('corps');}}>Vue entière</button></div>
    <p className="coachCapability" role="status">{rigMode?'Anatomie : modèle neutre ; réglages d’apparence suspendus.':support?('Personnalisation en direct : '+support.shape.torsoVertices+' sommets morphologiques · '+support.colors.skin+' matériaux de peau · '+(support.colors.topColor+support.colors.bottomColor)+' matériaux de tenue · '+support.colors.gloveColor+' matériaux de gants reconnus · '+support.colors.shinColor+' matériaux de protège-tibias.'):'Chargement du corps et de sa tenue 3D…'}</p>
    <nav className="coachCategories" aria-label="Personnalisation">{sections.filter(item=>item!=='silhouette'||look.sex==='femme').map(item=><button key={item} className={section===item?'active':''} aria-current={section===item?'true':undefined} onClick={()=>{setSection(item);recenter(focusForSection(item));}}>{sectionNames[item]}</button>)}</nav>

    {<details className="coachAdvanced"><summary>Tester les mouvements</summary><div className="coachRigControls">
      <label>Discipline <select value={discipline} onChange={e=>{setDiscipline(e.target.value as LabDiscipline);setMotionId('garde');setReport(null);}}>{LAB_DISCIPLINES.map(d=><option key={d} value={d}>{disciplineNames[d]}</option>)}</select></label>
      <label>Technique / enchaînement <select aria-label="Technique ou enchaînement" value={motionId} onChange={e=>{setMotionId(e.target.value);setTestingMotion(true);setPlaying(true);}}>
       <optgroup label="Techniques">{catalog.filter(m=>m.kind==='technique').map(m=><option key={m.id} value={m.id} disabled={!!report&&!report.motions.find(x=>x.id===m.id)?.supported}>{m.label}</option>)}</optgroup>
       <optgroup label="Enchaînements">{catalog.filter(m=>m.kind==='sequence').map(m=><option key={m.id} value={m.id} disabled={!!report&&!report.motions.find(x=>x.id===m.id)?.supported}>{m.label}</option>)}</optgroup>
      </select></label>
      <button onClick={()=>{setTestingMotion(true);setPlaying(v=>!v);}}>{playing?'Pause':'Lecture'}</button><button type="button" onClick={()=>{setPlaying(false);setTestingMotion(false);setMotionId('garde');recenter('corps');}}>Retour création</button>
      <label><input type="checkbox" checked={showSkeleton} onChange={e=>setShowSkeleton(e.target.checked)}/> Squelette</label>
      <small>{report?report.available?`${report.bones} os · ${report.duration.toFixed(2)} s`:'Mouvement indisponible : garde de secours':'Chargement du rig…'}</small>
     </div></details>}
    <div className="coachFields">
     {section==='corps'&&<><p className="coachAvailability">Choisissez une forme illustrée : l’aperçu se met à jour immédiatement, sans animation de combat.</p>{shapePicker(['shoulders','muscle','waist'])}<div className="coachQuickChoice"><button disabled={rigMode||!support?.shape.torsoVertices} onClick={()=>{recenter('corps');setLook(l=>normalizeCoachLook({...l,muscle:.8,shoulders:.85,waist:.9}));}}>Fin</button><button disabled={rigMode||!support?.shape.torsoVertices} onClick={()=>{recenter('corps');setLook(l=>normalizeCoachLook({...l,muscle:1,shoulders:1,waist:1}));}}>Standard</button><button disabled={rigMode||!support?.shape.torsoVertices} onClick={()=>{recenter('corps');setLook(l=>normalizeCoachLook({...l,muscle:1.25,shoulders:1.2,waist:1.05}));}}>Athlétique</button></div></>}
     {section==='silhouette'&&look.sex==='femme'&&<div className="coachFemaleShapes">{shapePicker(['roundness','bust','hips','thighs'])}<p className="coachAvailability">Volumes féminins sur les vrais sommets skinnés : les vêtements suivent les mêmes poids de squelette. Chaque curseur agit immédiatement, sans changer les mouvements.</p>{range('bust','Volume de poitrine',.75,1.35,!rigMode&&!!support?.shape.bustVertices)}{range('roundness','Rondeur générale',.7,1.3,!rigMode&&!!support?.shape.torsoVertices)}{range('hips','Largeur des hanches',.75,1.35,!rigMode&&!!support?.shape.hipVertices)}{range('thighs','Volume des cuisses',.75,1.3,!rigMode&&!!support?.shape.thighVertices)}<p className="coachAvailability">Le réglage de poitrine est une approximation localisée, non un morph anatomique sculpté. Pour davantage de finesse, ainsi que pour les fessiers isolés et les coiffures, de nouveaux morphs ou maillages restent nécessaires. Aucun réglage fictif n’est proposé.</p></div>}
     {section==='visage'&&<>{shapePicker(['jaw','nose','eyes'])}{range('jaw','Mâchoire',.8,1.2,faceAvailable('jaw'))}{range('nose','Nez',.8,1.2,faceAvailable('nose'))}{range('eyes','Yeux',.8,1.2,faceAvailable('eyes'))}{color('eyeColor','Couleur des yeux')}</>}
     {section==='peau'&&<div className="coachSkinEditor"><p className="coachAvailability">Choisissez une carnation naturelle. Le rendu préserve le grain et les détails de la texture du corps, sans superposer une seconde couleur sombre.</p><div className="coachSkinGrid" role="group" aria-label="Carnations naturelles">{SKIN_TONES.map(tone=><button type="button" key={tone.hex} disabled={rigMode||!colorAvailable('skin')} className={`coachSkinTone ${look.skin.toLowerCase()===tone.hex?'active':''}`} aria-pressed={look.skin.toLowerCase()===tone.hex} onClick={()=>{selectFocus('peau');update('skin',tone.hex);}} title={tone.name}><span className="coachSkinSwatch" style={{backgroundColor:tone.hex}}/><span>{tone.name}</span></button>)}</div><small className="coachSkinHint">{!colorAvailable('skin')?'Aucune zone de peau indépendante reconnue sur ce GLB.': 'Chaque sélection modifie immédiatement le matériau de peau dans cet aperçu.'}</small></div>}
     {section==='cheveux'&&<>{choose('hairStyle','Coiffure',['rase','court','long'],false)}{color('hairColor','Couleur des cheveux')}</>}
     {section==='tenue'&&<><p className="coachAvailability">L’aperçu charge la véritable tenue 3D de la discipline sélectionnée. Les couleurs sont modifiables uniquement sur les parties identifiées.</p><label className="coachField"><span>Tenue de discipline</span><select value={discipline} onChange={e=>{setDiscipline(e.target.value as LabDiscipline);setReport(null);}}>{LAB_DISCIPLINES.map(d=><option key={d} value={d}>{disciplineNames[d]}</option>)}</select></label>{discipline==='bjj'&&<label className="coachField"><span>Équipement JJB</span><select value={noGi?'nogi':'gi'} onChange={e=>{setNoGi(e.target.value==='nogi');setReport(null);}}><option value="gi">Gi · kimono</option><option value="nogi">No-Gi · rashguard</option></select></label>}{color('topColor','Couleur du haut existant')}{color('bottomColor','Couleur du bas existant')}</>}
     {section==='protections'&&<><p className="coachAvailability">Les gants éventuels de la tenue de {disciplineNames[discipline]} sont chargés avec son GLB. Seule leur couleur peut être ajustée si un matériau distinct est reconnu ; aucun équipement artificiel n’est ajouté.</p>{color('gloveColor','Couleur des gants existants')}{color('shinColor','Couleur des protège-tibias existants')}</>}
    </div>
    <details className="coachAdvanced"><summary>Réglages de morphologie</summary><div className="coachFields">{section==='corps'&&<>{range('height','Taille relative',.9,1.1,!rigMode)}{range('shoulders','Épaules',.75,1.25,!rigMode&&!!support?.shape.torsoVertices)}{range('muscle','Musculature',.7,1.35,!rigMode&&!!support?.shape.torsoVertices)}{range('waist','Taille',.75,1.3,!rigMode&&!!support?.shape.torsoVertices)}</>}</div></details>
    <AndroidDiagnostics telemetry={androidTelemetry} active={true} variant="studio" context={{sexe:look.sex,mode:rigMode?'anatomie':'apparence',discipline,mouvement:motionId}}/>
    <div className="coachCrud"><button type="button" onClick={()=>{setTestingMotion(false);setPlaying(false);setLook(l=>normalizeCoachLook(randomShapeLook(l)));recenter('corps');setMessage('Nouvelle combinaison morphologique générée. Enregistrez pour la conserver.');}}>↝ Silhouette aléatoire</button><button type="button" onClick={()=>window.dispatchEvent(new Event('cme-open-lab-coach'))}>Tester en Combat</button><button type="button" onClick={newCoach}>Nouveau</button><button type="button" className="coachSave" onClick={saveCoach}>{selectedId?'Enregistrer les modifications':'Créer et enregistrer le coach'}</button>{selectedId&&<button type="button" onClick={()=>window.dispatchEvent(new Event('cme-open-lab-coach'))}>Voir dans Laboratoire</button>}{selectedId&&<button type="button" onClick={removeCoach}>Supprimer</button>}</div>
    <button className="coachReset" onClick={()=>{setLook(defaultCoachLook);setMessage('Apparence réinitialisée');}}>Réinitialiser le personnage</button>
    <details className="coachAdvanced" open={advancedOpen} onToggle={e=>setAdvancedOpen(e.currentTarget.open)}><summary>Gestion du profil <span>Importer · Exporter</span></summary><div className="coachActions">
      <button onClick={exportJson}>Exporter JSON</button>
      <button onClick={()=>importRef.current?.click()}>Importer JSON</button>
      <input ref={importRef} type="file" accept=".json,application/json" hidden aria-label="Fichier de profil Coach" onChange={e=>{void importJson(e.target.files?.[0]);e.target.value='';}}/>
     </div></details>
    {message&&<p role="status" className="coachStatus">{message}</p>}
   </div>
  </div>
 </section>;
}
