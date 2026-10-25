// @ts-ignore — fichier source lu par Vitest dans Node
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const read=(file:string)=>readFileSync(new URL('./'+file,import.meta.url),'utf8');
const app=read('App.tsx'),css=read('UxSystem.css');
describe('Android : barre de navigation fixe et viewport accessible',()=>{
 it('sépare le contenu scrollable de la barre des cinq destinations',()=>{
  const contentOpen=app.indexOf('className="cmeAppContent"');
  const contentClose=app.lastIndexOf('  </div>\n  {tab===\'technical\'&&catalogOpen');
  const nav=app.indexOf('<nav className="labTabs"');
  expect(contentOpen).toBeGreaterThan(-1);
  expect(contentClose).toBeGreaterThan(contentOpen);
  expect(nav).toBeGreaterThan(contentClose);
  expect(app).toContain('key={tab} className="cmeAppContent"');
 });
 it('ne fait plus défiler le menu inférieur avec la page Mouvements',()=>{
  expect(css).toContain('.labApp[data-cme-screen="lab"]');
  expect(css).toContain('.labApp .cmeAppContent{');
  expect(css).toContain('overflow-y:auto');
  expect(css).toContain('position:relative;bottom:auto');
  expect(css).toContain('env(safe-area-inset-bottom)');
 });
 it('préserve le viewport 3D sur Android et évite la perte du tactile',()=>{
  expect(css).toContain('.coachPreview:not(.cmeFullscreen):not(:fullscreen)');
  expect(css).toContain('position:sticky;top:0');
  expect(css).toContain('touch-action:none');
  expect(css).toContain('overscroll-behavior-y:contain');
  expect(css).toContain('@media(max-width:760px)');
 });
});
