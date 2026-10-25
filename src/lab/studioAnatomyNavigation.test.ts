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
  expect(studio).toContain('groupeActif.zones.includes(item)');
  expect(studio).toContain('<AnatomyIcon zone={groupe.icone}');
 });
 it('garde une scène sombre et la sélection homme/femme dans le viewport',()=>{
  expect(studio).toContain('coachQuickChoice coachSexeVue');
  expect(studio).toContain('#151921');
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
  expect(studio).toContain("choose('hairStyle','Coupe souhaitée',['rase','court','long'],false)");
  expect(studio).toContain('HAIR_TONES.map(t=><button key={t.hex} type="button" disabled');
  expect(studio).toContain('Coiffures spécialisées GLB non intégrées');
  expect(studio).toContain("key!=='hairColor'&&!!support?.colors[key]");
  expect(studio).toContain("disabled={!colorAvailable('skin')}");
 });
});
