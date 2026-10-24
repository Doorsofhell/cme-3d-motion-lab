import html from '../../index.html?raw';
import css from './mobileUsability.css?raw';
import {describe,expect,it} from 'vitest';
describe('ergonomie mobile P0',()=>{
 it('charge la feuille dédiée depuis la page principale',()=>{
  expect(html).toContain('/src/lab/mobileUsability.css');
 });
 it('rétablit le défilement et conserve le menu de navigation en bas',()=>{
  expect(css).toMatch(/overflow-y:auto!important/);
  expect(css).toMatch(/position:sticky!important/);
  expect(css).toMatch(/bottom:0!important/);
 });
 it('garantit une scène visible et le plein écran',()=>{
  expect(css).toContain('min-height:330px!important');
  expect(css).toContain('.stage.cmeFullscreen');
  expect(css).toContain('height:100dvh!important');
 });
 it('prévoit des commandes tactiles de 44 pixels au minimum',()=>{
  expect(css).toContain('min-height:44px');
 });
});
