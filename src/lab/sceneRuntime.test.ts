// @ts-ignore — Vitest s'exécute dans Node, sans nécessité d'ajouter les types Node à la PWA.
import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {shouldRenderLabFrames,alternateRigAsset} from './sceneRuntime';
const read=(file:string)=>readFileSync(new URL('./'+file,import.meta.url),'utf8');

describe('politique de ressources 3D — audit global',()=>{
 it('dessine uniquement le Laboratoire visible',()=>{
  expect(shouldRenderLabFrames('lab',true)).toBe(true);
  for(const tab of ['studio','comparison','tracking','versions','options']){
   expect(shouldRenderLabFrames(tab,true)).toBe(false);
  }
  expect(shouldRenderLabFrames('lab',false)).toBe(false);
 });
 it('précharge le GLB du sexe alternatif et ne change pas les fichiers des modèles',()=>{
  expect(alternateRigAsset('homme')).toBe('mma-amara');
  expect(alternateRigAsset('femme')).toBe('mma-kadir');
 });
 it('lie la politique aux boucles Canvas, aux onglets et à la visibilité de page',()=>{
  const app=read('App.tsx');
  expect(app).toContain('shouldRenderLabFrames(tab,pageVisible)');
  expect(app).toContain("document.addEventListener('visibilitychange',sync)");
  expect(app).toContain('frameloop={active?"always":"never"}');
  expect(app).toContain('active={labActive}');
  expect(app).toContain('if(!playing||!labActive)return');
 });
 it('interdit le préchargement GLB au chargement du module Studio',()=>{
  const studio=read('StudioCoach.tsx');
  const componentStart=studio.indexOf('export function StudioCoach()');
  const preload=studio.indexOf('useGLTF.preload');
  expect(componentStart).toBeGreaterThan(0);
  expect(preload).toBeGreaterThan(componentStart);
  expect(studio).toContain('if(!report)return;');
  expect(studio).toContain('alternateRigAsset(report.sex)');
 });
 it('ne laisse aucun littéral antislash-n dans le contenu du comparatif',()=>{
  const comparison=read('ComparisonPanel.tsx');
  expect(comparison).not.toContain('\\n  <div className="comparisonActions">');
  expect(comparison).toContain('<div className="comparisonActions">');
 });
});
