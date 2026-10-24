import {describe,it,expect} from 'vitest';
import {NEUTRAL_HUMANOIDS,neutralValidationKey} from './neutralHumanoids';

describe('canonical neutral humanoid laboratory contract',()=>{
 it('defines exactly two neutral reference targets sharing one skeleton contract',()=>{
  expect(NEUTRAL_HUMANOIDS.map(h=>h.id)).toEqual(['neutral-male','neutral-female']);
  expect(new Set(NEUTRAL_HUMANOIDS.map(h=>h.canonicalSkeleton)).size).toBe(1);
  expect(NEUTRAL_HUMANOIDS.every(h=>h.appearance==='neutral'&&h.status==='profile_only')).toBe(true);
 });
 it('keeps validation separate by humanoid, discipline and engine revision',()=>{
  const key={discipline:'boxe' as const,motionId:'jab',engineRevision:'v1'};
  const male=neutralValidationKey({...key,humanoid:'neutral-male'});
  const female=neutralValidationKey({...key,humanoid:'neutral-female'});
  expect(male).not.toBe(female);
  expect(male).not.toBe(neutralValidationKey({...key,humanoid:'neutral-male',engineRevision:'v2'}));
 });
});
