import {describe,expect,it} from 'vitest';
// @ts-ignore — inspection de sources sous Vitest Node
import {readFileSync} from 'node:fs';
import {GROUPES_ANATOMIQUES,groupePourZone,type ZoneAnatomique} from './studioAnatomyNavigation';
const read=(p:string)=>readFileSync(new URL('./'+p,import.meta.url),'utf8');
describe('Studio premium 0.7.47 — référence visuelle et commande réelles',()=>{
 const studio=read('StudioCoach.tsx'),css=read('StudioReferenceLook.css'),app=read('App.tsx');
 it('présente cinq groupes visuels donnant accès à sept zones sans doublon',()=>{
  expect(GROUPES_ANATOMIQUES.map(g=>g.libelle)).toEqual(['Tête','Corps','Jambes','Peau','Tenues']);
  const zones=GROUPES_ANATOMIQUES.flatMap(g=>g.zones);
  expect(zones.length).toBe(7);
  expect(new Set(zones).size).toBe(7);
  for(const zone of zones)expect(groupePourZone(zone as ZoneAnatomique).zones).toContain(zone);
  expect(studio).toContain('GROUPES_ANATOMIQUES.map(groupe=>');
  expect(studio).toContain('regionsPourGroupe(groupeActif.id)');
  expect(studio).toContain('<AnatomyIcon zone={groupe.icone}');
 });
 it('garde une scène sombre et la sélection homme/femme sans masquage',()=>{
  expect(studio).toContain('coachQuickChoice coachSexeVue');
  expect(studio).toContain('#090b0f');
  expect(css).toContain('.coachGroupesAnatomiques button');
  expect(css).toContain('min-height:54px');
  expect(css).toContain('coachSexeVue button');
  expect(css).toContain('min-height:44px');
  expect(css).toContain('.coachCrud .coachSave');
  expect(css).toContain('#e51c43');
  expect(app).toContain("import './StudioReferenceLook.css'");
 });
 it('rétablit les vues et étapes avancées sans déplacer le rig',()=>{
  expect(studio).toContain('recenter(focusForSection(item))');
  expect(studio).toContain('studioSteps.map(item=>');
  expect(studio).toContain('ANATOMICAL_VIEWS.map(v=>');
  expect(studio).toContain('<NeutralRig');
  expect(studio).toContain('creationPose={!testingMotion}');
 });
 it('signale sans simuler les actifs capillaires absents',()=>{
  expect(studio).toContain('HAIR_STYLES.map(c=>');
  expect(studio).toContain('HAIR_TONES.map(t=><button key={t.hex}');
  expect(studio).toContain('Ces modèles capillaires ne sont pas des GLB photoréalistes.');
  expect(studio).toContain("key==='hairColor'?!!report?.appearanceSupport.hairReady");
  expect(studio).toContain("disabled={!colorAvailable('skin')}");
 });
});
