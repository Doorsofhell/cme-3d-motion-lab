// @ts-ignore — Vitest sous Node, inspection des fichiers de styles.
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const read=(f:string)=>readFileSync(new URL('./'+f,import.meta.url),'utf8');
const app=read('App.tsx'),css=read('CmePremiumMobile.css'),oldCss=read('UxSystem.css');
describe('Android : viewport permanent, panneau contextuel et barre unique',()=>{
 it('garde le contenu principal entre l’entête et la barre à quatre onglets',()=>{
  const contenu=app.indexOf('className="cmeAppContent"');
  const navigation=app.lastIndexOf('<NavigationPrincipale ');
  expect(contenu).toBeGreaterThan(-1);
  expect(navigation).toBeGreaterThan(contenu);
  expect(app).not.toContain('key={tab} className="cmeAppContent"');
  expect(app).toContain('data-cme-screen={tab}');
 });
 it('fixe la scène sans défilement commun et rend les réglages défilables',()=>{
  expect(css).toContain('.labApp[data-cme-screen="studio"] .coachStudio');
  expect(css).toContain('.labApp[data-cme-screen="studio"] .coachStudioLayout');
  expect(css).toContain('.labApp[data-cme-screen="studio"] .coachPreview:not(.cmeFullscreen):not(:fullscreen)');
  expect(css).toContain('overflow-y:auto!important;overflow-x:hidden!important;');
  expect(css).toContain('overscroll-behavior-y:contain');
  expect(css).toContain('touch-action:none');
  expect(oldCss).toContain('.labApp .cmeAppContent{');
 });
 it('réserve une navigation tactilisable avec safe-area Android',()=>{
  expect(css).toContain('grid-template-columns:repeat(4,minmax(0,1fr))');
  expect(css).toContain('min-height:52px');
  expect(css).toContain('min-height:44px!important');
  expect(css).toContain('env(safe-area-inset-bottom)');
  expect(css).toContain('@media(max-height:630px)');
 });
});
