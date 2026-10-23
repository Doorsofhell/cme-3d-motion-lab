import type {AutoIncident} from './AutoIncidents';
import type {IssueData} from './Issues';
import {correlationId} from './SessionReport';
export const ID_MARKER='CME3D-CORRELATION: ';
export const FAILED_LABELS=['cme:failed','cme:echec','cme:échec','cme:regression','cme:régression'];
export function hasFailedTreatment(issue:IssueData):boolean{
 const labels=(issue.labels||[]).map(x=>typeof x==='string'?x:x.name).map(x=>x.toLowerCase());
 return labels.some(x=>FAILED_LABELS.includes(x));
}
export function linkForDraft(draft:AutoIncident,issues:IssueData[]):IssueData|undefined{
 const id=correlationId(draft.fingerprint);
 return issues.find(x=>!!x.body&&x.body.includes(ID_MARKER+id));
}
export function unresolvedDrafts(drafts:AutoIncident[],issues:IssueData[]):AutoIncident[]{
 // Submitted incidents disappear from the "to report" inbox. They come back only after
 // an explicit correction failure or regression label on their tracked GitHub issue.
 return drafts.filter(d=>{const ticket=linkForDraft(d,issues);return !ticket||hasFailedTreatment(ticket);});
}
