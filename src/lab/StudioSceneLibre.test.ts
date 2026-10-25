// @ts-ignore — inspection des sources exécutée par Vitest sous Node.
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const read=(path:string)=>readFileSync(new URL('./'+path,import.meta.url),'utf8');
describe('Studio 0.7.48 — scène sans masquage',()=>{
 const studio=read('StudioCoach.tsx'),css=read('StudioSceneLibre.css');
 it('affiche le choix Homme/Femme et les commandes caméra en dehors du Canvas',()=>{
  const bar=studio.indexOf('className="coachSceneControls"');
  const scene=studio.indexOf('className="coachSceneStack sculptorSceneArea"');
  const viewport=studio.indexOf('aria-label="Aperçu 3D du mannequin');
  const edit=studio.indexOf('className="coachEditor sculptorDashboard"');
  expect(scene).toBeGreaterThan(0);
  expect(bar).toBeGreaterThan(scene);
  expect(bar).toBeLessThan(viewport);
  expect(viewport).toBeLessThan(edit);
  const preview=studio.slice(viewport,edit);
  expect(preview).not.toContain('coachQuickChoice coachSexeVue');
  expect(preview).not.toContain('<SceneToolbar');
  expect(preview).not.toContain('coachCrud');
  expect(preview).toContain('<Canvas ');
  expect(preview).toContain('coachFermerPleinEcran');
 });
 it('garde la navigation par zones accessible et fait défiler les réglages seulement',()=>{
  const groups=studio.indexOf('className="coachGroupesAnatomiques sculptorXAxis"');
  const zones=studio.indexOf('className="coachCategories"');
  const scroll=studio.indexOf('className="coachEditorScroll"');
  const values=studio.indexOf('className="coachZoneCourante"');
  const footer=studio.indexOf('className="coachCrud coachEditorFooter"');
  expect(groups).toBeGreaterThan(0);
  expect(groups).toBeLessThan(zones);
  expect(zones).toBeLessThan(scroll);
  expect(scroll).toBeLessThan(values);
  expect(values).toBeLessThan(footer);
  expect(studio).toContain('editorScrollRef.current.scrollTop=0');
  expect(css).toContain('.coachEditorScroll');
  expect(css).toContain('overflow-y:auto!important');
  expect(css).toContain('overscroll-behavior:contain');
 });
 it('limite le pied du panneau aux deux actions importantes',()=>{
  expect(studio).toContain('coachSecondaryActions');
  expect(studio).toContain('Autres actions · nouveau, aléatoire et suppression');
  expect(studio.match(/className="coachSave sculptorCommit"/g)).toHaveLength(1);
  expect(studio.match(/className="coachTest"/g)).toHaveLength(1);
  expect(css).toContain('coachEditorFooter');
  expect(css).toContain('position:static!important');
 });
 it('préserve une scène dominante sur mobile, sans boutons tactiles trop petits',()=>{
  expect(css).toContain('flex-basis:59%');
  expect(css).toContain('max-height:66%');
  expect(css).toContain('min-height:44px');
  expect(css).toContain('overflow:hidden!important');
  expect(read('App.tsx')).toContain("import './StudioSceneLibre.css'");
 });
});
