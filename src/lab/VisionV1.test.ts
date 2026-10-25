// @ts-ignore — Tests de contrat exécutés par Vitest sous Node.
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const read=(file:string)=>readFileSync(new URL('./'+file,import.meta.url),'utf8');
describe('vision CME-3D 1.0 : un atelier, cinq destinations',()=>{
 const app=read('App.tsx');
 const studio=read('StudioCoach.tsx');
 it('préserve les cinq destinations principales',()=>{
  for(const label of ['Studio','Mouvements','Technique','Versions','Autres'])expect(app).toContain('<span>'+label+'</span>');
 });
 it('utilise une scène unique dans Studio avec création et test',()=>{
  expect(studio).toContain('1 · Création');
  expect(studio).toContain('2 · Test des mouvements');
  expect((studio.match(/<Canvas\b/g)||[]).length).toBe(1);
 });
 it('maintient les deux sexes et les volumes féminins existants sans inventer un morph de fessiers',()=>{
  expect(studio).toContain("sex:'homme'");
  expect(studio).toContain("'femme'");
  for(const key of ['roundness','hips','thighs','bust'])expect(studio).toContain(key);
  expect(studio).toContain('morph anatomique dédié non présent');
 });
 it('conserve les protections GLB et les commandes de scène partagées',()=>{
  expect(studio).toContain('<NeutralRig');
  expect(studio).toContain('<SceneToolbar');
  expect(studio).toContain('<SceneFullscreenButton');
  expect(studio).toContain('<SceneCameraButton');
 });
});
