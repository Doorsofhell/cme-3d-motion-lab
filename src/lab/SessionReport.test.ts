import {describe,it,expect} from 'vitest';
import {appendEvent,addReading,buildFullReport,correlationId,type JournalState} from './SessionReport';
import {linkForDraft,unresolvedDrafts,hasFailedTreatment,ID_MARKER} from './IssueLinks';
import type {IssueData,TestContext} from './Issues';
import type {AutoIncident} from './AutoIncidents';
const context:TestContext={actor:'Amara',discipline:'boxe',outfit:'boxe',technique:'crochet-avant',renderStyle:'ultra',quality:'balanced',userAgent:'Android Chrome',diagnostics:'IK 80 os'};
const journal:JournalState={
 sessionId:'cme-test',startedAt:'2026-10-24T00:00:00.000Z',events:[{at:'2026-10-24T00:00:00.000Z',kind:'session',message:'Ouverture'}],discardedEvents:0,
 readings:0,fpsSum:0,fpsMin:9999,fpsMax:0,lowFpsReadings:0,samples:[],discardedSamples:0,lastSampleAt:0
};
const metric={fps:28,drawCalls:120,triangles:60000,textures:14,geometries:5,webgl:'WebGL 2',dpr:1.2};
const draft:AutoIncident={id:'d1',fingerprint:'error|Amara|boxe|glb',category:'webgl',title:'Perte du contexte graphique WebGL',details:'WebGL lost',
 context,firstSeen:'2026-10-24T00:01:00Z',lastSeen:'2026-10-24T00:01:00Z',occurrences:1};
const issue=(patch:Partial<IssueData>={}):IssueData=>({
 number:24,title:'[CME-3D] '+draft.title,body:'<!-- CME3D_INCIDENT -->\n'+ID_MARKER+correlationId(draft.fingerprint)+'\n- Coach : Amara\n- Technique : crochet-avant',
 state:'open',html_url:'https://github.com/Doorsofhell/cme-3d-motion-lab/issues/24',labels:[],created_at:'2026-10-24T00:00:00Z',updated_at:'2026-10-24T00:00:00Z',...patch
});
describe('rapport détaillé et statut réel des incidents',()=>{
 it('garde les événements chronologiques et les mesures',()=>{
  const next=appendEvent(journal,{at:'2026-10-24T00:00:05.000Z',kind:'technique',message:'Crochet gauche'});
  const measured=addReading(next,metric,'2026-10-24T00:00:10.000Z');
  expect(measured.events).toHaveLength(2);
  expect(measured.readings).toBe(1);
  expect(measured.samples).toHaveLength(1);
 });
 it('produit un rapport bavard qui contient le contexte, les événements et le ticket',()=>{
  const next=appendEvent(journal,{at:'2026-10-24T00:00:05.000Z',kind:'coach',message:'Kadir vers Amara'});
  const data=buildFullReport(next,context,[draft],metric,{bones:80},{playing:true,progress:.6,speed:.5},
   [{number:24,state:'open',title:issue().title,url:issue().html_url}]);
  expect(data).toContain('RAPPORT TECHNIQUE EXHAUSTIF');
  expect(data).toContain('Kadir vers Amara');
  expect(data).toContain('C. ANOMALIES DÉTECTÉES');
  expect(data).toContain(correlationId(draft.fingerprint));
  expect(data).toContain('Ticket #24');
  expect(data).toContain('JSON INTÉGRAL');
  expect(data.length).toBeGreaterThan(2500);
 });
 it('reconnaît un brouillon dans son ticket existant',()=>expect(linkForDraft(draft,[issue()])?.number).toBe(24));
 it('ne repropose pas une anomalie déjà déclarée, ouverte ou clôturée',()=>{
  expect(unresolvedDrafts([draft],[issue()])).toHaveLength(0);
  expect(unresolvedDrafts([draft],[issue({state:'closed'})])).toHaveLength(0);
 });
 it('réaffiche seulement si le traitement est marqué en échec',()=>{
  const failed=issue({state:'closed',labels:[{name:'cme:failed'}]});
  expect(hasFailedTreatment(failed)).toBe(true);
  expect(unresolvedDrafts([draft],[failed])).toHaveLength(1);
 });
 it('conserve un brouillon si le ticket GitHub n’a pas été confirmé',()=>expect(unresolvedDrafts([draft],[])).toHaveLength(1));
});