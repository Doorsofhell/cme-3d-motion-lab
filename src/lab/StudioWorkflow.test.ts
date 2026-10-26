// @ts-ignore — Exécution Vitest sous Node.
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const read=(name:string)=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
describe('contrat majeur V1 — atelier de création et validation',()=>{
 const studio=read('StudioCoach.tsx');
 const app=read('App.tsx');
 const css=read('StudioCoach.css');
 it('concentre Studio sur la personnalisation et renvoie les tests à Mouvements',()=>{
  expect(studio).toContain('creationPose={!testingMotion}');
  expect(studio).toContain('<CoachProfileEditor identite={identity}');
  expect(studio).not.toContain('2 · Test des mouvements');
  expect(studio).toContain('Ouvrir le Simulateur');
  expect(studio).toContain('setTestingMotion(false)');
  expect(studio).toContain('creationPose={!testingMotion}');
  expect(studio).toContain('playing={testingMotion&&playing}');
 });
 it('conserve une navigation principale à quatre destinations sans retrait des outils',()=>{
  const navigation=read('NavigationPrincipale.tsx');
  for(const name of ['Studio Coach','Simulateur','Galerie','Plus'])expect(navigation).toContain("libelle:'"+name+"'");
  expect(app).toContain('Comparatif CME / Shadow');
  expect(app).toContain('Atlas biomécanique · référentiel');
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
