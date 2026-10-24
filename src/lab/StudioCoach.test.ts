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
 it('rejects invalid color values',()=>{
  expect(normalizeCoachLook({...defaultCoachLook,skin:'javascript:alert(1)'}).skin).toBe(defaultCoachLook.skin);
 });
});