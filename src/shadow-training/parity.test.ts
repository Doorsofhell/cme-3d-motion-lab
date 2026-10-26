import {describe,expect,it} from 'vitest';
import {DISCIPLINES,LEVELS} from './domain/types';
import {TECHNIQUES} from './domain/techniques';
import {EXERCISES} from './domain/exercises';
import {PROGRAMS} from './domain/programs';
import {MODE_LABEL,exercisePlan,programPlan} from './plan';
import {ShadowTrainingMachine} from './session';
import {shadowExerciseMotionId,shadowItemAvailability,shadowExercisesFor} from './bridge';
import {SHADOW_SNAPSHOT_SHA} from './source';
// @ts-ignore — lecture des sources exécutée par Vitest sous Node.
import {readFileSync} from 'node:fs';
const source=(p:string)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
describe('CME-3D — choix Shadow importés en lecture seule',()=>{
 it('conserve les 6 disciplines, 4 niveaux et 6 modes exacts du dépôt Shadow',()=>{
  expect(DISCIPLINES.map(x=>x.id)).toEqual(['boxe','kickboxing','mma','muaythai','bjj','judo']);
  expect(LEVELS.map(x=>x.id)).toEqual(['debutant','intermediaire','avance','expert']);
  expect(Object.keys(MODE_LABEL)).toEqual(['libre','technique','cardio','rounds','programme','personnalise']);
  expect(SHADOW_SNAPSHOT_SHA).toMatch(/^[a-f0-9]{40}$/);
 });
 it('présente tous les 208 exercices Shadow et les techniques réelles',()=>{
  expect(EXERCISES).toHaveLength(208);
  expect(new Set(EXERCISES.map(x=>x.id)).size).toBe(208);
  expect(TECHNIQUES.length).toBeGreaterThanOrEqual(70);
  for(const discipline of DISCIPLINES){
   for(const level of LEVELS){
    expect(shadowExercisesFor(discipline.id,level.id).length).toBeGreaterThan(0);
   }
  }
 });
 it('convertit les séquences dans CME sans remplacement fictif par la garde',()=>{
  const simple=EXERCISES.find(x=>x.id==='boxe-debutant-02');
  expect(simple?.sequence).toEqual(['jab']);
  expect(shadowExerciseMotionId({key:simple!.id,sequence:simple!.sequence})).toBe('jab');
  expect(shadowItemAvailability({key:simple!.id,sequence:simple!.sequence},['jab']).supported).toBe(true);
  expect(shadowItemAvailability({key:simple!.id,sequence:simple!.sequence},['garde']).supported).toBe(false);
  expect(shadowItemAvailability({key:simple!.id,sequence:simple!.sequence},null).supported).toBe(false);
  const combo=EXERCISES.find(x=>x.id==='boxe-debutant-08');
  expect(shadowExerciseMotionId({key:combo!.id,sequence:combo!.sequence})).toBe('shadow-boxe-debutant-08');
  expect(shadowExerciseMotionId({key:'inconnu',sequence:['jab','direct']})).toBeNull();
 });
 it('respecte les durées et modes exactement issus du plan Shadow',()=>{
  const options={roundSec:180,restSec:45,rounds:4};
  const cardio=exercisePlan('boxe-debutant-02','cardio',options);
  expect(cardio?.items[cardio.start]).toMatchObject({work:60,rounds:5,roundRest:20});
  const rounds=exercisePlan('boxe-debutant-02','rounds',options);
  expect(rounds?.items[rounds.start]).toMatchObject({work:180,rounds:4,roundRest:45});
  const technique=exercisePlan('boxe-debutant-02','technique',options);
  expect(technique?.items[technique.start].speed).toBeLessThanOrEqual(.45);
  expect(PROGRAMS.length).toBeGreaterThan(1);
  expect(programPlan(PROGRAMS[0].id)?.items.length).toBe(PROGRAMS[0].blocks.length);
 });
 it('enchaîne décompte, travail, pause, reprises et repos sans caméra ni tracking',()=>{
  let now=0;
  const plan=exercisePlan('boxe-debutant-02','rounds',{roundSec:30,restSec:10,rounds:2})!;
  const engine=new ShadowTrainingMachine(plan,()=>now);
  engine.start();expect(engine.snapshot().phase).toBe('decompte');
  now=4000;engine.tick();expect(engine.snapshot().phase).toBe('travail');
  engine.onRep();expect(engine.snapshot().reps).toBe(1);
  engine.pause();now=54000;engine.tick();expect(engine.snapshot().phase).toBe('travail');
  engine.resume();now=85000;engine.tick();expect(engine.snapshot()).toMatchObject({phase:'repos',round:2});
  now=96000;engine.tick();expect(engine.snapshot().phase).toBe('travail');
 });
 it('connecte le modèle créé dans Studio au vrai moteur CME et exclut les moteurs Shadow',()=>{
  const app=source('lab/App.tsx'),f=source('lab/Fighter.tsx'),studio=source('lab/StudioCoach.tsx'),panel=source('shadow-training/ShadowTrainingPanel.tsx');
  expect(app).toContain('<ShadowTrainingPanel');
  expect(app).toContain("coachLook={selectedCoach?.look??null}");
  expect(app).toContain("onRepetition={onShadowRep}");
  expect(f).toContain("new CoachRig(scene)");
  expect(f).toContain("new MotionSampler(rig,motion)");
  expect(f).toContain("new SequenceSampler(rig,library,seq.motions)");
  expect(f).toContain("applyCoachLookGeometry(s,coachLook)");
  expect(studio).toContain("localStorage.setItem('cme-lab-coach',id)");
  expect(panel).toContain("label>Mode<select aria-label=\"Mode Shadow\"");
  expect(panel).toContain('Type de choix Shadow');
  expect(panel).not.toContain('getUserMedia');
  expect(app).not.toContain("from '../three/CoachStage'");
 });
});
