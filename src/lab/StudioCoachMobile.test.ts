// @ts-ignore — lecture locale des feuilles de style sous Vitest.
import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
const css=readFileSync(new URL('./StudioCoach.css',import.meta.url),'utf8');
const controls=readFileSync(new URL('./SceneControls.tsx',import.meta.url),'utf8');
describe('Studio Coach : cohérence tactile Android',()=>{
 it('affiche les catégories en grille et sans défilement horizontal',()=>{
  expect(css).toMatch(/\.coachCategories\{display:grid;grid-template-columns:repeat\(auto-fit,minmax\(100px,1fr\)\)/);
  expect(css).toContain('.coachCategories{grid-template-columns:repeat(2,minmax(0,1fr))}');
  expect(css).not.toContain('overflow-x:auto');
 });
 it('utilise un seul adaptateur morphologique pour Studio et Laboratoire',()=>{
  const neutral=readFileSync(new URL('./NeutralRig.tsx',import.meta.url),'utf8');
  const fighter=readFileSync(new URL('./Fighter.tsx',import.meta.url),'utf8');
  expect(neutral).toContain('applyCoachLookGeometry(scene,');
  expect(fighter).toContain('applyCoachLookGeometry(s,coachLook)');
  expect(fighter).not.toContain('applyCoachBodyShape(s,');
 });
 it('charge les véritables tenues de discipline uniquement en mode Apparence',()=>{
  const rig=readFileSync(new URL('./NeutralRig.tsx',import.meta.url),'utf8');
  const studio=readFileSync(new URL('./StudioCoach.tsx',import.meta.url),'utf8');
  expect(rig).toContain("props.mode==='appearance'?<OutfittedRig");
  expect(rig).toContain("attachOutfit(root,outfitScene,true)");
  expect(rig).toContain("'/tenues/'+costume+'.glb'");
  expect(studio).toContain('SKIN_TONES.map(');
  expect(studio).toContain('coachSkinGrid');
  expect(css).toContain('grid-template-columns:repeat(4,minmax(0,1fr))');
 });
 it('centre la caméra sur la rubrique et son contrôle spécialisé sans conflit de commandes',()=>{
  const studio=readFileSync(new URL('./StudioCoach.tsx',import.meta.url),'utf8');
  const rig=readFileSync(new URL('./NeutralRig.tsx',import.meta.url),'utf8');
  const framing=readFileSync(new URL('./CadrageSquelette.tsx',import.meta.url),'utf8');
  expect(studio).toContain('focusZone={focusZone} focusRequest={focusRequest}');
  expect(studio).toContain('recenter(focusForSection(item))');
  expect(studio).toContain('selectFocus(focusForSetting(key,section))');
  expect(studio).toContain('Vue entière');
  expect(studio).toContain('setCameraAuto(false);recenter(\'corps\')');
  expect(rig).toContain('zone={focusZone} refocus={focusRequest}');
  expect(framing).toContain("orbit.addEventListener('start',cancel)");
  expect(framing).toContain('camera.position.lerp(aim.position,speed)');
  expect(css).toContain('.coachFocusLine button');
 });
 it('n’expose les nouveaux curseurs que sur un modèle femme et active le zoom par zone',()=>{
  const studio=readFileSync(new URL('./StudioCoach.tsx',import.meta.url),'utf8');
  const focus=readFileSync(new URL('./studioFocus.ts',import.meta.url),'utf8');
  const rig=readFileSync(new URL('./NeutralRig.tsx',import.meta.url),'utf8');
  expect(studio).toContain("item!=='silhouette'||look.sex==='femme'");
  expect(studio).toContain("section==='silhouette'&&look.sex==='femme'");
  expect(studio).toContain("range('hips','Largeur des hanches'");
  expect(studio).toContain("range('thighs','Volume des cuisses'");
  expect(studio).toContain("range('roundness','Rondeur générale'");
  expect(focus).toContain("silhouette:'hanches'");
  expect(rig).toContain("roundness:proportions?.roundness??1");
  expect(rig).toContain("thighs:proportions?.thighs??1");
  expect(rig).toContain("hips:proportions?.hips??1");
 });
 it('préserve les boutons tactiles accessibles et la barre commune',()=>{
  expect(css).toContain('min-height:44px');
  expect(controls).toContain('export function SceneToolbar');
  expect(controls).toContain('export function SceneCameraControls');
  expect(controls).toContain('export function SceneLoadingIndicator');
 });
});
