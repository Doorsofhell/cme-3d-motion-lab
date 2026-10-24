import {useMemo,useState} from 'react';
import techniques from './shadowTechniqueInventory.json';
import audit from './shadowCatalogAudit.json';
import {techniqueStatus,auditSummary} from './shadowCatalogAudit';
const disciplines=['toutes','boxe','kickboxing','muaythai','mma','bjj','judo'];
export function ShadowCatalogPanel(){
 const [discipline,setDiscipline]=useState('toutes');
 const [query,setQuery]=useState('');
 const [expanded,setExpanded]=useState(false);
 const summary=auditSummary();
 const rows=useMemo(()=>techniques.filter(t=>(discipline==='toutes'||t.disciplines.includes(discipline))&&(t.name+' '+t.id).toLowerCase().includes(query.toLowerCase())),[discipline,query]);
 return <section className="shadowCatalogPanel" aria-label="Référentiel Shadow en lecture seule">
  <button type="button" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>Référentiel Shadow · {summary.techniques} techniques · {summary.exercises} exercices {expanded?'▴':'▾'}</button>
  {expanded&&<div className="shadowCatalogContent">
   <p>Inventaire historique en lecture seule. « Référencée » ne signifie pas « animation biomécaniquement validée ».</p>
   <div className="shadowCatalogFilters"><select aria-label="Discipline du référentiel" value={discipline} onChange={e=>setDiscipline(e.target.value)}>{disciplines.map(d=><option key={d} value={d}>{d}</option>)}</select><input aria-label="Rechercher une technique" placeholder="Rechercher un mouvement" value={query} onChange={e=>setQuery(e.target.value)}/></div>
   <small>Exercices : {Object.entries(audit.byDiscipline).map(([d,n])=>d+' '+n).join(' · ')}</small>
   <div className="shadowCatalogRows">{rows.map(t=><div key={t.id}><strong>{t.name}</strong><small>{t.id} · {t.disciplines.join(', ')}</small><small>{techniqueStatus(t.id)==='source_only'?'Référence Shadow à intégrer':techniqueStatus(t.id)==='missing_motion'?'Mouvement non mappé':'Mouvement mappé, validation requise'}</small></div>)}</div>
  </div>}
 </section>;
}
