// @ts-ignore — Vitest utilise Node pour les contrats de source.
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const read=(name:string)=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
describe('barre 3D et chargement mutualisés',()=>{
 const controls=read('SceneControls.tsx');
 const css=read('SceneControls.css');
 const studio=read('StudioCoach.tsx');
 const lab=read('App.tsx');
 it('réutilise une barre de commandes unique dans les deux scènes',()=>{
  expect(controls).toContain('export function SceneToolbar');
  expect(studio).toContain('<SceneToolbar');
  expect(lab).toContain('<SceneToolbar');
  expect(css).toContain('.cmeSceneToolbarActions');
  expect(css).toContain('pointer-events:none');
 });
 it('garantit les cibles tactiles et protège les gestes de la scène',()=>{
  expect(css).toContain('min-height:44px');
  expect(controls).toContain('onDoubleClick={e=>e.stopPropagation()}');
  expect(controls).toContain('onTouchEnd={e=>e.stopPropagation()}');
 });
 it('partage les contrôles caméra et évite une caméra concurrente',()=>{
  expect(controls).toContain('export function SceneCameraControls');
  expect(controls).toContain('CameraPedagogique');
  expect(controls).toContain('OrbitControls');
  expect(studio).toContain('<SceneCameraControls');
  expect(lab).toContain('<SceneCameraControls');
 });
 it('utilise une frontière de chargement et un indicateur GLB',()=>{
  expect(controls).toContain('export function SceneLoadingBoundary');
  expect(controls).toContain('export function SceneLoadingIndicator');
  expect(studio).toContain('<SceneLoadingBoundary>');
  expect(studio).toContain('<SceneLoadingIndicator');
  expect(controls).toContain('useProgress()');
 });
});
