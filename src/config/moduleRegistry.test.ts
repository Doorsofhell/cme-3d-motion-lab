import {describe,expect,it} from 'vitest';
import {getConfigModule,moduleConfigs,validateModuleConfigs} from './moduleRegistry';
describe('Configuration JSON par module',()=>{
 it('valide chaque module séparément et vérifie les identifiants',()=>expect(validateModuleConfigs()).toEqual([]));
 it('conserve les cinq destinations et le mode auto',()=>{
  expect(getConfigModule('navigation').items.map(x=>x.label)).toEqual(['Studio','Mouvements','Technique','Versions','Autres']);
  expect(getConfigModule('navigation').defaultTheme).toBe('auto');
 });
 it('protège les mouvements canoniques et refuse les morphs faciaux fictifs',()=>{
  expect(getConfigModule('movements').canonicalMotionsReadOnly).toBe(true);
  expect(getConfigModule('face').requireActualMorphTargets).toBe(true);
  expect(getConfigModule('gallery').inside).toBe('studio');
  expect(Object.keys(moduleConfigs)).toHaveLength(7);
 });
});
