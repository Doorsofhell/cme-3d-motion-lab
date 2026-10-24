import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('./App.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('./style.css',import.meta.url),'utf8');
const studio=readFileSync(new URL('./StudioCoach.tsx',import.meta.url),'utf8');
const versions=readFileSync(new URL('./VersionsPanel.tsx',import.meta.url),'utf8');
describe('Navigation premium CME-3D : quatre onglets et galerie préservée',()=>{
 it('dispose de quatre destinations principales réelles et Plus garde les fonctions secondaires',()=>{
  const tabs=app.split('<nav className="labTabs"')[1].split('</nav>')[0];
  expect((tabs.match(/<button className=/g)??[]).length).toBeGreaterThanOrEqual(4);
  for(const title of ['Studio','Galerie Coachs','Comparatif','Plus'])expect(tabs).toContain('<span>'+title+'</span>');
  for(const title of ['Nouveautés','Centre technique','Incidents','Paramètres'])expect(tabs).toContain(title);
  expect(tabs).not.toContain('<span>Laboratoire</span>');
 });
 it('conserve tous les profils enregistrés dans une galerie séparée et synchronisée',()=>{
  expect(app).toContain("tab==='gallery'&&<section");
  expect(app).toContain('<SavedCoachLibrary selectedId={selectedCoach?.id??null}');
  expect(app).toContain('selectSavedCoach(id);setTab(\'lab\')');
  expect(app).toContain('readSavedCoaches(localStorage)');
  expect(app).toContain("window.addEventListener('cme-coaches-changed',refresh)");
  expect(css).toContain('.cmeCoachGallery .savedCoachItems{display:grid');
  expect(css).toContain('grid-template-columns:repeat(2,minmax(0,1fr))');
 });
 it('met les nouveautés dans Plus et offre une navigation Studio vers le banc de test existant',()=>{
  expect(versions).toContain('Nouveautés et mises à jour');
  expect(app).toContain("tab==='versions'&&<VersionsPanel/>");
  expect(app).toContain("tab==='technical'&&<section");
  expect(studio).toContain('Tester en Combat');
  expect(studio).toContain("new Event('cme-open-lab-coach')");
  expect(app).toContain("window.addEventListener('cme-open-lab-coach',open)");
 });
});
