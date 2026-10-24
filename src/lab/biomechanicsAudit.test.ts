import {describe,it,expect} from 'vitest';
import {auditMotion,auditCatalog} from './biomechanicsAudit';
import type {Motion} from '../shadow-engine/motion';
const pose={hips:{x:0,y:1,z:0},pelvis:{yaw:0,pitch:0,roll:0},chest:{yaw:0,pitch:0,roll:0},head:{yaw:0,pitch:0,roll:0},handL:{space:'chest' as const,pos:{x:0,y:0,z:0},pole:{x:0,y:0,z:1},pron:0,fist:1},handR:{space:'chest' as const,pos:{x:0,y:0,z:0},pole:{x:0,y:0,z:1},pron:0,fist:1},footL:{mode:'ground' as const,ball:{x:0,y:0,z:0},yaw:0,heel:0},footR:{mode:'ground' as const,ball:{x:0,y:0,z:0},yaw:0,heel:0}};
const motion:Motion={id:'test',keys:[{t:0,pose},{t:1,pose}],impacts:[.5],startState:'stand',endState:'stand'};
describe('biomechanics motion audit',()=>{
 it('accepts finite, ordered key poses',()=>expect(auditMotion(motion)).toEqual([]));
 it('rejects backwards key timing',()=>expect(auditMotion({...motion,keys:[{t:0,pose},{t:0,pose}]}).some(f=>f.code==='TIME_ORDER')).toBe(true));
 it('detects unsafe pelvis displacement',()=>expect(auditMotion({...motion,keys:[{t:0,pose},{t:.1,pose:{...pose,hips:{x:2,y:1,z:0}}}]}).some(f=>f.code==='HIP_SPEED')).toBe(true));
 it('detects ground penetration and invalid impacts',()=>expect(auditCatalog([{...motion,impacts:[2],keys:[{t:0,pose:{...pose,footL:{...pose.footL,ball:{x:0,y:-.1,z:0}}}},{t:1,pose}]}]).map(f=>f.code)).toEqual(expect.arrayContaining(['GROUND_PENETRATION','IMPACT_TIME'])));
});
