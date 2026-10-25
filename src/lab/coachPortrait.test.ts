import {describe,it,expect} from 'vitest';
import {portraitLooksValid,captureCoachPortrait} from './coachPortrait';
describe('Galerie Coachs — qualité des portraits',()=>{
 it('refuse les images vides, non jpeg ou surdimensionnées',()=>{
  expect(portraitLooksValid('')).toBe(false);
  expect(portraitLooksValid('data:image/png;base64,'+'A'.repeat(1000))).toBe(false);
  expect(portraitLooksValid('data:image/jpeg;base64,'+'A'.repeat(500))).toBe(true);
  expect(portraitLooksValid('data:image/jpeg;base64,'+'A'.repeat(320001))).toBe(false);
 });
 it('ne capture pas un canvas sans contenu',()=>expect(captureCoachPortrait({width:0,height:0} as HTMLCanvasElement)).toBeNull());
});
