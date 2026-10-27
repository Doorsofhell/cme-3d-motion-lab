import {describe,it,expect} from 'vitest';
import {currentAtlasCapabilities,canEditAtlasShape} from './atlasCapabilities';
import type {NeutralRigReport} from './NeutralRig';
import {SHAPE_GROUPS} from './visualShapePresets';
const support={colors:{skin:1,eyeColor:0,hairColor:0,topColor:0,bottomColor:0,gloveColor:0,shinColor:0},shape:{torsoVertices:150,hipVertices:0,thighVertices:40,bustVertices:0,faceMorphs:{jaw:0,nose:0,eyes:0}}};
const report={sex:'homme',appearanceSupport:support} as NeutralRigReport;
describe('Créateur Atlas — capacités du GLB actif',()=>{
 it('rejette les données du mannequin précédent',()=>{
  expect(currentAtlasCapabilities(report,'femme',false)).toBeNull();
  expect(currentAtlasCapabilities(report,'homme',true)).toBeNull();
  expect(currentAtlasCapabilities(null,'homme',false)).toBeNull();
 });
 it('autorise uniquement les formes réellement prises en charge',()=>{
  const actual=currentAtlasCapabilities(report,'homme',false);
  expect(actual).not.toBeNull();
  expect(canEditAtlasShape(SHAPE_GROUPS.find(x=>x.id==='shoulders')!,actual)).toBe(true);
  expect(canEditAtlasShape(SHAPE_GROUPS.find(x=>x.id==='hips')!,actual)).toBe(false);
  expect(canEditAtlasShape(SHAPE_GROUPS.find(x=>x.id==='jaw')!,actual)).toBe(false);
 });
});
