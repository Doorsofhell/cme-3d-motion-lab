import {useMemo,useState} from 'react';
import './MotionReview.css';
export type ReviewMotion={id:string;name:string;kind:'technique'|'sequence';motions:string[]};
export type ReviewResult={id:string;discipline:string;coach:string;status:'validated'|'rejected';comment:string;testedAt:string;engineVersion:string;metrics:Record<string,unknown>};
const KEY='cme-motion-reviews-v1';
function read():ReviewResult[]{try{const v=JSON.parse(localStorage.getItem(KEY)??'[]') as unknown;return Array.isArray(v)?v.filter((x):x is ReviewResult=>!!x&&typeof x==='object'&&typeof x.id==='string'&&typeof x.discipline==='string'&&typeof x.status==='string').slice(-1500):[];}catch{return [];}}
export function MotionReview({entries,discipline,coach,selected,onSelect,engineVersion,metrics,rigReady,rigTechniqueFound}:{
 entries:ReviewMotion[];discipline:string;coach:string;selected:string;onSelect:(id:string)=>void;engineVersion:string;metrics:Record<string,unknown>;rigReady:boolean;rigTechniqueFound:boolean;
}){
 const [results,setResults]=useState<ReviewResult[]>(read);
 const [q,setQ]=useState('');
 const [kind,setKind]=useState<'all'|'technique'|'sequence'>('all');
 const [comment,setComment]=useState('');
 const [message,setMessage]=useState('');
 const known=new Set(entries.filter(x=>x.kind==='technique').map(x=>x.id));
 const visible=useMemo(()=>entries.filter(x=>(kind==='all'||x.kind===kind)&&(x.name+' '+x.id).toLocaleLowerCase('fr').includes(q.toLocaleLowerCase('fr'))),[entries,q,kind]);
 const current=entries.find(x=>x.id===selected);
 const catalogExecutable=(entry:ReviewMotion)=>entry.kind==='technique'||entry.motions.every(id=>known.has(id));
 const existing=results.find(x=>x.id===selected&&x.discipline===discipline&&x.coach===coach);
 const canReview=!!current&&catalogExecutable(current)&&rigReady&&rigTechniqueFound;
 const exportText=()=>{const lines=[`# Rapport de recette technique CME-3D`,`Version moteur : ${engineVersion}`,`Discipline : ${discipline}`,`Coach : ${coach}`,`Généré : ${new Date().toISOString()}`,`Total référencé : ${entries.length}`,`Exécutable selon catalogue : ${entries.filter(catalogExecutable).length}`,`Validés : ${results.filter(x=>x.discipline===discipline&&x.coach===coach&&x.status==='validated').length}`,`Refusés : ${results.filter(x=>x.discipline===discipline&&x.coach===coach&&x.status==='rejected').length}`,'','## Résultats de recette'];
  for(const e of entries){const r=results.find(x=>x.id===e.id&&x.coach===coach&&x.discipline===discipline);lines.push(`### ${e.name} (${e.id})`,`Type : ${e.kind}`,`Gestes : ${e.motions.join(' → ')}`,`Catalogue complet : ${catalogExecutable(e)?'oui':'non — dépendances manquantes'}`,`Évaluation humaine : ${r?.status??'non testé'}`,`Commentaire : ${r?.comment??'aucun'}`,`Mesures de la session : ${r?JSON.stringify(r.metrics):'non capturées'}`,`Date : ${r?.testedAt??'—'}`,'');}
  lines.push('## Demande de correction ChatGPT','Identifier les causes des rejets, proposer les correctifs biomécaniques et techniques sans modifier les mouvements canoniques avant validation, fournir tests de non-régression. Les mesures et avis ne constituent pas une analyse vidéo.');
  const text=lines.join('\n');if(navigator.clipboard?.writeText){void navigator.clipboard.writeText(text).then(()=>setMessage('Rapport copié.')).catch(()=>setMessage('Copie indisponible : utilisez le téléchargement.'));}
  const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='cme-recette-mouvements.md';a.click();URL.revokeObjectURL(url);
 };
 const record=(status:'validated'|'rejected')=>{
  if(!canReview){setMessage('Lancez un mouvement réellement disponible avant de le valider.');return;}
  if(status==='rejected'&&!comment.trim()){setMessage('Indiquez le défaut observé avant de rejeter.');return;}
  const next:ReviewResult={id:selected,discipline,coach,status,comment:comment.trim(),testedAt:new Date().toISOString(),engineVersion,metrics};
  const all=[next,...results.filter(x=>!(x.id===selected&&x.discipline===discipline&&x.coach===coach))].slice(0,1500);
  try{localStorage.setItem(KEY,JSON.stringify(all));setResults(all);setMessage(status==='validated'?'Mouvement validé.':'Anomalie enregistrée pour le rapport.');}catch{setMessage('Stockage local indisponible.');}
 };
 return <section className="cmeReview" aria-label="Recette des mouvements et enchaînements">
  <header className="cmeReviewHeader"><div><h2>Recette des mouvements</h2><p>Sélectionner, exécuter, examiner, valider ou signaler.</p></div><button onClick={exportText}>Exporter rapport technique</button></header>
  <div className="cmeReviewFilters"><input type="search" aria-label="Rechercher un mouvement à tester" placeholder="Rechercher une technique ou un enchaînement" value={q} onChange={e=>setQ(e.target.value)}/><select aria-label="Type à tester" value={kind} onChange={e=>setKind(e.target.value as typeof kind)}><option value="all">Tous</option><option value="technique">Techniques</option><option value="sequence">Enchaînements</option></select></div>
  <p className="cmeReviewHint">{entries.length} référencés · {entries.filter(catalogExecutable).length} complets selon catalogue · {results.filter(x=>x.discipline===discipline&&x.coach===coach&&x.status==='validated').length} validés · {results.filter(x=>x.discipline===discipline&&x.coach===coach&&x.status==='rejected').length} rejetés. La présence au catalogue ne garantit pas l'exécution du rig.</p>
  <div className="cmeReviewList">{visible.map(entry=>{const r=results.find(x=>x.id===entry.id&&x.discipline===discipline&&x.coach===coach);const complete=catalogExecutable(entry);return <button key={entry.id} className={selected===entry.id?'active':''} disabled={!complete} aria-pressed={selected===entry.id} onClick={()=>{onSelect(entry.id);setComment(results.find(x=>x.id===entry.id&&x.discipline===discipline&&x.coach===coach)?.comment??'');setMessage('');}}><span><strong>{entry.name}</strong><small>{entry.kind==='sequence'?'Enchaînement':'Technique'} · {entry.motions.join(' → ')}</small></span><em>{!complete?'Gestes manquants':r?.status==='validated'?'✓ Validé':r?.status==='rejected'?'✕ Rejeté':'À tester'}</em></button>})}</div>
  <div className="cmeReviewDecision"><h3>{current?.name??'Choisissez un élément'}</h3><p>{!current?'Aucun mouvement sélectionné.':!catalogExecutable(current)?'Certains gestes de cet enchaînement ne sont pas référencés.':!rigReady?'Chargement du rig : exécution non confirmée.':!rigTechniqueFound?'Mouvement non confirmé par le moteur 3D : validation désactivée.':'Mouvement résolu dans le rig : contrôlez visuellement l’exécution avant de statuer.'}</p><label>Observations techniques<textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} placeholder="Ex. : pied arrière glisse, épaule déboîtée, timing trop rapide…"/></label><div className="cmeReviewActions"><button type="button" disabled={!canReview} onClick={()=>record('validated')}>✓ Valider</button><button type="button" disabled={!canReview} onClick={()=>record('rejected')}>✕ Refuser et commenter</button></div>{existing&&<small>Dernier avis : {existing.status==='validated'?'validé':'refusé'} — {existing.testedAt}</small>}{message&&<p role="status">{message}</p>}</div>
 </section>;
}
