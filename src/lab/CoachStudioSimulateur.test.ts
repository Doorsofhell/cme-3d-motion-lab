// @ts-ignore — lecture des modules par Vitest sous Node.
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {HAIR_STYLES} from './coachHair';
const src=(name:string)=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
describe('0.7.53 — nouveaux coachs et Simulateur',()=>{
 it('démarre sur un humain neutre sans sélection automatique de coach sauvegardé',()=>{
  const studio=src('StudioCoach.tsx');
  expect(studio).toContain("studioEditRequest()?.look??defaultCoachLook");
  expect(studio).toContain("setSelectedId(null)");
  expect(studio).toContain("Humanoïde neutre · nouveau");
  for(const action of ['Nouveau','Dupliquer','Supprimer'])expect(studio).toContain(action);
 });
 it('préserve identité, taille, poids, discipline et morphologie à la sauvegarde',()=>{
  const studio=src('StudioCoach.tsx');
  for(const key of ['name','nickname','heightCm','weightKg','initialDiscipline','accessories'])
   expect(studio).toContain(key);
  expect(studio).toContain("localStorage.setItem('cme-lab-coach',id)");
 });
 it('conserve les 7 coiffures en 3D pour les deux sexes, le Simulateur et les animations',()=>{
  expect(HAIR_STYLES.map(c=>c.id)).toEqual(['rase','degrade','court','mi-long','long','queue-haute','tresse']);
  const studio=src('StudioCoach.tsx'),sim=src('Fighter.tsx'),rig=src('NeutralRig.tsx');
  expect(studio).toContain('HAIR_STYLES.map(coupe=>');
  expect(studio).toContain("colorAvailable('hairColor')");
  expect(rig).toContain('applyCoachHair(scene,hairStyle');
  expect(sim).toContain('applyCoachHair(s,coachLook.hairStyle,coachLook.hairColor)');
  expect(src('NavigationPrincipale.tsx')).toContain("libelle:'Simulateur'");
 });
 it('conserve le moteur biomécanique, sans modification des mouvements ni des tenues',()=>{
  const sim=src('Fighter.tsx'),rig=src('NeutralRig.tsx');
  expect(sim).toContain('new MotionSampler(rig,');
  expect(rig).toContain("new CoachRig(scene)");
  expect(sim).toContain('applyCoachLookGeometry(s,coachLook)');
 });
});
