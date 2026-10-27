// @ts-ignore — Vitest s'exécute sous Node ; les types Node ne sont pas requis au build applicatif.
import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
const read=(name:string)=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
describe('stabilisation commune Android / Studio Coach / Laboratoire',()=>{
 const studio=read('StudioCoach.tsx');
 const lab=read('App.tsx');
 const controls=read('SceneControls.tsx');
 const toolbarCss=read('SceneControls.css');
 const studioCss=read('StudioCoach.css');
 const mobileCss=read('mobileUsability.css');
 const legacyCss=read('style.css');
 it('utilise exactement les mêmes commandes plein écran et styles de barre',()=>{
  for(const source of [studio,lab]){
   expect(source).toContain('<SceneToolbar');
   expect(source).toContain('<SceneFullscreenButton');
   expect(source).toContain('<SceneLoadingIndicator');
  }
  expect(controls).toContain('export function SceneToolbar');
  expect(toolbarCss).toContain('.cmeSceneToolbarActions');
  expect(toolbarCss).toContain('flex-wrap:wrap');
  expect(toolbarCss).toContain('min-height:44px');
  expect(toolbarCss).toContain('position:static');
 });
 it('préserve le chargement GLB et les commandes caméra partagées',()=>{
  expect(studio).toContain('useGLTF.preload');
  expect(studio).toContain('<NeutralRig');
  expect(studio).toContain('<SceneCameraControls');
  expect(lab).toContain('<SceneCameraControls');
  expect(controls).toContain('useProgress');
  expect(controls).toContain('<Suspense');
  expect(studio).not.toContain('<MannequinAutonome');
 });
 it('évite les doubles styles plein écran et les décalages fixes Studio',()=>{
  expect(studioCss).not.toContain('!important');
  expect(studioCss).toContain('.coachPreview:fullscreen');
  expect(studioCss).toContain('.coachPreview.cmeFullscreen');
  expect(studioCss).not.toMatch(/\.coachRigSwitch\s*\{[^}]*position:\s*absolute/);
  expect(mobileCss).not.toContain(':has(.coachStudio) .coachPreview');
  expect(mobileCss).toContain('.stage:not(.cmeFullscreen)');
  expect(legacyCss).not.toContain('.stage.cmeFullscreen,.coachPreview.cmeFullscreen');
  expect(legacyCss).not.toContain('.labApp:has(.coachStudio) .coachPreview');
 });
 it('supprime le texte JSX parasite et interdit le double-tap depuis la barre',()=>{
  expect(lab).not.toContain('}>\\n   <SceneFullscreenButton');
  expect(controls).toContain('onDoubleClick={e=>e.stopPropagation()}');
  expect(controls).toContain('onTouchEnd={e=>e.stopPropagation()}');
  expect(read('SceneFullscreen.tsx')).toContain('inFlight.current');
  expect(read('SceneFullscreen.tsx')).toContain('ignoreSyntheticClick.current=now+700');
 });
});
