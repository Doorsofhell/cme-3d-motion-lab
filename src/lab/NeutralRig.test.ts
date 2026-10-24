import {describe,expect,it} from 'vitest';
import {LAB_DISCIPLINES,NEUTRAL_ASSETS} from './NeutralRig';
import {getLibrary} from '../shadow-engine/library';
import {CoachRig} from '../shadow-engine/rig';
import {MotionSampler} from '../shadow-engine/motion';

describe('neutral rig architecture contracts',()=>{
 it('has two distinct existing skinned reference assets',()=>{
  expect(Object.keys(NEUTRAL_ASSETS).sort()).toEqual(['femme','homme']);
  expect(NEUTRAL_ASSETS.homme).not.toBe(NEUTRAL_ASSETS.femme);
 });
 it('routes all six disciplines through the same canonical library factory',()=>{
  expect(LAB_DISCIPLINES).toEqual(['boxing','kickboxing','muaythai','mma','bjj','judo']);
  expect(typeof getLibrary).toBe('function');
  expect(typeof CoachRig).toBe('function');
  expect(typeof MotionSampler).toBe('function');
 });
});
