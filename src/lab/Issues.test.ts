import {describe,it,expect} from 'vitest';
import {stageForIssue,type IssueData} from './Issues';
const sample=(patch:Partial<IssueData>={}):IssueData=>({
 number:1,title:'[CME-3D] test',body:'<!-- CME3D_INCIDENT -->',state:'open',labels:[],html_url:'https://github.com/Doorsofhell/cme-3d-motion-lab/issues/1',created_at:'2026-10-23T00:00:00Z',updated_at:'2026-10-23T00:00:00Z',...patch
});
describe('suivi authentique des corrections',()=>{
 it('commence à 0 sans étape déclarée',()=>{expect(stageForIssue(sample()).progress).toBe(0);});
 it('prend en compte le diagnostic marqué terminé',()=>{expect(stageForIssue(sample({body:'- [x] Reproduction terminée\n- [x] Diagnostic confirmé'})).progress).toBe(50);});
 it('reconnaît un label de validation',()=>{expect(stageForIssue(sample({labels:[{name:'cme:validation'}]})).progress).toBe(75);});
 it('ne suppose jamais 100 % sans fermeture',()=>{expect(stageForIssue(sample({body:'- [x] Reproduction\n- [x] Diagnostic\n- [x] Correctif\n- [x] Tests'})).progress).toBe(90);});
 it('retourne 100 % pour un ticket clos',()=>{expect(stageForIssue(sample({state:'closed'})).progress).toBe(100);});
});
