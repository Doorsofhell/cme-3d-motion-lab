import {describe,it,expect} from 'vitest';
import {harmonizeBodyScalars,LIMITS,type BodyScalars} from './anatomicalHarmony';
import {resolvedProportions} from './coachProportions';
import {defaultCoachLook,normalizeCoachLook,parseCoachLookJson} from './StudioCoach';
import {activeShapeGroups} from './visualShapePresets';
const neutral:BodyScalars={shoulders:1,muscle:1,waist:1,roundness:1,hips:1,glutes:1,thighs:1,bust:1};
describe('0.7.43 — morphologie homme/femme harmonisée',()=>{
 it('préserve à l’identique les proportions originales et valeurs enregistrées',()=>{
  expect(harmonizeBodyScalars('femme',neutral)).toEqual(neutral);
  expect(harmonizeBodyScalars('homme',neutral)).toEqual(neutral);
 });
 it('répartit graduellement le volume des fessiers vers hanches et cuisses',()=>{
  const value={...neutral,glutes:1.3};
  const woman=harmonizeBodyScalars('femme',value),man=harmonizeBodyScalars('homme',value);
  expect(woman.hips).toBeGreaterThan(1);
  expect(woman.thighs).toBeGreaterThan(1);
  expect(woman.hips).toBeGreaterThan(man.hips);
  expect(value.hips).toBe(1);
  expect(woman.glutes).toBeLessThanOrEqual(LIMITS.glutes[1]);
 });
 it('offre les mêmes rubriques mais un langage anatomique adapté',()=>{
  const a=activeShapeGroups('homme'),b=activeShapeGroups('femme');
  expect(a.map(g=>g.id)).toEqual(b.map(g=>g.id));
  expect(a.find(g=>g.id==='bust')?.label).toBe('Pectoraux');
  expect(b.find(g=>g.id==='bust')?.label).toBe('Poitrine');
  expect(a.find(g=>g.id==='glutes')?.label).toContain('Fessiers');
  expect(b.find(g=>g.id==='glutes')?.label).toContain('Galbe');
 });
 it('répartit le poids par sexe et les tailles tout en gardant des corps diversifiés',()=>{
  const female=normalizeCoachLook({...defaultCoachLook,sex:'femme',hips:1.15,glutes:1.1});
  const original=resolvedProportions(female,165,63),heavy=resolvedProportions(female,165,82);
  expect(heavy.waist).toBeGreaterThan(original.waist);
  expect(heavy.hips).toBeGreaterThan(original.hips);
  expect(heavy.glutes).toBeGreaterThan(original.glutes);
  expect(heavy.thighs).toBeGreaterThan(original.thighs);
  const woman=resolvedProportions(normalizeCoachLook({...defaultCoachLook,sex:'femme'}),165,80);
  const man=resolvedProportions(defaultCoachLook,175,94);
  expect(woman.hips-1).toBeGreaterThan(man.hips-1);
 });
 it('accepte le JSON historique sans fessiers puis sauvegarde le nouveau contrôle',()=>{
  const legacy=Object.fromEntries(Object.entries(defaultCoachLook).filter(([key])=>key!=='glutes'));
  const restored=parseCoachLookJson(JSON.stringify({schema:'cme-coach-look-v1',look:legacy}));
  expect(restored.glutes).toBe(1);
  const modern=normalizeCoachLook({...restored,sex:'femme',glutes:1.26});
  expect(parseCoachLookJson(JSON.stringify({schema:'cme-coach-look-v1',look:modern})).glutes).toBe(1.26);
 });
});
