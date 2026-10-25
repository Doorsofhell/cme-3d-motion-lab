// @ts-ignore — Exécution Vitest sous Node.
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const read=(name:string)=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
describe('contrat majeur V1 — atelier de création et validation',()=>{
 const studio=read('StudioCoach.tsx');
 const app=read('App.tsx');
 const css=read('StudioCoach.css');
 it('concentre Studio sur la personnalisation et renvoie les tests à Mouvements',()=>{
  expect(studio).toContain('Création d’abord sur le corps neutre');
  expect(studio).not.toContain('2 · Test des mouvements');
  expect(studio).toContain('Tester dans Mouvements');
  expect(studio).toContain('setTestingMotion(false)');
  expect(studio).toContain('creationPose={!testingMotion}');
  expect(studio).toContain('playing={testingMotion&&playing}');
 });
 it('conserve une seule navigation principale à cinq destinations',()=>{
  for(const name of ['Studio','Mouvements','Technique','Versions','Autres'])expect(app).toContain('<span>'+name+'</span>');
 });
 it('préserve les vrais GLB et les composants de scène partagés',()=>{
  expect(studio).toContain('<NeutralRig');
  expect(studio).toContain('<SceneToolbar');
  expect(studio).toContain('<SceneCameraControls');
  expect(studio).toContain('<SceneLoadingBoundary');
 });
 it('assure des commandes tactiles accessibles et une sauvegarde sans doublon',()=>{
  expect(css).toContain('min-height:44px');
  expect((studio.match(/Tester dans Mouvements/g)||[]).length).toBe(1);
  expect(studio).toContain('Réglages fins de la zone');
 });
});
