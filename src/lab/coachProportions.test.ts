import {describe,expect,it} from 'vitest';
import {defaultCoachLook,normalizeCoachLook} from './StudioCoach';
import {resolvedProportions} from './coachProportions';
import {activeShapeGroups} from './visualShapePresets';
import {EYE_TONES,HAIR_TONES} from './appearancePalettes';
describe('Portrait-robot : homme/femme et morphologie harmonisée',()=>{
 it('conserve les mêmes rubriques et les réglages corporels des deux sexes',()=>{
  const male=activeShapeGroups('homme').map(g=>g.id),female=activeShapeGroups('femme').map(g=>g.id);
  expect(male).toEqual(female);
  for(const id of ['hips','bust','thighs','roundness'])expect(male).toContain(id);
  expect(normalizeCoachLook({...defaultCoachLook,sex:'homme',hips:1.2,bust:1.1}).hips).toBe(1.2);
 });
 it('lie taille et poids sans écraser les préférences manuelles',()=>{
  const look={...defaultCoachLook,hips:1.1};
  const standard=resolvedProportions(look,175,77);
  const heavier=resolvedProportions(look,175,105);
  const taller=resolvedProportions(look,190,77);
  expect(standard.hips).toBeCloseTo(1.1);
  expect(heavier.waist).toBeGreaterThan(standard.waist);
  expect(heavier.hips).toBeGreaterThan(standard.hips);
  expect(heavier.thighs).toBeGreaterThan(standard.thighs);
  expect(taller.height).toBeGreaterThan(standard.height);
  expect(resolvedProportions(look,NaN,Infinity)).toEqual(resolvedProportions(look));
 });
 it('restitue les carnations et palettes complètes sans catégorie raciale',()=>{
  expect(EYE_TONES.length).toBeGreaterThanOrEqual(7);
  expect(HAIR_TONES.length).toBeGreaterThanOrEqual(8);
  for(const tone of [...EYE_TONES,...HAIR_TONES])expect(tone.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
 });
});
