import {useState} from 'react';
import {CME_APP_VERSION} from './buildInfo';
import {releases,preparatoryWork} from './releases';
const repo='https://github.com/Doorsofhell/cme-3d-motion-lab';
export function VersionsPanel(){
 const [expanded,setExpanded]=useState<string|null>(CME_APP_VERSION);
 return <section className="versionsPanel" aria-label="Historique des versions CME-3D">
  <header className="versionsHead"><h2>Historique des versions</h2><p>Version chargée : <strong>v{CME_APP_VERSION}</strong></p><p>Une fusion GitHub ne garantit pas que cette version soit déjà visible sur tous les navigateurs.</p>
   <div className="versionsLinks"><a href={repo+'/actions'} target="_blank" rel="noopener noreferrer">Déploiements GitHub ↗</a><a href={repo+'/commits/main'} target="_blank" rel="noopener noreferrer">Historique du code ↗</a></div>
  </header>
  <section className="versionPending" aria-label="Avancement Amara"><h3>Projet Amara · suivi d'avancement</h3><p><strong>Étape 1/5 — préparation du pipeline 3D</strong></p><progress value={1} max={5} style={{width:'100%',height:12}} aria-label="Avancement du projet Amara"/><ol><li>Direction artistique : définie</li><li>Contrôle des fichiers GLB : mis en place</li><li>Sculpture du nouveau corps : à réaliser</li><li>Rigging, vêtements et animation : à réaliser</li><li>Tests visuels des trois rendus et publication : à réaliser</li></ol><p>Ce suivi est une photographie des étapes livrées avec cette version, et non un statut GitHub temps réel.</p></section>
  <section className="versionPending"><h3>En préparation · non livré dans le moteur 3D</h3><strong>{preparatoryWork.title}</strong><ul>{preparatoryWork.items.map(x=><li key={x}>{x}</li>)}</ul><a href={repo+'/pull/'+preparatoryWork.pr} target="_blank" rel="noopener noreferrer">Voir la PR #{preparatoryWork.pr} ↗</a></section>
  <div className="versionsList">{releases.map(r=><article className="versionEntry" key={r.version}>
   <button className="versionToggle" onClick={()=>setExpanded(x=>x===r.version?null:r.version)} aria-expanded={expanded===r.version}>
    <span><strong>v{r.version}</strong> <small>{r.date} · {r.kind}</small><span className="versionTitle">{r.title}</span></span><span aria-hidden="true">{expanded===r.version?'−':'+'}</span>
   </button>
   {expanded===r.version&&<div className="versionDetails"><ul>{r.items.map(item=><li key={item}>{item}</li>)}</ul>{r.note&&<p>{r.note}</p>}{r.pr&&<a href={repo+'/pull/'+r.pr} target="_blank" rel="noopener noreferrer">PR #{r.pr} ↗</a>}</div>}
  </article>)}</div>
  <p className="versionsFootnote">Les dates antérieures et les statuts de déploiement ne sont pas inventés. La version affichée en haut correspond au code réellement chargé dans ce navigateur.</p>
 </section>;
}
