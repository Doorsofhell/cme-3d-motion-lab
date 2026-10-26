import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {DISCIPLINES,LEVELS} from './domain/types';
import type {DisciplineId,LevelId,TrainingMode} from './domain/types';
import {TECHNIQUES} from './domain/techniques';
import {EXERCISES} from './domain/exercises';
import {PROGRAMS} from './domain/programs';
import {MODE_HELP,MODE_LABEL,customPlan,exercisePlan,programPlan,type PlanItem} from './plan';
import {shadowItemAvailability,shadowExercisesFor} from './bridge';
import {ShadowTrainingMachine,type ShadowSessionState} from './session';
import './training.css';

type Options={discipline:DisciplineId;coachName:string;availableMotions:readonly string[]|null;
 onExercise:(discipline:DisciplineId,motion:string|null)=>void;
 onPlayback:(playing:boolean,speed:number)=>void;
};
const MODES:readonly TrainingMode[]=['libre','technique','cardio','rounds','programme','personnalise'];
const format=(n:number)=>{const x=Math.max(0,Math.ceil(n));return `${Math.floor(x/60)}:${String(x%60).padStart(2,'0')}`;};
/** La sélection, les modes et les plans sont importés du Shadow au SHA figé ;
 * le Canvas et la biomécanique appartiennent à CME-3D.
 * Pas d'accès caméra, capture vidéo ou suivi des personnes.
 */
