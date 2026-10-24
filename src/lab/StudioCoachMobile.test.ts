// @ts-ignore — lecture locale des feuilles de style sous Vitest.
import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
const css=readFileSync(new URL('./StudioCoach.css',import.meta.url),'utf8');
const controls=readFileSync(new URL('./SceneControls.tsx',import.meta.url),'utf8');
describe('Studio Coach : cohérence tactile Android',()=>{
 it('affiche les catégories en grille et sans défilement horizontal',()=>{
  expect(css).toMatch(/\.coachCategories\{display:grid;grid-template-columns:repeat\(auto-fit,minmax\(100px,1fr\)\)/);
  expect(css).toContain('.coachCategories{grid-template-columns:repeat(2,minmax(0,1fr))}');
  expect(css).not.toContain('overflow-x:auto');
 });
 it('préserve les boutons tactiles accessibles et la barre commune',()=>{
  expect(css).toContain('min-height:44px');
  expect(controls).toContain('export function SceneToolbar');
  expect(controls).toContain('export function SceneCameraControls');
  expect(controls).toContain('export function SceneLoadingIndicator');
 });
});
