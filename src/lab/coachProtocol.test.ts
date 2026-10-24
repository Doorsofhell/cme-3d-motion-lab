import {describe,it,expect} from 'vitest';
import {availableAnimationIds,compileCoachMotionIds,parseCoachPlan,validateCoachPlan} from './coachProtocol';
const good={discipline:'boxe',speech:'Garde haute puis jab.',sequence:[{animationId:'jab',speed:.8,repetitions:2}]};
describe('Text-to-animation protocol',()=>{
 it('uses existing CME animation IDs',()=>{expect(availableAnimationIds('boxe')).toContain('jab');expect(compileCoachMotionIds(validateCoachPlan(good))).toEqual(['jab','jab']);});
 it('parses a strict plan',()=>{expect(parseCoachPlan(JSON.stringify(good)).speech).toBe(good.speech);});
 it('rejects hallucinated IDs',()=>{expect(()=>validateCoachPlan({...good,sequence:[{animationId:'made_up',speed:1,repetitions:1}]})).toThrow();});
 it('rejects invalid speeds and excessive repetitions',()=>{expect(()=>validateCoachPlan({...good,sequence:[{animationId:'jab',speed:99,repetitions:1}]})).toThrow();expect(()=>validateCoachPlan({...good,sequence:[{animationId:'jab',speed:1,repetitions:21}]})).toThrow();});
 it('rejects unknown disciplines',()=>{expect(()=>validateCoachPlan({...good,discipline:'video'})).toThrow();});
});
