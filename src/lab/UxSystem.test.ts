// @ts-ignore — tests de contrat source exécutés par Vitest sous Node
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const source=(name:string)=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
describe('CME-3D UX : parcours uniques, design system et accessibilité',()=>{
 const app=source('App.tsx'),studio=source('StudioCoach.tsx'),theme=source('UxSystem.css');
 it('conserve cinq écrans sans barre de fonctions techniques flottante',()=>{
  const tabs=app.split('<nav className="labTabs"')[1].split('</nav>')[0];
  for(const name of ['Studio','Mouvements','Technique','Versions','Autres'])expect(tabs).toContain('<span>'+name+'</span>');
  expect(app).toContain('data-cme-screen={tab}');
  expect(app).not.toContain('title="Console de débogage"');
  expect(app).not.toContain('title="Réglages avancés"');
 });
 it('réserve les paramètres experts et le JSON à Technique',()=>{
  expect(app).toContain("tab==='technical'&&<section");
  expect(app).toContain('Prototype avancé · Exécuter un plan JSON');
  expect(app).toContain('Diagnostics et outils techniques');
  expect(app).not.toContain("tab==='lab'&&reviewOpen");
 });
 it('conserve une seule surface de test et un seul éditeur de coach',()=>{
  expect(app).toContain("tab==='lab'&&<MotionReview");
  expect(app).not.toContain('cmeReviewToggle');
  expect(studio).toContain('Création d’abord sur le corps neutre');
  expect(studio).not.toContain('2 · Test des mouvements');
  expect(studio.split('<Canvas ').length-1).toBe(1);
  expect(studio).toContain('Tester dans Mouvements');
 });
 it('assure un socle de couleurs sémantiques et le défilement Android',()=>{
  expect(app).toContain("import './UxSystem.css'");
  for(const token of ['--ux-card','--ux-text','--ux-muted','--ux-focus'])expect(theme).toContain(token);
  expect(theme).toContain('data-cme-screen="lab"');
  expect(theme).toContain('overscroll-behavior-y:contain');
  expect(theme).toContain('min-height:44px');
  expect(theme).toContain('@media(max-width:760px)');
 });
});
