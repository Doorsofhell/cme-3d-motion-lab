import {describe,it,expect} from 'vitest';
import {defaultCoachLook,normalizeCoachLook} from './StudioCoach';
describe('Studio Coach appearance isolation',()=>{
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