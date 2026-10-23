import {useCallback,useEffect,useRef,useState} from 'react';
import type {TestContext} from './Issues';
import {correlationId} from './SessionReport';
import {ID_MARKER} from './IssueLinks';

export type AutoCategory='javascript'|'promise'|'asset'|'webgl'|'loading'|'motion'|'performance';
export interface AutoIncident {
 id:string;fingerprint:string;category:AutoCategory;title:string;details:string;
 context:TestContext;firstSeen:string;lastSeen:string;occurrences:number;
}
const KEY='cme3d:auto-incidents:v1';
const LIMIT=40;
const DUPLICATE_INTERVAL=60_000;
export const ISSUE_MARKER='<!-- CME3D_INCIDENT -->';
const KEYWORDS:Record<AutoCategory,string>={
 javascript:'JavaScript',promise:'Promesse rejetée',asset:'Ressource inaccessible',
 webgl:'WebGL',loading:'Chargement 3D',motion:'Animation',performance:'Performance'
};
function cap(input:string,limit:number){return input.trim().slice(0,limit);}
export function incidentFingerprint(category:AutoCategory,details:string,context:TestContext):string{
 // Group repeated stack traces / resource failures from the same movement and outfit.
 const signature=details.replace(/https?:\/\/[^\s]+/g,match=>{try{return new URL(match).pathname;}catch{return match;}})
 .replace(/:\d+:\d+/g,':#:#').replace(/\s+/g,' ').slice(0,170);
 return [category,context.actor,context.discipline,context.outfit,context.technique,signature].join('|');
}
export function registerIncident(items:AutoIncident[],input:Pick<AutoIncident,'category'|'title'|'details'|'context'>,time:string):AutoIncident[]{
 const fingerprint=incidentFingerprint(input.category,input.details,input.context);
 const index=items.findIndex(x=>x.fingerprint===fingerprint);
 if(index>=0){
  const previous=items[index];
  if(Date.parse(time)-Date.parse(previous.lastSeen)<DUPLICATE_INTERVAL)return items;
  return [{...previous,lastSeen:time,occurrences:previous.occurrences+1},...items.filter((_,i)=>i!==index)];
 }
 return [{...input,fingerprint,id:time+'-'+Math.random().toString(36).slice(2,9),
  firstSeen:time,lastSeen:time,occurrences:1},...items].slice(0,LIMIT);
}
function initial():AutoIncident[]{
 try{
  const data=JSON.parse(localStorage.getItem(KEY)||'[]') as unknown;
  if(!Array.isArray(data))return [];
  return data.filter((x):x is AutoIncident=>!!x&&typeof x==='object'&&typeof x.id==='string'&&typeof x.fingerprint==='string'&&typeof x.title==='string'&&typeof x.details==='string'&&!!x.context).slice(0,LIMIT);
 }catch{return [];}
}
export function autoIssueURL(item:AutoIncident):string{
 const url=new URL('https://github.com/Doorsofhell/cme-3d-motion-lab/issues/new');
 const details=cap(item.details,1400);
 const trackingKey=correlationId(item.fingerprint);
 const context=item.context;
 const body=[
 ISSUE_MARKER,ID_MARKER+trackingKey,'## Anomalie détectée automatiquement','',
 '- Référence de suivi : '+trackingKey,
 '- Catégorie : '+KEYWORDS[item.category],
 '- Première détection : '+item.firstSeen,
 '- Dernière détection : '+item.lastSeen,
 '- Occurrences : '+item.occurrences,
 '- Coach : '+context.actor,
 '- Discipline : '+context.discipline,
 '- Tenue : '+context.outfit,
 '- Technique : '+context.technique,
 '- Rendu : '+context.renderStyle,
 '- Qualité : '+context.quality,
 '- Navigateur : '+cap(context.userAgent,350),
 '',
 '## Constat automatique',details,'',
 '## Diagnostic technique','~~~',cap(context.diagnostics,1000),'~~~','',
 '## Résultat attendu',
 'Identifier la cause réelle et corriger l’anomalie après reproduction. Vérifier le résultat sur Android.',
 '',
 '## Étapes de traitement (à valider par le développement)',
 '- [ ] Reproduction de l’incident',
 '- [ ] Diagnostic confirmé',
 '- [ ] Correctif intégré',
 '- [ ] Tests et vérification',
 '','Cette demande est un brouillon local généré automatiquement. Soumission manuelle nécessaire.'
 ].join('\n');
 url.searchParams.set('title','[CME-3D] '+cap(item.title,105));
 url.searchParams.set('body',body);
 return url.toString();
}
export function useAutoIncidentQueue(context:TestContext,onLog:(s:string)=>void){
 const [items,setItems]=useState<AutoIncident[]>(initial);
 const queueRef=useRef(items);
 queueRef.current=items;
 const latestContext=useRef(context);
 latestContext.current=context;
 const latestLog=useRef(onLog);
 latestLog.current=onLog;
 const record=useCallback((category:AutoCategory,title:string,detail:string)=>{
  const description=cap(detail||title,1800);
  if(!description)return;
  const payload={category,title:cap(title,125),details:description,context:structuredClone(latestContext.current)};
  const updated=registerIncident(queueRef.current,payload,new Date().toISOString());
  if(updated===queueRef.current)return;
  queueRef.current=updated;
  setItems(updated);
  latestLog.current('Signalement automatique : '+title);
 },[]);
 useEffect(()=>{
  try{localStorage.setItem(KEY,JSON.stringify(items));}catch{/* private or storage full */}
 },[items]);
 const dismiss=useCallback((id:string)=>setItems(previous=>previous.filter(x=>x.id!==id)),[]);
 const clear=useCallback(()=>setItems([]),[]);
 useEffect(()=>{
  function onError(event:Event){
   if(event instanceof ErrorEvent){
    const text=[event.message,event.filename&&'Source : '+event.filename,event.error?.stack&&String(event.error.stack).slice(0,550)].filter(Boolean).join('\n');
    record('javascript','Erreur JavaScript',text||'Erreur JavaScript sans détails');
    return;
   }
   const target=event.target;
   if(target instanceof HTMLScriptElement||target instanceof HTMLLinkElement||target instanceof HTMLImageElement){
    const source=target instanceof HTMLLinkElement?target.href:target.src;
    record('asset','Échec de chargement d’une ressource',source||'URL inconnue');
   }
  }
  function onRejection(event:PromiseRejectionEvent){
   record('promise','Promesse JavaScript rejetée',String(event.reason?.stack||event.reason||'Rejet sans raison'));
  }
  window.addEventListener('error',onError,true);
  window.addEventListener('unhandledrejection',onRejection);
  return()=>{window.removeEventListener('error',onError,true);window.removeEventListener('unhandledrejection',onRejection);};
 },[record]);
 return {items,record,dismiss,clear};
}
