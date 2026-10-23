import {useCallback,useEffect,useMemo,useState,type FormEvent} from 'react';

const REPO='Doorsofhell/cme-3d-motion-lab';
const WEB='https://github.com/'+REPO+'/issues';
const API='https://api.github.com/repos/'+REPO+'/issues';
const MARKER='<!-- CME3D_INCIDENT -->';
export interface TestContext {
 actor:string;discipline:string;outfit:string;technique:string;renderStyle:string;quality:string;userAgent:string;diagnostics:string;
}
export interface IssueData {
 number:number;title:string;body:string|null;state:string;html_url:string;
 labels:Array<string|{name:string}>;created_at:string;updated_at:string;pull_request?:unknown;
}
export function stageForIssue(issue:IssueData):{progress:number;stage:string;done:boolean}{
 if(issue.state==='closed')return {progress:100,stage:'Terminé',done:true};
 const labels=issue.labels.map(l=>typeof l==='string'?l:l.name).map(x=>x.toLowerCase());
 const states:[string,number,string][]=[
  ['cme:validation',75,'Vérification'],
  ['cme:correctif',50,'Correction'],
  ['cme:diagnostic',25,'Diagnostic'],
  ['cme:reproduction',10,'Reproduction']
 ];
 let progress=0,stage='À traiter';
 for(const [label,p,s] of states)if(labels.includes(label)){progress=p;stage=s;break;}
 const body=issue.body??'';
 const steps=[
  /- \[x\]\s*Reproduction/i,
  /- \[x\]\s*Diagnostic/i,
  /- \[x\]\s*Correctif/i,
  /- \[x\]\s*Tests/i
 ];
 const n=steps.filter(x=>x.test(body)).length;
 const checklist=[0,25,50,75,90][n];
 if(checklist>progress){progress=checklist;stage=['À traiter','Reproduction','Diagnostic','Correction','Tests validés'][n];}
 return {progress,stage,done:false};
}
export function IncidentReporter({context,onClose}:{context:TestContext;onClose:()=>void}){
 const [title,setTitle]=useState(''),[observed,setObserved]=useState(''),[expected,setExpected]=useState('');
 const [severity,setSeverity]=useState('Majeure'),[error,setError]=useState('');
 const issueURL=useMemo(()=>{
  const safe=(s:string)=>s.replaceAll('\r','').slice(0,1800);
  const content=[
   MARKER,'## Contexte du test',
   '- Coach : '+context.actor,'- Discipline : '+context.discipline,
   '- Tenue : '+context.outfit,'- Technique : '+context.technique,
   '- Rendu : '+context.renderStyle,'- Qualité : '+context.quality,
   '- Priorité : '+severity,'- Navigateur : '+context.userAgent,'',
   '## Constat',safe(observed),'','## Résultat attendu',safe(expected),'',
   '## Diagnostic embarqué','~~~',safe(context.diagnostics),'~~~','',
   '## Étapes de traitement (à cocher par le développement)',
   '- [ ] Reproduction de l’incident','- [ ] Diagnostic confirmé',
   '- [ ] Correctif intégré','- [ ] Tests et vérification','',
   'Le ticket est à 100 % uniquement après fermeture.'
  ].join('\n');
  const url=new URL(WEB+'/new');
  url.searchParams.set('title','[CME-3D] '+title.trim().slice(0,120));
  url.searchParams.set('body',content);
  return url.toString();
 },[context,title,observed,expected,severity]);
 const submit=(e:FormEvent)=>{
  e.preventDefault();
  if(title.trim().length<5||observed.trim().length<8||expected.trim().length<6){setError('Renseigne le titre, le constat et le résultat attendu.');return;}
  setError('');
  window.open(issueURL,'_blank','noopener,noreferrer');
 };
 return <div className="incidentBackdrop" onClick={onClose}>
  <form className="incidentModal" role="dialog" aria-label="Déclarer un incident" onSubmit={submit} onClick={e=>e.stopPropagation()}>
   <div className="modalHeading"><div><strong>Signaler un incident</strong><span>Le contexte du test et les diagnostics seront préremplis.</span></div><button type="button" aria-label="Fermer la déclaration" onClick={onClose}>×</button></div>
   <div className="incidentContext">{context.actor} · {context.discipline} · {context.technique} · {context.renderStyle}</div>
   <label>Titre<input aria-label="Titre de l'incident" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex. Main gauche traverse le buste" maxLength={120}/></label>
   <label>Priorité<select aria-label="Priorité" value={severity} onChange={e=>setSeverity(e.target.value)}><option>Bloquante</option><option>Majeure</option><option>Mineure</option><option>Amélioration</option></select></label>
   <label>Constat<textarea aria-label="Constat" value={observed} onChange={e=>setObserved(e.target.value)} placeholder="Décris ce qui se produit, à quel moment et comment le reproduire." rows={3}/></label>
   <label>Résultat attendu<textarea aria-label="Résultat attendu" value={expected} onChange={e=>setExpected(e.target.value)} placeholder="Décris précisément le comportement attendu." rows={2}/></label>
   {error&&<p className="formError" role="alert">{error}</p>}
   <div className="issueDisclaimer">La page GitHub de la demande s’ouvrira. <strong>Valide « Submit new issue » sur GitHub</strong> pour enregistrer réellement le ticket. Rien n’est créé avant cette confirmation. Les demandes sont publiques sur GitHub. Tu peux ajouter une capture d’écran avant de valider.</div>
   <button className="incidentSubmit" type="submit">Continuer vers l’enregistrement ↗</button>
  </form>
 </div>;
}
export function IssueTracker(){
 const [issues,setIssues]=useState<IssueData[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState(''),[checked,setChecked]=useState('');
 const refresh=useCallback(async()=>{
  setLoading(true);
  try{
   const res=await fetch(API+'?state=all&per_page=100&sort=created&direction=asc',{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
   if(!res.ok)throw new Error('HTTP '+res.status+(res.status===403?' · quota de consultation GitHub':''));
   const data=await res.json() as IssueData[];
   setIssues(data.filter(x=>!x.pull_request&&((x.body??'').includes(MARKER)||x.title.startsWith('[CME-3D]'))).sort((a,b)=>a.number-b.number));
   setChecked(new Date().toLocaleTimeString('fr-FR'));setError('');
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setLoading(false);}
 },[]);
 useEffect(()=>{void refresh();const id=window.setInterval(()=>{if(document.visibilityState==='visible')void refresh();},180000);return()=>window.clearInterval(id);},[refresh]);
 const open=useMemo(()=>issues.filter(x=>x.state!=='closed').sort((a,b)=>a.number-b.number),[issues]);
 const closed=useMemo(()=>issues.filter(x=>x.state==='closed').sort((a,b)=>b.number-a.number),[issues]);
 return <section className="tracker" aria-label="Suivi des corrections">
  <div className="trackerTitle"><div><strong>Suivi des corrections</strong><small>File GitHub ordonnée par numéro de demande</small></div><button onClick={()=>void refresh()} disabled={loading}>{loading?'Lecture…':'↻ Actualiser'}</button></div>
  <div className="trackerSummary"><div><strong>{open.length}</strong><span>Ouvertes</span></div><div><strong>{open.filter(x=>stageForIssue(x).progress>0).length}</strong><span>En cours</span></div><div><strong>{closed.length}</strong><span>Terminées</span></div></div>
  <p className="trackerLegend">Pourcentage fondé sur les étapes explicitement validées dans les tickets. Mise à jour toutes les trois minutes.{checked?' Vérifié à '+checked+'.':''}</p>
  {error&&<div className="trackerWarning" role="alert">Lecture des demandes impossible : {error}. <a href={WEB} target="_blank" rel="noreferrer">Voir GitHub ↗</a></div>}
  <div className="trackerList">
   {!loading&&!error&&!issues.length&&<div className="trackerEmpty"><strong>Aucune demande enregistrée</strong><p>Déclare un incident dans le Laboratoire, puis confirme son enregistrement sur GitHub. Il apparaîtra ici.</p></div>}
   {[...open,...closed].map(item=>{
    const st=stageForIssue(item);
    const position=open.findIndex(x=>x.number===item.number)+1;
    return <article className="issueCard" key={item.number}>
     <div className="issueTop"><span className="issueNumber">#{item.number}{position?' · File n° '+position:''}</span><span className={st.done?'issueStatus finished':'issueStatus'}>{st.stage}</span></div>
     <strong className="issueName">{item.title.replace(/^\[CME-3D\]\s*/,'')}</strong>
     <div className="progressMeta"><span>Étapes validées</span><strong>{st.progress} %</strong></div>
     <div className="issueProgress" role="progressbar" aria-label={'Progression du ticket '+item.number} aria-valuemin={0} aria-valuemax={100} aria-valuenow={st.progress}><div style={{width:st.progress+'%'}}/></div>
     <div className="issueFooter"><span>Actualisé le {new Date(item.updated_at).toLocaleDateString('fr-FR')}</span><a href={item.html_url} target="_blank" rel="noreferrer">Ouvrir ↗</a></div>
    </article>;
   })}
  </div>
  <div className="trackerBottom">Les barres ne représentent pas le temps écoulé. La correction n’est pas déclenchée automatiquement dans une conversation.</div>
 </section>;
}
