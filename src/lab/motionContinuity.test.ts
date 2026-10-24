import {describe,it,expect} from 'vitest';
import {acceleration} from './motionContinuity';
describe('motion continuity',()=>{
 it('is zero for uniform translation',()=>expect(acceleration(0,1,2,1,1)).toBe(0));
 it('detects sudden speed changes',()=>expect(acceleration(0,0,2,1,1)).toBe(2));
 it('rejects invalid timing',()=>expect(acceleration(0,1,2,0,1)).toBe(Infinity));
});
