import {describe,it,expect} from 'vitest';
import {clipAt,compileCoachTimeline} from './coachTimeline';
const plan={discipline:'boxe',speech:'Jab, puis direct.',sequence:[{animationId:'jab',speed:.5,repetitions:2},{animationId:'direct',speed:1,repetitions:1}]};
describe('Coach timeline',()=>{
 it('expands repetitions and respects speed',()=>{const t=compileCoachTimeline(plan,()=>1);expect(t.duration).toBe(5);expect(t.clips.map(x=>x.id)).toEqual(['jab','jab','direct']);expect(t.clips[1].start).toBe(2);expect(clipAt(t,4)?.id).toBe('direct');});
 it('rejects missing durations',()=>expect(()=>compileCoachTimeline(plan,()=>0)).toThrow());
 it('rejects out-of-bounds playback',()=>{const t=compileCoachTimeline(plan,()=>1);expect(clipAt(t,-1)).toBeNull();expect(clipAt(t,5)).toBeNull();});
});
