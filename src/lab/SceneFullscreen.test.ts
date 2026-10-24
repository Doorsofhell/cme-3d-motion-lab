// @ts-ignore — Vitest utilise Node pour les tests de contrat.
import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
const read=(file:string)=>readFileSync(new URL('./'+file,import.meta.url),'utf8');
describe('contrat UI partagé CME-3D',()=>{
 const shared=read('SceneFullscreen.tsx');
 const studio=read('StudioCoach.tsx');
 const lab=read('App.tsx');
 it('réutilise le composant plein écran sur les deux scènes',()=>{
  for(const source of [studio,lab]){
   expect(source).toContain("from './SceneFullscreen'");
   expect(source).toContain('useSceneFullscreen()');
   expect(source).toContain('<SceneFullscreenButton');
   expect(source).toContain('onDoubleClick=');
   expect(source).toContain('onTouchEnd=');
  }
 });
 it('emploie le plein écran natif et une sortie explicite',()=>{
  expect(shared).toContain('requestFullscreen()');
  expect(shared).toContain('document.exitFullscreen()');
  expect(shared).toContain('fullscreenchange');
  expect(shared).toContain('Quitter le plein écran');
 });
 it('protège les commandes et empêche une double bascule tactile',()=>{
  expect(shared).toContain('ignoreSyntheticClick.current');
  expect(shared).toContain('event.changedTouches.length!==1');
  expect(shared).toContain("closest('button,input,select,textarea,summary,a')");
 });
 it('préserve les GLB humains dans Studio Coach',()=>{
  expect(studio).toContain('<NeutralRig');
  expect(studio).not.toContain('<MannequinAutonome');
  expect(studio).toContain('useGLTF.preload');
 });
});
