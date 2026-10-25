import {describe,expect,it} from 'vitest';
// @ts-ignore — lecture locale des sources par Vitest sous Node.
import {readFileSync} from 'node:fs';
import {GROUPES_ANATOMIQUES,groupePourZone} from './studioAnatomyNavigation';
const f=(p:string)=>readFileSync(new URL('./'+p,import.meta.url),'utf8');
describe('Studio 0.7.49 — espace de sculpture mobile',()=>{
 const studio=f('StudioCoach.tsx'),style=f('SculptorWorkspace.css'),slider=f('PrecisionSlider.tsx');
 it('montre les cinq catégories X et les sept sous-zones Y sans doublon',()=>{
  expect(GROUPES_ANATOMIQUES.map(x=>x.libelle)).toEqual(['Tête','Corps','Jambes','Peau','Tenues']);
  const zones=GROUPES_ANATOMIQUES.flatMap(x=>x.zones);
  expect(zones).toHaveLength(7);
  expect(new Set(zones).size).toBe(7);
  for(const zone of zones)expect(groupePourZone(zone).zones).toContain(zone);
  expect(studio).toContain('sculptorDashboardBody');
  expect(studio).toContain('sculptorXAxis');
  expect(studio).toContain('sculptorYAxis');
 });
 it('conserve le vrai Canvas et la grille spatiale Three.js dans le viewport',()=>{
  expect(studio.match(/<Canvas /g)).toHaveLength(1);
  expect(studio).toContain('<gridHelper args=');
  expect(studio).toContain('<SculptorWireframe actif=');
  expect(studio).toContain('<SculptorViewportTools vue=');
  expect(studio).toContain("disponible={!!report&&!referenceMode}");
 });
 it('affiche de vrais curseurs actifs seulement si les capacités GLB le permettent',()=>{
  expect(studio).toContain('<PrecisionSlider label=');
  expect(studio).toContain('!!support?.shape.torsoVertices');
  expect(studio).toContain('faceAvailable(');
  expect(studio).toContain('sculptorPrecisionPanel" open');
  expect(slider).toContain('disabled={!actif}');
  expect(slider).toContain('aria-valuetext');
  expect(slider).toContain('navigator.vibrate(8)');
 });
 it('place les curseurs avant les presets défilants, et garde la validation fixe',()=>{
  const precision=studio.indexOf('sculptorPrecisionPanel" open');
  const presets=studio.indexOf("section==='corps'&&");
  const commit=studio.indexOf('sculptorCommit');
  expect(precision).toBeGreaterThan(-1);
  expect(presets).toBeGreaterThan(precision);
  expect(commit).toBeGreaterThan(presets);
  expect(style).toContain('.coachShapeGrid');
  expect(style).toContain('overflow-x:auto');
  expect(style).toContain('.sculptorCommit');
  expect(style).toContain('grid-template-columns:53px minmax(0,1fr)');
 });
 it('applique de vrais tokens sombres sans fausses métriques',()=>{
  expect(style).toContain('--sculpt-noir:#000000');
  expect(style).toContain('--sculpt-anthracite:#1a1a1a');
  expect(style).toContain('flex:0 0 55%!important');
  expect(style).toContain('flex:1 1 45%!important');
  expect(style).toContain('min-width:44px;min-height:44px');
  expect(f('App.tsx')).toContain("import './SculptorWorkspace.css'");
 });
});
