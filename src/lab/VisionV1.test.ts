// @ts-ignore — Tests de contrat exécutés par Vitest sous Node.
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const read=(file:string)=>readFileSync(new URL('./'+file,import.meta.url),'utf8');
describe('vision CME-3D 1.0 : un atelier et quatre destinations',()=>{
 const app=read('App.tsx');
 const studio=read('StudioCoach.tsx');
 it('préserve les quatre destinations principales, avec les outils dans Plus',()=>{
  const navigation=read('NavigationPrincipale.tsx');
  for(const label of ['Studio Coach','Mouvements','Galerie','Plus'])expect(navigation).toContain("libelle:'"+label+"'");
  expect(app).toContain('Atlas biomécanique · référentiel');
  expect(app).toContain('Laboratoire et diagnostics');
 });
 it('utilise une scène unique de création et un onglet distinct de recette',()=>{
  expect(studio).toContain('Création en pose neutre');
  expect(studio).not.toContain('2 · Test des mouvements');
  expect(app).toContain('<MotionReview');
  expect((studio.match(/<Canvas\b/g)||[]).length).toBe(1);
 });
 it('maintient les sexes avec un volume de fessiers skinné explicite sans faux morph target',()=>{
  expect(studio).toContain("sex:'homme'");
  expect(studio).toContain("'femme'");
  for(const key of ['roundness','hips','glutes','thighs','bust'])expect(studio).toContain(key);
  expect(studio).toContain('déformation locale bornée des fessiers');
 });
 it('conserve les protections GLB et les commandes de scène partagées',()=>{
  expect(studio).toContain('<NeutralRig');
  expect(studio).toContain('<SceneToolbar');
  expect(studio).toContain('<SceneFullscreenButton');
  expect(studio).toContain('<SceneCameraButton');
 });
});
