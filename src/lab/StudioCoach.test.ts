import {describe,it,expect} from 'vitest';
import {defaultCoachLook,normalizeCoachLook,parseCoachLookJson} from './StudioCoach';
describe('Studio Coach appearance isolation',()=>{
 it('roundtrips exported schema and validates imported colors and proportions',()=>{
  const input={...defaultCoachLook,skin:'#663322',height:1.08};
  const output=parseCoachLookJson(JSON.stringify({schema:'cme-coach-look-v1',look:input}));
  expect(output).toEqual(input);
 });
 it('rejects wrong schema, missing values and maliciously typed properties',()=>{
  expect(()=>parseCoachLookJson(JSON.stringify({schema:'other',look:defaultCoachLook}))).toThrow();
  expect(()=>parseCoachLookJson(JSON.stringify({schema:'cme-coach-look-v1',look:{skin:'#ffffff'}}))).toThrow();
  expect(()=>parseCoachLookJson(JSON.stringify({schema:'cme-coach-look-v1',look:{...defaultCoachLook,height:'bad'}}))).toThrow();
 });

 it('starts from a valid reproducible neutral appearance preset',()=>{expect(normalizeCoachLook(defaultCoachLook)).toEqual(defaultCoachLook);});
 it('clamps body and facial controls without altering motion definitions',()=>{
  const result=normalizeCoachLook({...defaultCoachLook,height:50,muscle:-10,jaw:99});
  expect(result.height).toBe(1.1);expect(result.muscle).toBe(.7);expect(result.jaw).toBe(1.2);
  expect('motion' in result).toBe(false);expect('skeleton' in result).toBe(false);
 });
 it('conserve les profils JSON antérieurs sans nouveaux volumes féminins',()=>{
  const legacy=Object.fromEntries(Object.entries(defaultCoachLook).filter(([key])=>!['roundness','hips','thighs'].includes(key)));
  const parsed=parseCoachLookJson(JSON.stringify({schema:'cme-coach-look-v1',look:{...legacy,sex:'femme'}}));
  expect(parsed.roundness).toBe(1);expect(parsed.hips).toBe(1);expect(parsed.thighs).toBe(1);
 });
 it('plafonne les réglages féminins et ne les applique pas aux profils masculins',()=>{
  const female=normalizeCoachLook({...defaultCoachLook,sex:'femme',hips:4,roundness:10,thighs:-4});
  expect(female.hips).toBe(1.35);expect(female.roundness).toBe(1.3);expect(female.thighs).toBe(.75);
  const male=normalizeCoachLook({...defaultCoachLook,sex:'homme',hips:1.3,roundness:1.2,thighs:1.1});
  expect(male.hips).toBe(1);expect(male.roundness).toBe(1);expect(male.thighs).toBe(1);
 });
 it('conserve les réglages de poitrine dans les profils et les remet à neutre sur un homme',()=>{
  const female=normalizeCoachLook({...defaultCoachLook,sex:'femme',bust:8});
  expect(female.bust).toBe(1.35);
  const exported=JSON.stringify({schema:'cme-coach-look-v1',look:female});
  expect(parseCoachLookJson(exported).bust).toBe(1.35);
  expect(normalizeCoachLook({...female,sex:'homme'}).bust).toBe(1);
 });
 it('rejects invalid color values',()=>{
  expect(normalizeCoachLook({...defaultCoachLook,skin:'javascript:alert(1)'}).skin).toBe(defaultCoachLook.skin);
 });
});