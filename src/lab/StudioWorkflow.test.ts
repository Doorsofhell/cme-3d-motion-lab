// @ts-ignore — Exécution Vitest sous Node.
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const read=(name:string)=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
describe('contrat majeur V1 — atelier de création et validation',()=>{
 const studio=read('StudioCoach.tsx');
 const app=read('App.tsx');
 const css=read('StudioCoach.css');
 it('propose explicitement Création et Test dans une même scène',()=>{
  expect(studio).toContain('1 · Création');
  expect(studio).toContain('2 · Test des mouvements');
  expect(studio).toContain('setTestingMotion(false)');
  expect(studio).toContain('setTestingMotion(true)');
  expect(studio).toContain('creationPose={!testingMotion}');
  expect(studio).toContain('playing={testingMotion&&playing}');
 });
 it('conserve une seule navigation principale à quatre destinations',()=>{
  for(const name of ['Studio','Galerie Coachs','Comparatif','Plus'])expect(app).toContain('<span>'+name+'</span>');
 });
 it('préserve les vrais GLB et les composants de scène partagés',()=>{
  expect(studio).toContain('<NeutralRig');
  expect(studio).toContain('<SceneToolbar');
  expect(studio).toContain('<SceneCameraControls');
  expect(studio).toContain('<SceneLoadingBoundary');
 });
 it('assure des commandes tactiles accessibles et un état de mode visible',()=>{
  expect(css).toContain('.cmeStudioWorkflow button');
  expect(css).toContain('min-height:44px');
  expect(studio).toContain('aria-pressed={testingMotion}');
 });
});
