// @ts-ignore — contrôle des fichiers applicatifs exécuté sous Vitest.
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {NAVIGATION_PRINCIPALE} from './NavigationPrincipale';
const read=(p:string)=>readFileSync(new URL('./'+p,import.meta.url),'utf8');
describe('CME 0.7.46 — quatre destinations mobiles sans fonctions perdues',()=>{
 const app=read('App.tsx'),css=read('CmePremiumMobile.css');
 it('n’expose que quatre onglets ordonnés, avec libellés et icônes propres',()=>{
  expect(NAVIGATION_PRINCIPALE).toEqual([
   {id:'studio',libelle:'Studio Coach'},{id:'lab',libelle:'Simulateur'},
   {id:'gallery',libelle:'Galerie'},{id:'other',libelle:'Plus'}
  ]);
  expect(app).toContain('<NavigationPrincipale actif={ongletActif}');
  expect(css).toContain('grid-template-columns:repeat(4,minmax(0,1fr))');
  expect(css).toContain('min-height:52px');
  expect(css).toContain('env(safe-area-inset-bottom)');
 });
 it('ne charge pas une galerie supplémentaire en dessous du viewport de Studio',()=>{
  expect(app).toContain("tab==='studio'&&<div className=\"cmeStudioHub\"><StudioCoach/></div>");
  expect(app).not.toContain('className="cmeStudioCoachList"');
  expect(app).toContain("tab==='gallery'&&<section");
  expect(app).toContain('<SavedCoachLibrary selectedId={selectedCoach?.id??null}');
  expect(app).toContain("window.addEventListener('cme-coaches-changed',refresh)");
 });
 it('garde les fonctions techniques existantes accessibles depuis Plus',()=>{
  for(const action of ["setTab('technical')","setTab('versions')","setTab('roadmap')","setTab('tracking')","setTab('options')","openComparison"])expect(app).toContain(action);
  expect(app).toContain('Atlas biomécanique · référentiel');
  expect(app).toContain('Retour à Plus');
  expect(app).toContain("tab==='versions'&&<Suspense fallback={null}><VersionsPanel/></Suspense>");
  expect(app).toContain("tab==='technical'&&<section");
 });
});
