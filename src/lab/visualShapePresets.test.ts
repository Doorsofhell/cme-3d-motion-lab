import {describe,expect,it} from 'vitest';
import {SHAPE_GROUPS,activeShapeGroups,applyShapePreset,randomShapeLook} from './visualShapePresets';
import {defaultCoachLook,normalizeCoachLook} from './StudioCoach';
describe('Atlas morphologique premium Studio',()=>{
 it('garantit des identifiants uniques pour chaque forme et des valeurs géométriques bornées',()=>{
  expect(SHAPE_GROUPS.length).toBeGreaterThanOrEqual(10);
  expect(new Set(SHAPE_GROUPS.map(x=>x.id)).size).toBe(SHAPE_GROUPS.length);
  for(const group of SHAPE_GROUPS){
   expect(group.presets.length).toBeGreaterThanOrEqual(3);
   expect(new Set(group.presets.map(x=>x.id)).size).toBe(group.presets.length);
   expect(group.presets.every(x=>x.value>=.7&&x.value<=1.35)).toBe(true);
  }
 });
 it('ne montre pas une poitrine féminine pour un homme',()=>{
  const homme=activeShapeGroups('homme');
  const femme=activeShapeGroups('femme');
  expect(homme.some(g=>g.id==='bust')).toBe(true);
  expect(femme.some(g=>g.id==='bust')).toBe(true);
  expect(homme.some(g=>g.id==='muscle')).toBe(true);
  expect(applyShapePreset(defaultCoachLook,'bust',1.35).bust).toBe(1.35);
 });
 it('applique une variante et laisse les autres réglages inchangés',()=>{
  const edited=applyShapePreset(defaultCoachLook,'muscle',1.2);
  expect(edited.muscle).toBe(1.2);
  expect(edited.skin).toBe(defaultCoachLook.skin);
  expect(defaultCoachLook.muscle).toBe(1);
 });
 it('génération déterministe et uniquement sur des formes supportées par le modèle de sexe choisi',()=>{
  const femme=normalizeCoachLook({...defaultCoachLook,sex:'femme'});
  const generated=randomShapeLook(femme,()=>.99);
  expect(generated.bust).toBe(1.35);
  expect(generated.hips).toBe(1.35);
  expect(randomShapeLook(femme,()=>.99)).toEqual(generated);
  const homme=randomShapeLook(defaultCoachLook,()=>0);
  expect(homme.bust).toBe(.76);
  expect(homme.muscle).toBe(.72);
 });
});
