import {describe,it,expect} from 'vitest';
import {registerIncident,autoIssueURL,incidentFingerprint,type AutoIncident} from './AutoIncidents';
import type {TestContext} from './Issues';
const context:TestContext={
 actor:'Amara',discipline:'boxe',outfit:'boxe',technique:'crochet-avant',
 renderStyle:'ultra',quality:'balanced',userAgent:'Android Chrome',diagnostics:'{"fps":29}'
};
const input={category:'javascript' as const,title:'Erreur de calcul',details:'Erreur: rotation de bras impossible à 12:34',context};
describe('détection automatique, brouillons privés, soumission manuelle',()=>{
 it('construit un signalement local sans numéro GitHub',()=>{
  const incidents=registerIncident([],input,'2026-10-24T00:00:00.000Z');
  expect(incidents).toHaveLength(1);
  expect(incidents[0].occurrences).toBe(1);
  expect(incidents[0].details).toContain('rotation');
 });
 it('déduplique un incident identique survenu dans la minute',()=>{
  const first=registerIncident([],input,'2026-10-24T00:00:00.000Z');
  expect(registerIncident(first,input,'2026-10-24T00:00:04.000Z')).toBe(first);
 });
 it('incrémente une récurrence plus tard sans nouveau brouillon',()=>{
  const first=registerIncident([],input,'2026-10-24T00:00:00.000Z');
  const next=registerIncident(first,input,'2026-10-24T00:02:00.000Z');
  expect(next).toHaveLength(1);
  expect(next[0].occurrences).toBe(2);
 });
 it('sépare deux techniques différentes',()=>{
  expect(incidentFingerprint('motion','technique absente',context)).not.toEqual(incidentFingerprint('motion','technique absente',{...context,technique:'jab'}));
 });
 it('prépare un ticket prérempli sans l’envoyer',()=>{
  const item=registerIncident([],input,'2026-10-24T00:00:00.000Z')[0];
  const url=new URL(autoIssueURL(item));
  expect(url.hostname).toBe('github.com');
  expect(url.pathname).toContain('/issues/new');
  expect(url.searchParams.get('title')).toContain('Erreur de calcul');
  expect(url.searchParams.get('body')).toContain('<!-- CME3D_INCIDENT -->');
  expect(url.searchParams.get('body')).toContain('Soumission manuelle');
 });
});