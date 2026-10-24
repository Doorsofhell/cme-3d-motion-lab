import {useEffect,useRef,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {SceneCameraControls,SceneCameraButton,SceneLoadingBoundary,SceneToolbar,SceneLoadingIndicator} from './SceneControls';
import {useSceneFullscreen,SceneFullscreenButton} from './SceneFullscreen';
import {useGLTF} from '@react-three/drei';
import {NeutralRig,LAB_DISCIPLINES,type LabDiscipline,type NeutralRigReport} from './NeutralRig';
import './StudioCoach.css';
import {addSavedCoach,readSavedCoaches,updateSavedCoach,deleteSavedCoach} from './savedCoaches';

type Category='corps'|'visage'|'peau'|'cheveux'|'tenue'|'protections';
export type CoachLook={
 sex:'homme'|'femme';height:number;shoulders:number;muscle:number;waist:number;
 jaw:number;nose:number;eyes:number;skin:string;eyeColor:string;
 hairStyle:'rase'|'court'|'long';hairColor:string;
 top:'rashguard'|'tshirt'|'aucun';topColor:string;
 bottom:'short'|'legging';bottomColor:string;
 gloves:'boxe'|'mma'|'aucun';gloveColor:string;
 shins:boolean;shinColor:string;
};
export const defaultCoachLook:CoachLook={
 sex:'homme',height:1,shoulders:1,muscle:1,waist:1,jaw:1,nose:1,eyes:1,
 skin:'#b97a56',eyeColor:'#4a2f1e',hairStyle:'court',hairColor:'#201713',
 top:'aucun',topColor:'#252934',bottom:'short',bottomColor:'#d6363c',
 gloves:'aucun',gloveColor:'#d6363c',shins:false,shinColor:'#20232c'
};
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(v)?v:min));
export function normalizeCoachLook(input:Partial<CoachLook>):CoachLook{
 const out={...defaultCoachLook,...input};
 const num=(k:'height'|'shoulders'|'muscle'|'waist'|'jaw'|'nose'|'eyes',a:number,b:number)=>{out[k]=clamp(out[k],a,b);};
 num('height',.9,1.1);num('shoulders',.75,1.25);num('muscle',.7,1.35);num('waist',.75,1.3);
 num('jaw',.8,1.2);num('nose',.8,1.2);num('eyes',.8,1.2);
 for(const k of ['skin','eyeColor','hairColor','topColor','bottomColor','gloveColor','shinColor'] as const){
  if(!/^#[0-9a-fA-F]{6}$/.test(out[k]))out[k]=defaultCoachLook[k];
 }
 if(!['homme','femme'].includes(out.sex))out.sex='homme';
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
 const required=Object.keys(defaultCoachLook);
 if(required.some(k=>!(k in input)))throw Error('Profil incomplet');
 for(const k of required){
  const expected=typeof defaultCoachLook[k as keyof CoachLook];
  if(typeof input[k]!==expected)throw Error('Type de paramètre incorrect : '+k);
 }
 return normalizeCoachLook(input as CoachLook);
}
const sections:Category[]=['corps','visage','peau','cheveux','tenue','protections'];
const sectionNames:Record<Category,string>={corps:'Morphologie',visage:'Visage',peau:'Peau',cheveux:'Cheveux',tenue:'Tenue',protections:'Protections'};
export function StudioCoach(){
 const [look,setLook]=useState<CoachLook>(()=>{try{const id=localStorage.getItem('cme-selected-coach');return readSavedCoaches(localStorage).find(x=>x.id===id)?.look??defaultCoachLook;}catch{return defaultCoachLook;}});
 const [selectedId,setSelectedId]=useState<string|null>(()=>{try{return localStorage.getItem('cme-selected-coach');}catch{return null;}});
 const [section,setSection]=useState<Category>('corps');
 const [message,setMessage]=useState('');
 const [rigMode,setRigMode]=useState(true);
 const [cameraAuto,setCameraAuto]=useState(false);
 const sceneFullscreen=useSceneFullscreen();
 const [advancedOpen,setAdvancedOpen]=useState(false);
 const [discipline,setDiscipline]=useState<LabDiscipline>('boxing');
 const [motionId,setMotionId]=useState('garde');
 const [playing,setPlaying]=useState(true);
 const [showSkeleton,setShowSkeleton]=useState(false);
 const [report,setReport]=useState<NeutralRigReport|null>(null);
 // Ne pas charger les deux GLB au démarrage du Laboratoire. Précharger
 // l'autre silhouette seulement une fois le modèle courant effectivement prêt.
 useEffect(()=>{
  if(!report)return;
  const other=report.sex==='homme'?'mma-amara':'mma-kadir';
  useGLTF.preload(import.meta.env.BASE_URL+'fighters/'+other+'/photo.glb',import.meta.env.BASE_URL+'draco/');
 },[report?.sex]);
 const importRef=useRef<HTMLInputElement>(null);
 const update=<K extends keyof CoachLook>(key:K,value:CoachLook[K])=>setLook(l=>normalizeCoachLook({...l,[key]:value}));
 const range=(key:'height'|'shoulders'|'muscle'|'waist'|'jaw'|'nose'|'eyes',label:string,min:number,max:number)=><label className="coachField"><span>{label} <b>{look[key].toFixed(2)}</b></span><input type="range" min={min} max={max} step=".01" value={look[key]} onChange={e=>update(key,Number(e.target.value))}/></label>;
 const color=(key:'skin'|'eyeColor'|'hairColor'|'topColor'|'bottomColor'|'gloveColor'|'shinColor',label:string)=><label className="coachColor"><span>{label}</span><input type="color" value={look[key]} onChange={e=>update(key,e.target.value)}/></label>;
 const choose=<K extends 'sex'|'hairStyle'|'top'|'bottom'|'gloves'>(key:K,label:string,values:CoachLook[K][])=><label className="coachField"><span>{label}</span><select value={look[key]} onChange={e=>update(key,e.target.value as CoachLook[K])}>{values.map(v=><option key={v} value={v}>{v}</option>)}</select></label>;
 const importJson=async(file:File|undefined)=>{
  if(!file)return;
  try{
   if(file.size>100_000)throw Error('Fichier trop volumineux');
   const next=parseCoachLookJson(await file.text());
   setLook(next);setMessage('Profil importé et paramètres validés.');
  }catch(error){setMessage('Import refusé : '+(error instanceof Error?error.message:'fichier invalide'));}
 };
 const saveCoach=()=>{try{const existing=readSavedCoaches(localStorage).find(c=>c.id===selectedId);const name=window.prompt('Nom du coach',existing?.name??(look.sex==='homme'?'Coach homme':'Coach femme'))?.trim();if(!name)return;const id=existing?.id??crypto.randomUUID();const profile={id,name:name.slice(0,60),createdAt:existing?.createdAt??new Date().toISOString(),look};if(existing)updateSavedCoach(localStorage,profile);else addSavedCoach(localStorage,profile);setSelectedId(id);localStorage.setItem('cme-selected-coach',id);window.dispatchEvent(new Event('cme-coaches-changed'));setMessage(existing?'Modifications du coach enregistrées.':'Nouveau coach enregistré et disponible dans le Laboratoire.');}catch{setMessage('Enregistrement impossible sur cet appareil.');}};
 const newCoach=()=>{setSelectedId(null);setLook(defaultCoachLook);try{localStorage.removeItem('cme-selected-coach');}catch{}setMessage('Nouveau personnage : choisissez un modèle neutre, puis personnalisez-le.');};
 const removeCoach=()=>{if(!selectedId||!window.confirm('Supprimer définitivement ce coach de cet appareil ?'))return;try{deleteSavedCoach(localStorage,selectedId);if(localStorage.getItem('cme-lab-coach')===selectedId)localStorage.removeItem('cme-lab-coach');localStorage.removeItem('cme-selected-coach');setSelectedId(null);setLook(defaultCoachLook);window.dispatchEvent(new Event('cme-coaches-changed'));setMessage('Coach supprimé.');}catch{setMessage('Suppression impossible.');}};
 const exportJson=()=>{const json=JSON.stringify({schema:'cme-coach-look-v1',look},null,2);const blob=new Blob([json],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='cme-coach-look.json';a.click();URL.revokeObjectURL(url);setMessage('Configuration exportée : apparence uniquement, sans modification du moteur.');};
 return <section className="coachStudio" aria-label="Studio Coach">
  <header className="coachStudioHeader"><div><small>STUDIO COACH</small><h2>Votre combattant</h2></div></header>
  <div className="coachStudioLayout">
   <div ref={sceneFullscreen.ref as React.RefObject<HTMLDivElement>} className={`coachPreview ${sceneFullscreen.fullscreen?"cmeFullscreen":""}`} onDoubleClick={sceneFullscreen.onDoubleClick} onTouchEnd={sceneFullscreen.onTouchEnd} aria-label="Aperçu 3D du mannequin ; double clic pour agrandir">
    <SceneToolbar variant="studio" actions={<><SceneCameraButton automatic={cameraAuto} onToggle={()=>setCameraAuto(v=>!v)}/><SceneFullscreenButton fullscreen={sceneFullscreen.fullscreen} onClick={sceneFullscreen.toggle}/></>}>
     <div className="coachRigSwitch" role="group" aria-label="Mode du modèle 3D"><button type="button" className={!rigMode?'active':''} aria-pressed={!rigMode} onClick={()=>setRigMode(false)}>Coach</button><button type="button" className={rigMode?'active':''} aria-pressed={rigMode} onClick={()=>setRigMode(true)}>Anatomie</button></div>
    </SceneToolbar>
    <SceneLoadingIndicator/>
    <div className="coachCanvasViewport"><Canvas camera={{position:[0,1.3,4.5],fov:38}} dpr={[1,1.5]} gl={{antialias:true}}>
     <color attach="background" args={['#e6edf6']}/><ambientLight intensity={2}/><directionalLight position={[3,5,4]} intensity={2.6}/>
     <SceneLoadingBoundary><NeutralRig key={`${look.sex}-${rigMode?'neutral':'appearance'}`} mode={rigMode?'neutral':'appearance'} sex={look.sex} discipline={discipline} motionId={motionId} playing={playing} speed={1} showSkeleton={showSkeleton} autoCadrage={!cameraAuto} onReport={setReport} appearance={{skin:look.skin,hairColor:look.hairColor,topColor:look.topColor,bottomColor:look.bottomColor,gloveColor:look.gloveColor}} proportions={{height:look.height,shoulders:look.shoulders,muscle:look.muscle,waist:look.waist}}/></SceneLoadingBoundary>
     <SceneCameraControls automatic={cameraAuto} motion={motionId}/>
    </Canvas></div>
    <span className="coachPreviewLabel">{rigMode?'Anatomie 3D':'Aperçu 3D'}</span>
   </div>
   <div className="coachEditor">
    <div className="coachQuickChoice" role="group" aria-label="Choisir le modèle">
      <button className={look.sex==='homme'?'active':''} onClick={()=>update('sex','homme')}>Homme</button>
      <button className={look.sex==='femme'?'active':''} onClick={()=>update('sex','femme')}>Femme</button>
    </div>
    <nav className="coachCategories" aria-label="Personnalisation">{sections.map(item=><button key={item} className={section===item?'active':''} aria-current={section===item?'true':undefined} onClick={()=>setSection(item)}>{sectionNames[item]}</button>)}</nav>

    {<details className="coachAdvanced"><summary>Tester les mouvements</summary><div className="coachRigControls">
      <label>Discipline <select value={discipline} onChange={e=>{setDiscipline(e.target.value as LabDiscipline);setReport(null);}}>{LAB_DISCIPLINES.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
      <label>Mouvement <input value={motionId} onChange={e=>setMotionId(e.target.value)} placeholder="garde"/></label>
      <button onClick={()=>setPlaying(v=>!v)}>{playing?'Pause':'Lecture'}</button>
      <label><input type="checkbox" checked={showSkeleton} onChange={e=>setShowSkeleton(e.target.checked)}/> Squelette</label>
      <small>{report?report.available?`${report.bones} os · ${report.duration.toFixed(2)} s`:'Mouvement indisponible : garde de secours':'Chargement du rig…'}</small>
     </div></details>}
    <div className="coachFields">
     {section==='corps'&&<><div className="coachQuickChoice"><button onClick={()=>setLook(l=>normalizeCoachLook({...l,muscle:.8,shoulders:.85,waist:.9}))}>Fin</button><button onClick={()=>setLook(l=>normalizeCoachLook({...l,muscle:1,shoulders:1,waist:1}))}>Standard</button><button onClick={()=>setLook(l=>normalizeCoachLook({...l,muscle:1.25,shoulders:1.2,waist:1.05}))}>Athlétique</button></div></>}
     {section==='visage'&&<>{range('jaw','Mâchoire',.8,1.2)}{range('nose','Nez',.8,1.2)}{range('eyes','Yeux',.8,1.2)}{color('eyeColor','Couleur des yeux')}</>}
     {section==='peau'&&color('skin','Teint')}
     {section==='cheveux'&&<>{choose('hairStyle','Coiffure',['rase','court','long'])}{color('hairColor','Couleur des cheveux')}</>}
     {section==='tenue'&&<><p className="coachAvailability">Les tenues personnalisées nécessitent un modèle 3D compatible. Aucune tenue non visible n’est annoncée comme portée.</p>{color('topColor','Couleur du haut existant')}{color('bottomColor','Couleur du bas existant')}</>}
     {section==='protections'&&<><p className="coachAvailability">Les équipements ajoutés seront proposés lorsque leurs maillages 3D seront disponibles.</p>{color('gloveColor','Couleur des gants existants')}</>}
    </div>
    <details className="coachAdvanced"><summary>Réglages de morphologie</summary><div className="coachFields">{section==='corps'&&<>{range('height','Taille relative',.9,1.1)}{range('shoulders','Épaules',.75,1.25)}{range('muscle','Musculature',.7,1.35)}{range('waist','Taille',.75,1.3)}</>}</div></details>
    <div className="coachCrud"><button type="button" onClick={newCoach}>Nouveau</button><button type="button" className="coachSave" onClick={saveCoach}>{selectedId?'Enregistrer les modifications':'Créer et enregistrer le coach'}</button>{selectedId&&<button type="button" onClick={removeCoach}>Supprimer</button>}</div>
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
