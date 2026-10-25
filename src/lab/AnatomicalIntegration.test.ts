import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
const source=(name:string)=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
describe("Studio anatomique 0.7.41 — contrats d'intégration",()=>{
 it('applique le mode mannequin au vrai rig et passe les orientations à la caméra partagée',()=>{
  expect(source('NeutralRig.tsx')).toContain("mode==='mannequin'");
  expect(source('NeutralRig.tsx')).toContain("orientation={orientation}");
  expect(source('StudioCoach.tsx')).toContain("orientation={anatomicalView}");
  expect(source('CadrageSquelette.tsx')).toContain("directionAnatomique(orientation)");
 });
 it('active la morphologie dans les deux aperçus neutres et garde les tenues séparées',()=>{
  const studio=source('StudioCoach.tsx');
  expect(studio).toContain("anatomicalPreview?'mannequin':'creator'");
  expect(studio).toContain("range('hips','Largeur des hanches',.75,1.35,!!support?.shape.hipVertices)");
  expect(studio).toContain("range('muscle','Musculature',.7,1.35,!!support?.shape.torsoVertices)");
  expect(source('NeutralRig.tsx')).toContain("props.mode==='appearance'?<OutfittedRig");
 });
});