export function ShadowTrainingPanel({discipline,coachName,availableMotions,onExercise,onPlayback}:Options){
 const [level,setLevel]=useState<LevelId>('debutant');
 const [mode,setMode]=useState<TrainingMode>('libre');
 const [exerciseId,setExerciseId]=useState<string|null>(null);
 const [programId,setProgramId]=useState<string|null>(null);
 const [roundSec,setRoundSec]=useState(120);
 const [restSec,setRestSec]=useState(30);
 const [rounds,setRounds]=useState(3);
 const [customIds,setCustomIds]=useState<string[]>([]);
 const [toAdd,setToAdd]=useState('jab');
 const options={roundSec,restSec,rounds};
 const byDiscipline=useMemo(()=>shadowExercisesFor(discipline,level),[discipline,level]);
 const chosen=exerciseId&&byDiscipline.some(x=>x.id===exerciseId)?exerciseId:byDiscipline[0]?.id??null;
 const programs=useMemo(()=>PROGRAMS.filter(x=>x.discipline===discipline||x.discipline==='mixte'),[discipline]);
 const chosenProgram=programId&&programs.some(x=>x.id===programId)?programId:programs[0]?.id??null;
 const selectable=useMemo(()=>TECHNIQUES.filter(x=>x.disciplines.includes(discipline)),[discipline]);
 const plan=useMemo(()=>{
  if(mode==='programme')return chosenProgram?programPlan(chosenProgram):null;
  if(mode==='personnalise')return customIds.length?customPlan({id:'cme-session',name:'Mon enchaînement',discipline,sequence:customIds},level,mode,options):null;
  return chosen?exercisePlan(chosen,mode,options):null;
 },[mode,chosen,chosenProgram,discipline,level,customIds.join('|'),roundSec,restSec,rounds]);
 const machine=useMemo(()=>plan&&plan.items.length?new ShadowTrainingMachine(plan):null,[plan]);
 const [view,setView]=useState<ShadowSessionState|null>(()=>machine?.snapshot()??null);
 const lastMotion=useRef<string|null>(null);
 const pick=useCallback((item:PlanItem|undefined)=>{
  if(!item){onExercise(discipline,null);return;}
  const availability=shadowItemAvailability(item,availableMotions);
  lastMotion.current=availability.motion;
  onExercise(item.discipline,availability.motion);
 },[onExercise,availableMotions,discipline]);
 // When the plan changes, return to Shadow's "Prêt" and select the target exercise.
 useEffect(()=>{
  setView(machine?.snapshot()??null);
  pick(machine?.item);
  onPlayback(false,machine?.snapshot().speed??.7);
 },[machine]); // callbacks use the immediately current arguments on creation
 const index=view?.itemIndex;
 useEffect(()=>{
  if(!machine||index===undefined)return;
  pick(machine.item);
 },[machine,index]);
 useEffect(()=>{
  if(!machine)return;
  const sync=()=>{
   const next=machine.tick();
   setView(current=>{
    if(current?.itemIndex!==next.itemIndex)pick(machine.item);
    return next;
   });
   onPlayback(next.phase==='travail'&&!next.paused,next.speed);
  };
  const id=window.setInterval(sync,100);
  const invisible=()=>{if(document.hidden){machine.pause();sync();}};
  document.addEventListener('visibilitychange',invisible);
  window.addEventListener('pagehide',invisible);
  return()=>{clearInterval(id);document.removeEventListener('visibilitychange',invisible);window.removeEventListener('pagehide',invisible);};
 },[machine,onPlayback]);
 const act=(fn:(s:ShadowTrainingMachine)=>void)=>{
  if(!machine)return;
  fn(machine);setView(machine.snapshot());const next=machine.snapshot();
  onPlayback(next.phase==='travail'&&!next.paused,next.speed);
 };
 const item=machine?.item;
 const status=item?shadowItemAvailability(item,availableMotions):{supported:false,motion:null,reason:'Choisir un exercice'};
 const canStart=!!machine&&status.supported;
 const selectDiscipline=(d:DisciplineId)=>{
  setExerciseId(null);setProgramId(null);setCustomIds([]);onExercise(d,null);
 };
 const add=()=>{
  if(!selectable.some(t=>t.id===toAdd)||customIds.length>=20)return;
  setCustomIds(a=>[...a,toAdd]);
 };
 return <section className="shadowTraining" aria-label="Entraînement selon le catalogue Shadow">
  <div className="shadowTrainingHeading"><strong>Entraînement</strong><span>Coach : <b>{coachName}</b></span></div>
  <div className="shadowTrainingSelectors">
   <label>Discipline<select aria-label="Discipline Shadow" value={discipline} onChange={e=>selectDiscipline(e.target.value as DisciplineId)}>
    {DISCIPLINES.map(d=><option value={d.id} key={d.id}>{d.name}</option>)}</select></label>
   <label>Niveau<select aria-label="Niveau Shadow" value={level} onChange={e=>{setLevel(e.target.value as LevelId);setExerciseId(null);}}>
    {LEVELS.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
   <label>Mode<select aria-label="Mode Shadow" value={mode} onChange={e=>setMode(e.target.value as TrainingMode)}>
    {MODES.map(x=><option key={x} value={x}>{MODE_LABEL[x]}</option>)}</select></label>
   {mode==='programme'?<label className="shadowTrainingWide">Programme Shadow<select aria-label="Programme Shadow" value={chosenProgram??''} onChange={e=>setProgramId(e.target.value)}>
    {programs.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>:
    mode==='personnalise'?<label className="shadowTrainingWide">Ajouter une technique Shadow<select aria-label="Technique pour l'enchaînement" value={toAdd} onChange={e=>setToAdd(e.target.value)}>
     {selectable.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>:
    <label className="shadowTrainingWide">Exercice / mouvement Shadow<select aria-label="Exercice Shadow" value={chosen??''} onChange={e=>setExerciseId(e.target.value)}>
     {byDiscipline.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>}
  </div>
  {mode==='personnalise'&&<div className="shadowTrainingCustom">
   <button type="button" onClick={add} disabled={!selectable.some(x=>x.id===toAdd)||customIds.length>=20}>Ajouter</button>
   <span>{customIds.length?customIds.map(id=>TECHNIQUES.find(t=>t.id===id)?.name??id).join(' → '):'Ajoutez des techniques pour créer votre enchaînement.'}</span>
   <button type="button" onClick={()=>setCustomIds(a=>a.slice(0,-1))} disabled={!customIds.length}>Retirer</button>
  </div>}
  {mode==='rounds'&&<div className="shadowTrainingDuration" aria-label="Configuration des rounds Shadow">
   <label>Travail (s)<input type="number" min={30} max={900} step={15} value={roundSec} onChange={e=>setRoundSec(Math.max(30,Math.min(900,Number(e.target.value)||30)))}/></label>
   <label>Repos (s)<input type="number" min={0} max={300} step={15} value={restSec} onChange={e=>setRestSec(Math.max(0,Math.min(300,Number(e.target.value)||0)))}/></label>
   <label>Rounds<input type="number" min={1} max={20} value={rounds} onChange={e=>setRounds(Math.max(1,Math.min(20,Number(e.target.value)||1)))}/></label>
  </div>}
  <div className="shadowTrainingSession">
   <div className="shadowTrainingStatus">
    <span><strong>{view?.phase==='pret'?'Prêt':view?.phase==='decompte'?'Prépare-toi':view?.phase==='travail'?'Travail':view?.phase==='repos'?'Repos':'Terminé'}</strong>
    {view?.paused?' · en pause':''}{item?' · '+(item.label??item.name):''}</span>
    <span className="shadowTrainingClock">{view?.remaining===null||view?.remaining===undefined?format(view?.sessionSec??0):format(view.remaining)}</span>
   </div>
   {view&&item&&<div className="shadowTrainingMeta" role="status">Round {view.round}/{item.rounds} · Exercice {view.itemIndex+1}/{plan?.items.length??1} · {view.reps} répétition(s) · {MODE_HELP[mode]}</div>}
   {view?.banner&&<div className="shadowTrainingBanner">{view.banner}</div>}
   {!status.supported&&<p className="shadowTrainingUnavailable" role="status">{status.reason}. Choisissez un autre mouvement compatible.</p>}
   <div className="shadowTrainingActions">
    <button type="button" onClick={()=>act(s=>s.goto(s.snapshot().itemIndex-1))} disabled={!machine||!view||view.itemIndex===0} aria-label="Exercice précédent">‹</button>
    {view?.phase==='pret'||view?.phase==='termine'?<button type="button" className="shadowTrainingPrimary" disabled={!canStart} onClick={()=>act(s=>s.start())}>▶ Démarrer</button>:
     view?.paused?<button type="button" className="shadowTrainingPrimary" onClick={()=>act(s=>s.resume())}>▶ Reprendre</button>:
     <button type="button" className="shadowTrainingPrimary" onClick={()=>act(s=>s.pause())}>Ⅱ Pause</button>}
    <button type="button" onClick={()=>act(s=>s.restart())} disabled={!canStart} aria-label="Recommencer">↺</button>
    <button type="button" onClick={()=>act(s=>s.goto(s.snapshot().itemIndex+1))} disabled={!machine||!view||view.itemIndex>=machine.plan.items.length-1} aria-label="Exercice suivant">›</button>
    <label className="shadowTrainingSpeed">Vitesse<select aria-label="Vitesse de la séance" value={view?.speed??.7} onChange={e=>act(s=>s.setSpeed(Number(e.target.value)))}>
      {[.25,.45,.55,.7,.75,.85,1,1.25,1.5].map(v=><option key={v} value={v}>{v}×</option>)}</select></label>
   </div>
  </div>
 </section>;
}
