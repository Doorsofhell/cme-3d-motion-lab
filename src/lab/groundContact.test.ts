import {describe,it,expect} from 'vitest';
import {correctGroundContact} from './groundContact';
import type {Motion} from '../shadow-engine/motion';
const pose={hips:{x:0,y:1,z:0},pelvis:{yaw:0,pitch:0,roll:0},chest:{yaw:0,pitch:0,roll:0},head:{yaw:0,pitch:0,roll:0},handL:{space:'chest' as const,pos:{x:0,y:0,z:0},pole:{x:0,y:0,z:1},pron:0,fist:1},handR:{space:'chest' as const,pos:{x:0,y:0,z:0},pole:{x:0,y:0,z:1},pron:0,fist:1},footL:{mode:'ground' as const,ball:{x:1,y:-.01,z:2},yaw:0,heel:0},footR:{mode:'ground' as const,ball:{x:0,y:-.1,z:0},yaw:0,heel:0}};
const motion:Motion={id:'test',keys:[{t:0,pose},{t:1,pose}],impacts:[],startState:'stand',endState:'stand'};
describe('ground contact correction',()=>{
 it('clamps tiny penetration and preserves x/z',()=>{
  const fixed=correctGroundContact(motion).keys[0].pose.footL;
  expect(fixed.mode).toBe('ground');
  if(fixed.mode==='ground')expect(fixed.ball).toEqual({x:1,y:0,z:2});
 });
 it('leaves severe penetration for manual audit',()=>{
  const fixed=correctGroundContact(motion).keys[0].pose.footR;
  if(fixed.mode==='ground')expect(fixed.ball.y).toBe(-.1);
 });
 it('does not mutate original motion',()=>expect((motion.keys[0].pose.footL as typeof pose.footL).ball.y).toBe(-.01));
});
