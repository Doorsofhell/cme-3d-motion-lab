import {useCallback,useEffect,useMemo,useState,type FormEvent} from 'react';
import {autoIssueURL,type AutoIncident} from './AutoIncidents';
import {hasFailedTreatment,linkForDraft} from './IssueLinks';
import {snapshotFilename} from './Screenshot';

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
 if(hasFailedTreatment(issue))return {progress:0,stage:'Échec du correctif',done:false};
 if(issue.state==='closed')return {progress:100,stage:'Terminé',done:true};
 const labels=issue.labels.map(l=>typeof l==='string'?l:l.name).map(x=>x.toLowerCase());
 const states:[string,number,string][]=[
  ['cme:validation',75,'Validation sur Android'],
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
export function IncidentReporter({context,image,onCapture,onClose}:{context:TestContext;image:string|null;onCapture:()=>string|null;onClose:()=>void}){
 const [screenshot,setScreenshot]=useState<string|null>(image);
 const [imageMessage,setImageMessage]=useState('');
 const filename=useMemo(()=>snapshotFilename({...context,progress:0}),[context.actor,context.discipline,context.technique,context.renderStyle]);
 const captureAgain=()=>{const result=onCapture();setScreenshot(result);setImageMessage(result?'Capture du combattant actualisée.':'Capture impossible : essaye après chargement du modèle.');};
 const copyImage=async()=>{
  if(!screenshot)return;
  try{
   if(typeof ClipboardItem==='undefined'||!navigator.clipboard?.write)throw Error('image clipboard unavailable');
   const blob=await(await fetch(screenshot)).blob();
   await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
   setImageMessage('Image copiée. Tu peux la coller dans le ticket GitHub.');
  }catch{setImageMessage('Copie de l’image indisponible sur ce navigateur : télécharge le PNG puis joins-le à GitHub.');}
 };
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
   '## Capture du combattant',
   screenshot?('Capture préparée : '+filename+' — joindre cette image PNG depuis le téléphone avant de valider le ticket.'):'Capture indisponible au moment de la déclaration.',
   '','## Diagnostic embarqué','~~~',safe(context.diagnostics),'~~~','',
   '## Étapes de traitement (à cocher par le développement)',
   '- [ ] Reproduction de l’incident','- [ ] Diagnostic confirmé',
   '- [ ] Correctif intégré','- [ ] Tests et vérification','',
   'Le ticket est à 100 % uniquement après fermeture.'
  ].join('\n');
  const url=new URL(WEB+'/new');
  url.searchParams.set('title','[CME-3D] '+title.trim().slice(0,120));
  url.searchParams.set('body',content);
  return url.toString();
 },[context,title,observed,expected,severity,screenshot,filename]);
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
   <section className="incidentPhoto" aria-label="Image du combattant à joindre">
    <div className="incidentPhotoHead"><strong>Capture du combattant</strong><span>Pose affichée au moment du signalement</span></div>
    {screenshot?<img src={screenshot} alt={'Capture 3D de '+context.actor+' en '+context.discipline+' pendant '+context.technique}/>:<p>Image non disponible : le coach doit être chargé pour capturer sa pose.</p>}
    <div className="incidentPhotoActions">
     <button type="button" onClick={captureAgain}>↻ Recapturer la pose</button>
     {screenshot&&<><a href={screenshot} download={filename}>↓ Télécharger PNG</a><button type="button" onClick={()=>{void copyImage();}}>Copier l'image</button></>}
    </div>
    {imageMessage&&<p role="status" className="incidentPhotoInfo">{imageMessage}</p>}
   </section>
   <label>Titre<input aria-label="Titre de l'incident" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex. Main gauche traverse le buste" maxLength={120}/></label>
   <label>Priorité<select aria-label="Priorité" value={severity} onChange={e=>setSeverity(e.target.value)}><option>Bloquante</option><option>Majeure</option><option>Mineure</option><option>Amélioration</option></select></label>
   <label>Constat<textarea aria-label="Constat" value={observed} onChange={e=>setObserved(e.target.value)} placeholder="Décris ce qui se produit, à quel moment et comment le reproduire." rows={3}/></label>
   <label>Résultat attendu<textarea aria-label="Résultat attendu" value={expected} onChange={e=>setExpected(e.target.value)} placeholder="Décris précisément le comportement attendu." rows={2}/></label>
   {error&&<p className="formError" role="alert">{error}</p>}
   <div className="issueDisclaimer">La page GitHub de la demande s’ouvrira. <strong>Valide « Submit new issue » sur GitHub</strong> pour enregistrer réellement le ticket. Rien n’est créé avant cette confirmation. Les demandes sont publiques sur GitHub. La capture est conservée localement : télécharge le PNG ou copie l’image et joins-la dans le ticket GitHub avant de valider. L’application ne peut pas téléverser directement une image sans autorisation GitHub.</div>
   <button className="incidentSubmit" type="submit">Continuer vers l’enregistrement ↗</button>
  </form>
 </div>;
}
const ISSUE_CACHE_KEY='cme3d:issues-cache';
function readIssueCache():{etag:string;data:IssueData[]}|null{
 try{const value=JSON.parse(localStorage.getItem(ISSUE_CACHE_KEY)??'null') as {etag?:unknown;data?:unknown}|null;return value&&typeof value.etag==='string'&&Array.isArray(value.data)?{etag:value.etag,data:value.data as IssueData[]}:null;}catch{return null;}
}
function writeIssueCache(etag:string|null,data:IssueData[]):void{
 if(!etag)return;
 try{localStorage.setItem(ISSUE_CACHE_KEY,JSON.stringify({etag,data}));}catch{/* Cache is optional. */}
}
export function useKnownIssues(){
 const [issues,setIssues]=useState<IssueData[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState(''),[checked,setChecked]=useState('');
 const refresh=useCallback(async()=>{
  setLoading(true);
  try{
   // Conditional request: a 304 answer does not count against GitHub's 60 requests/hour anonymous quota.
   const cached=readIssueCache();
   const res=await fetch(API+'?state=all&per_page=100&sort=updated&direction=desc',{headers:{Accept:'application/vnd.github+json',...(cached?{'If-None-Match':cached.etag}:{})},cache:'no-store'});
   let data:IssueData[];
   if(res.status===304&&cached)data=cached.data;
   else if(res.ok){data=await res.json() as IssueData[];writeIssueCache(res.headers.get('ETag'),data);}
   else{
    if(cached)setIssues(cached.data.filter(x=>!x.pull_request&&((x.body??'').includes(MARKER)||x.title.startsWith('[CME-3D]'))).sort((a,b)=>a.number-b.number));
    throw new Error('HTTP '+res.status+(res.status===403||res.status===429?' · quota de consultation GitHub atteint, dernière liste connue affichée':''));
   }
   setIssues(data.filter(x=>!x.pull_request&&((x.body??'').includes(MARKER)||x.title.startsWith('[CME-3D]'))).sort((a,b)=>a.number-b.number));
   setChecked(new Date().toLocaleTimeString('fr-FR'));setError('');
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setLoading(false);}
 },[]);
 useEffect(()=>{
  void refresh();
  const interval=window.setInterval(()=>{if(document.visibilityState==='visible')void refresh();},180000);
  const onFocus=()=>{if(document.visibilityState==='visible')void refresh();};
  window.addEventListener('focus',onFocus);
  document.addEventListener('visibilitychange',onFocus);
  return()=>{window.clearInterval(interval);window.removeEventListener('focus',onFocus);document.removeEventListener('visibilitychange',onFocus);};
 },[refresh]);
 return {issues,loading,error,checked,refresh};
}
export function IssueTracker({drafts,onDismiss,onClear,onCopyReport,issues,loading,error,checked,refresh}:{
 drafts:AutoIncident[];onDismiss:(id:string)=>void;onClear:()=>void;onCopyReport:()=>void;
 issues:IssueData[];loading:boolean;error:string;checked:string;refresh:()=>void;
}){
 const open=useMemo(()=>issues.filter(x=>x.state!=='closed'||hasFailedTreatment(x)).sort((a,b)=>a.number-b.number),[issues]);
 const closed=useMemo(()=>issues.filter(x=>x.state==='closed'&&!hasFailedTreatment(x)).sort((a,b)=>b.number-a.number),[issues]);
 return <section className="tracker" aria-label="Suivi des corrections">
  <div className="trackerTitle"><div><strong>Suivi des corrections</strong><small>File GitHub ordonnée par numéro de demande</small></div><div className="trackerTitleActions"><button onClick={onCopyReport}>Copier rapport détaillé</button><button onClick={()=>void refresh()} disabled={loading}>{loading?'Lecture…':'↻ Actualiser'}</button></div></div>
  <div className="trackerSummary"><div><strong>{open.length}</strong><span>Ouvertes</span></div><div><strong>{open.filter(x=>stageForIssue(x).progress>0).length}</strong><span>En cours</span></div><div><strong>{closed.length}</strong><span>Terminées</span></div></div>
  <p className="trackerLegend">Les anomalies déjà associées à un ticket GitHub sont retirées des brouillons à soumettre. Elles n’y réapparaissent qu’en cas d’échec explicite du correctif.{checked?' Dernière lecture GitHub à '+checked+'.':''}</p>
  {error&&<div className="trackerWarning" role="alert">Lecture des demandes impossible : {error}. <a href={WEB} target="_blank" rel="noreferrer">Voir GitHub ↗</a></div>}
  <div className="trackerList">
   <section className="autoInbox" aria-label="Signalements automatiques à examiner">
    <div className="autoInboxHeader"><strong>Détectés automatiquement <span className="autoCount">{drafts.length}</span></strong>{drafts.length>0&&<button onClick={()=>{if(window.confirm('Effacer tous les brouillons locaux ? Aucun ticket GitHub ne sera supprimé.'))onClear();}}>Tout effacer</button>}</div>
    <p className="autoInboxDescription">Brouillons privés sur ton téléphone. Aucune soumission sans ton intervention.</p>
    {drafts.length===0&&<div className="autoEmpty">Aucune anomalie détectée sur cet appareil.</div>}
    {drafts.map(item=>{const linked=linkForDraft(item,issues);return <article className="autoDraft" key={item.id}>
      <div className="autoDraftTop"><span>{linked?'Correctif en échec · ticket #'+linked.number:'Non soumis'} · {item.category}</span><time>{new Date(item.lastSeen).toLocaleString('fr-FR')}</time></div>
      <strong>{item.title}</strong>
      <p>{item.details.slice(0,300)}</p>
      <div className="autoDraftContext">{item.context.actor} · {item.context.discipline} · {item.context.technique}{item.occurrences>1?' · '+item.occurrences+' occurrences':''}</div>
      <div className="autoDraftActions"><a href={linked?.html_url??autoIssueURL(item)} target="_blank" rel="noopener noreferrer">{linked?'Reprendre le ticket en échec ↗':'Examiner et soumettre sur GitHub ↗'}</a><button onClick={()=>onDismiss(item.id)}>Écarter</button></div>
    </article>})}
   </section>
   <h3 className="trackerIssuesHeader">Tickets enregistrés sur GitHub</h3>
   {!loading&&!error&&!issues.length&&<div className="trackerEmpty"><strong>Aucun ticket encore enregistré</strong><p>Les brouillons ne deviennent des tickets qu'après ta confirmation sur GitHub.</p></div>}
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
  <div className="trackerBottom">Les brouillons ne sont pas des tickets enregistrés. Progression : étapes validées, puis 100 % à la clôture. Aucune correction automatique.</div>
 </section>;
}
