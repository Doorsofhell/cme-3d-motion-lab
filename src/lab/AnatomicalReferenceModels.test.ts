// @ts-ignore — acces Node pour les tests de contrat, hors navigateur.
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {REFERENCE_ANATOMY_ASSETS} from './AnatomicalReferenceRig';
const read=(path:string)=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
describe('CME 0.7.42 — vrais GLB anatomiques MakeHuman CC0',()=>{
 it('a deux chemins distincts pour sexe et ne crée pas de fausse animation',()=>{
  expect(REFERENCE_ANATOMY_ASSETS.homme).toBe('anatomie/homme.glb');
  expect(REFERENCE_ANATOMY_ASSETS.femme).toBe('anatomie/femme.glb');
  expect(read('src/lab/AnatomicalReferenceRig.tsx')).not.toContain('new CoachRig(');
 });
 it('contrôle les GLB binaires et récupère les deux sexes en CI',()=>{
  const loader=read('scripts/fetch-premium-anatomy.mjs');
  expect(loader).toContain('0x4e4f534a');
  expect(loader).toContain('JOINTS_0');
  expect(loader).toContain('WEIGHTS_0');
  expect(loader).toContain('sha256');
  expect(read('.github/workflows/deploy-pages.yml')).toContain('npm run fetch:anatomy');
  expect(read('.github/workflows/studio-coach-checks.yml')).toContain('npm run fetch:anatomy');
 });
 it("préserve la scène de combat et l'éditeur natif",()=>{
  const studio=read('src/lab/StudioCoach.tsx');
  expect(studio).toContain('AnatomicalReferenceRig');
  expect(studio).toContain('rigMode&&referenceMode?');
  expect(studio).toContain('Lecture seule');
  expect(read('src/lab/NeutralRig.tsx')).toContain('new CoachRig(scene)');
 });
});
