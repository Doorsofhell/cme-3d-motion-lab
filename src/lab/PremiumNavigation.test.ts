import {describe,it,expect} from 'vitest';
// @ts-ignore — lecture locale des fichiers de composants sous Vitest, à l’image des tests Studio existants.
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('./App.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('./style.css',import.meta.url),'utf8');
const studio=readFileSync(new URL('./StudioCoach.tsx',import.meta.url),'utf8');
const versions=readFileSync(new URL('./VersionsPanel.tsx',import.meta.url),'utf8');
describe('Navigation CME-3D : cinq onglets et galerie intégrée',()=>{
 it('dispose de cinq destinations principales et regroupe les fonctions secondaires dans Autres',()=>{
  const tabs=app.split('<nav className="labTabs"')[1].split('</nav>')[0];
  expect((tabs.match(/<button className=/g)??[]).length).toBeGreaterThanOrEqual(5);
  for(const title of ['Studio','Mouvements','Technique','Versions','Autres'])expect(tabs).toContain('<span>'+title+'</span>');
  for(const title of ['Studio','Mouvements','Technique','Versions','Autres'])expect(tabs).toContain(title);
  expect(tabs).not.toContain('<span>Laboratoire</span>');
 });
 it('conserve tous les profils enregistrés dans Studio',()=>{
  expect(app).toContain('cmeStudioCoachList');
  expect(app).toContain('<SavedCoachLibrary selectedId={selectedCoach?.id??null}');
  expect(app).toContain('selectSavedCoach(id);setTab(\'lab\')');
  expect(app).toContain('readSavedCoaches(localStorage)');
  expect(app).toContain("window.addEventListener('cme-coaches-changed',refresh)");
  expect(css).toContain('.cmeCoachGallery .savedCoachItems{display:grid');
  expect(css).toContain('grid-template-columns:repeat(2,minmax(0,1fr))');
 });
 it('garde Versions en onglet autonome et offre une navigation vers Mouvements',()=>{
  expect(versions).toContain('Nouveautés et mises à jour');
  expect(app).toContain("tab==='versions'&&<VersionsPanel/>");
  expect(app).toContain("tab==='technical'&&<section");
  expect(studio).toContain('Tester dans Mouvements');
  expect(studio).toContain("new Event('cme-open-lab-coach')");
  expect(app).toContain("window.addEventListener('cme-open-lab-coach',open)");
 });
});
