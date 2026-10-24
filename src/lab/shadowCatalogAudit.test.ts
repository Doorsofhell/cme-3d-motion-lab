import {describe,it,expect} from 'vitest';
import {auditSummary,techniqueStatus} from './shadowCatalogAudit';
import techniques from './shadowTechniqueInventory.json';
import exercises from './shadowExercises.json';
describe('read-only Shadow catalog inventory',()=>{
 it('deduplicates source technique IDs',()=>{expect(new Set(techniques.map(x=>x.id)).size).toBe(techniques.length);});
 it('keeps exercise IDs unique and six disciplines represented',()=>{const x=auditSummary();expect(x.duplicateExercises).toBe(0);expect(x.disciplines).toBe(6);expect(x.exercises).toBe(208);});
 it('preserves missing Shadow IDs without claiming biomechanical validation',()=>{expect(techniqueStatus('shizen-tai')).toBe('source_only');expect(techniqueStatus('garde')).toBe('mapped_not_validated');});
 it('does not contain unresolved exercise motion IDs against Shadow techniques',()=>{const ids=new Set(techniques.map(x=>x.id));expect(exercises.flatMap(x=>x.motions).filter(x=>!ids.has(x))).toEqual([]);});
});
