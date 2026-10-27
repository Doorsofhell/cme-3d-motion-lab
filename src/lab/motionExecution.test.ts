import {describe,it,expect} from 'vitest';
import {executionKey,recordExecutionSample,playbackWasObserved,executionState} from './motionExecution';
describe('Recette : preuve d’exécution réelle des mouvements du rig',()=>{
 const key=executionKey('mma-kadir','boxe','coach-a','jab');
 it('refuse les valeurs invalides et les résultats absents',()=>{
  expect(recordExecutionSample(null,key,NaN,100)).toBeNull();
  expect(recordExecutionSample(null,key,-.5,100)).toBeNull();
  expect(playbackWasObserved(null,key)).toBe(false);
  expect(executionState(true,false,true)).toBe('unresolved');
 });
 it('ne valide pas une lecture trop courte ou n’atteignant pas la fin',()=>{
  let e=null;
  for(let i=0;i<6;i++)e=recordExecutionSample(e,key,.3,i*350);
  expect(e?.sampleCount).toBe(6);
  expect(playbackWasObserved(e,key)).toBe(false);
 });
 it('confirme seulement le rig ayant réellement échantillonné assez de frames et la fin',()=>{
  let e=null;
  for(let i=0;i<6;i++)e=recordExecutionSample(e,key,i*.19,i*350);
  expect(playbackWasObserved(e,key)).toBe(true);
  expect(playbackWasObserved(e,executionKey('mma-amara','boxe','coach-a','jab'))).toBe(false);
  expect(playbackWasObserved(e,executionKey('mma-kadir','boxe','coach-a','direct'))).toBe(false);
  expect(executionState(true,true,true)).toBe('sampled');
 });
 it('ne fusionne pas les traces de deux techniques ou deux lectures très éloignées',()=>{
  const a=recordExecutionSample(null,key,.4,1000);
  const b=recordExecutionSample(a,executionKey('mma-kadir','boxe','coach-a','direct'),.7,1500);
  expect(b?.sampleCount).toBe(1);
  const c=recordExecutionSample(b,executionKey('mma-kadir','boxe','coach-a','direct'),.8,5000);
  expect(c?.sampleCount).toBe(1);
 });
 it('distingue catalogue incomplet, moteur absent et mouvement non exécuté',()=>{
  expect(executionState(false,true,true)).toBe('catalog_incomplete');
  expect(executionState(true,false,false)).toBe('unresolved');
  expect(executionState(true,true,false)).toBe('not_observed');
 });
});
