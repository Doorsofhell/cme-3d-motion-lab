import {describe,it,expect} from 'vitest';
// @ts-ignore — Vitest exécute la lecture des sources sous Node.
import {readFileSync} from 'node:fs';
import {REGIONS_SCULPTEUR,regionsPourGroupe} from './sculptorRegions';
import {GROUPES_ANATOMIQUES} from './studioAnatomyNavigation';
import {SHAPE_GROUPS} from './visualShapePresets';
const file=(p:string)=>readFileSync(new URL('./'+p,import.meta.url),'utf8');
describe('Studio 0.7.50 : sous-zones anatomiques directement pilotables',()=>{
 const studio=file('StudioCoach.tsx'),icons=file('SculptorRegionIcon.tsx'),css=file('SculptorWorkspace.css');
 it('expose 18 cibles sans répétition, en conservant les cinq catégories X',()=>{
  expect(GROUPES_ANATOMIQUES).toHaveLength(5);
  const all=GROUPES_ANATOMIQUES.flatMap(g=>regionsPourGroupe(g.id));
  expect(all).toHaveLength(18);
  expect(new Set(all.map(x=>x.id)).size).toBe(all.length);
  for(const groupe of GROUPES_ANATOMIQUES)expect(REGIONS_SCULPTEUR[groupe.id].length).toBeGreaterThan(0);
 });
 it('relie chaque curseur de région à un vrai paramètre du CoachLook',()=>{
  const ids=new Set(SHAPE_GROUPS.map(g=>g.id));
  for(const region of Object.values(REGIONS_SCULPTEUR).flat()){
   if(region.forme&&region.forme!=='height')expect(ids.has(region.forme)).toBe(true);
  }
  for(const required of ['eyes','nose','jaw','shoulders','bust','waist','hips','glutes','thighs','calves'])
   expect(Object.values(REGIONS_SCULPTEUR).flat().find(x=>x.id===required)).toBeDefined();
 });
 it('ouvre directement le réglage visé et recadre la scène sans toucher au squelette',()=>{
  expect(studio).toContain('regionsPourGroupe(groupeActif.id).map(cible=>');
  expect(studio).toContain('<SculptorRegionIcon cible={cible}/>');
  expect(studio).toContain('onClick={()=>ouvrirCible(cible)}');
  expect(studio).toContain('setExpandedShape(cible.forme)');
  expect(studio).toContain('recenter(focusForSetting(cible.forme,cible.zone))');
  expect(studio).toContain("expandedShape!==key");
  expect(studio).toContain('g.id===expandedShape');
  expect(studio).toContain("actif={enabled}");
 });
 it('conserve les commandes sans actif GLB désactivées',()=>{
  expect(studio).toContain('faceAvailable(');
  expect(studio).toContain('!!support?.shape.hipVertices');
  expect(studio).toContain('!!support?.shape.calfVertices');
  expect(studio).toContain("choose('hairStyle','Coupe souhaitée',['rase','court','long'],false)");
  expect(icons).toContain('COURBES');
 });
 it('respecte 44 px minimum, un rail défilant et la navigation globale inchangée',()=>{
  expect(css).toContain('.sculptorYAxis .coachCategories button');
  expect(css).toContain('min-height:52px!important');
  expect(css).toContain('touch-action:pan-y');
  expect(css).toContain('.sculptorRegionIcon');
  expect(file('NavigationPrincipale.tsx')).toContain('Studio Coach');
  expect(file('NavigationPrincipale.tsx')).toContain('Mouvements');
  expect(file('NavigationPrincipale.tsx')).toContain('Galerie');
  expect(file('NavigationPrincipale.tsx')).toContain('Plus');
 });
});
