import {describe,expect,it} from 'vitest';
import {roadmap} from './RoadmapPanel';
import {CME_APP_VERSION} from './buildInfo';
describe('Feuille de route V1',()=>{
 it('référence la version publiée',()=>expect(CME_APP_VERSION.split('.').map(Number).every(Number.isInteger)).toBe(true));
 it('attribue un identifiant unique, un statut, une priorité et une version à chaque chantier',()=>{
  expect(roadmap.length).toBeGreaterThanOrEqual(15);
  expect(new Set(roadmap.map(x=>x.id)).size).toBe(roadmap.length);
  for(const item of roadmap){
   expect(['Livré','En cours','À faire','Bloqué','À vérifier']).toContain(item.status);
   expect(['P0','P1','P2']).toContain(item.priority);
   expect(item.version).toMatch(/^\d+\.\d+\.\d+$/);
   expect(item.title.length).toBeGreaterThan(8);
  }
 });
 it('conserve les chantiers fondamentaux et les fessiers féminins comme fonctionnalité distincte',()=>{
  expect(roadmap.some(x=>/fessiers féminins/i.test(x.title)&&x.status!=='Livré')).toBe(true);
  for(const area of ['Interface','Personnages','Galerie','Biomécanique','Qualité','Portabilité','Comparatif','Publication'])expect(roadmap.some(x=>x.area===area)).toBe(true);
 });
 it('ne présente pas la majeure 1.0 comme livrée',()=>expect(roadmap.some(x=>x.version==='1.0.0'&&x.status==='Livré')).toBe(false));
});
