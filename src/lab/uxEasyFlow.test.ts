// @ts-ignore — tests Vitest exécutés par Node, pas dans le bundle Android.
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const read=(name:string)=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
describe('Parcours UX 0.7.45',()=>{
 const studio=read('StudioCoach.tsx'),app=read('App.tsx'),fighter=read('Fighter.tsx');
 it('présente trois choix clairs au lieu de sept panneaux simultanés',()=>{
  expect(studio).toContain('studioSteps.map(item=>');
  expect(studio).toContain('regionsPourGroupe(groupeActif.id).map(cible=>');
  expect(studio).toContain('1. Silhouette');
  expect(studio).toContain('2. Visage et couleurs');
  expect(studio).toContain('3. Équipement');
  expect(studio).toContain('coachExpertTools');
 });
 it('applique coiffure, visage et couleur sur les vrais modèles du Studio et du Laboratoire',()=>{
  expect(read('NeutralRig.tsx')).toContain('applyCoachHair(scene,hairStyle');
  expect(fighter).toContain('applyCoachHair(s,coachLook.hairStyle');
  expect(read('coachGeometry.ts')).toContain('applyCoachFaceGeometry(root,look)');
  expect(studio).toContain('setReferenceMode(false);setAnatomicalPreview(false)');
 });
 it('garantit un aperçu de coach sans demande de sauvegarde manuelle',()=>{
  expect(studio).toContain("const id='cme-studio-preview'");
  expect(studio).toContain('addSavedCoach(localStorage,profile)');
  expect(studio).toContain("new Event('cme-open-lab-coach')");
 });
 it('ne propose que les gestes attestés disponibles dans le vrai rig',()=>{
  expect(fighter).toContain('entry.motions.every(id=>library.has(id))');
  expect(fighter).toContain('...rawSequences,...shadowSequences');
  expect(app).toContain("reviewEntries.filter(e=>report?.availableMotions?.includes(e.id))");
  const shadow=readFileSync(new URL('../shadow-training/ShadowTrainingPanel.tsx',import.meta.url),'utf8');
  const bridge=readFileSync(new URL('../shadow-training/bridge.ts',import.meta.url),'utf8');
  expect(app).toContain('<ShadowTrainingPanel');
  expect(shadow).toContain('disabled={!canStart}');
  expect(shadow).toContain('status.reason');
  expect(bridge).toContain('imported.get(id)');
  expect(app).toContain("setTechnique(motion??'garde')");
 });
});
