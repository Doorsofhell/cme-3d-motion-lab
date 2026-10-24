import techniques from './shadowTechniqueInventory.json';
import audit from './shadowCatalogAudit.json';
import exercises from './shadowExercises.json';
import cmeTechniques from './techniques.json';
export type CatalogStatus='source_only'|'mapped_not_validated'|'missing_motion';
export function techniqueStatus(id:string):CatalogStatus{
 const item=techniques.find(t=>t.id===id);
 if(!item)return 'source_only';
 const hasMotion=cmeTechniques.some(t=>t.id===item.motion||t.motion===item.motion);
 return !hasMotion?'missing_motion':item.availability==='source_only_not_in_cme'?'source_only':'mapped_not_validated';
}
export function auditSummary(){
 return {techniques:techniques.length,exercises:exercises.length,disciplines:Object.keys(audit.byDiscipline).length,missing:techniques.filter(t=>techniqueStatus(t.id)==='source_only').length,unmapped:techniques.filter(t=>techniqueStatus(t.id)==='missing_motion').length,duplicateExercises:exercises.length-new Set(exercises.map(x=>x.id)).size};
}
