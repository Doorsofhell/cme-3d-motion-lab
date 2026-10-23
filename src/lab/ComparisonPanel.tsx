import {useCallback,useEffect,useState} from 'react';
import type {RigReport} from './App';
import {CME_APP_VERSION} from './buildInfo';
import techniques from './techniques.json';
import sequences from './complexSequences.json';

interface Metrics{fps:number;drawCalls:number;triangles:number;textures:number;geometries:number;webgl:string;dpr:number}
interface Props{metrics:Metrics;report:RigReport|null;snapshot:string|null;actor:string;discipline:string;technique:string;renderStyle:string;onOpenLab:()=>void;onCopyReport:()=>void}
type Source={version:string;sizeKB:number;threeDeps:number;commit:string;updated:string;url:string};
const repositories={cme:'Doorsofhell/cme-3d-motion-lab',shadow:'Doorsofhell/combat-shadow-studio'};
async function readVerified(repo:string,signal:AbortSignal):Promise<Source>{
 const headers={Accept:'application/vnd.github+json'};
 const [metadata,packageResponse,commitResponse]=await Promise.all([
  fetch('https://api.github.com/repos/'+repo,{headers,signal,cache:'no-store'}),
  fetch('https://raw.githubusercontent.com/'+repo+'/main/package.json?ts='+Date.now(),{signal,cache:'no-store'}),
  fetch('https://api.github.com/repos/'+repo+'/commits/main',{headers,signal,cache:'no-store'})
 ]);
 if(!metadata.ok||!packageResponse.ok||!commitResponse.ok)throw Error('Source GitHub indisponible ou limitée');
 const info=await metadata.json(),pkg=await packageResponse.json(),commit=await commitResponse.json();
 if(typeof pkg.version!=='string'||typeof info.size!=='number'||typeof commit.sha!=='string')throw Error('Source GitHub incomplète');
 const dependencies={...pkg.dependencies,...pkg.devDependencies};
 const threeDeps=Object.keys(dependencies).filter(k=>k==='three'||k==='@react-three/fiber'||k==='@react-three/drei').length;
 return {version:pkg.version,sizeKB:info.size,threeDeps,commit:commit.sha.slice(0,8),updated:commit.commit?.committer?.date||'',url:'https://github.com/'+repo+'/commit/'+commit.sha};
}
export function ComparisonPanel({metrics,report,onOpenLab,onCopyReport}:Props){
 const [sources,setSources]=useState<{cme:Source;shadow:Source}|null>(null);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const refresh=useCallback(async(signal:AbortSignal)=>{
  setLoading(true);setError('');
  try{
   const [cme,shadow]=await Promise.all([readVerified(repositories.cme,signal),readVerified(repositories.shadow,signal)]);
   if(!signal.aborted)setSources({cme,shadow});
  }catch(e){if(!signal.aborted){setSources(null);setError(e instanceof Error?e.message:'Erreur de lecture GitHub');}}
  finally{if(!signal.aborted)setLoading(false);}
 },[]);
 useEffect(()=>{const controller=new AbortController();void refresh(controller.signal);return()=>controller.abort();},[refresh]);
 const currentCme=sources?.cme;
 const currentShadow=sources?.shadow;
 const rows=[
  ['Version GitHub',currentCme?.version??'—',currentShadow?.version??'—'],
  ['Taille du dépôt (Ko, GitHub)',currentCme?.sizeKB.toLocaleString('fr-FR')??'—',currentShadow?.sizeKB.toLocaleString('fr-FR')??'—'],
  ['Dépendances 3D principales',currentCme?.threeDeps??'—',currentShadow?.threeDeps??'—'],
  ['FPS mesurés sur cet appareil',metrics.fps>0?metrics.fps:'—','—'],
  ['Triangles rendus',metrics.triangles>0?metrics.triangles:'—','—'],
  ['Appels de rendu',metrics.drawCalls>0?metrics.drawCalls:'—','—'],
  ['Os du modèle actif',report?.bones??'—','—'],
  ['Techniques cataloguées',techniques.length,'—'],
  ['Séquences cataloguées',sequences.length,'—']
 ];
 return <section className="engineComparison" aria-label="Comparatif chiffré des moteurs 3D">
  <div className="comparisonHead"><div><strong>Comparatif moteurs 3D</strong><small>Données GitHub vérifiées à chaque ouverture · CME-3D v{CME_APP_VERSION}</small></div><button onClick={()=>{const controller=new AbortController();void refresh(controller.signal);}} disabled={loading}>{loading?'Actualisation…':'↻ Actualiser'}</button></div>
  {error&&<p role="alert" className="comparisonNote">Source non vérifiable : {error}. Aucune valeur de substitution.</p>}
  <table className="comparisonTable"><thead><tr><th>Indicateur</th><th>CME-3D</th><th>Shadow Studio</th></tr></thead><tbody>
  {rows.map(([name,cme,shadow])=><tr key={String(name)}><td>{name}</td><td>{cme}</td><td>{shadow}</td></tr>)}
  <tr><td>Révision vérifiée</td><td>{currentCme?<a href={currentCme.url} target="_blank" rel="noreferrer">{currentCme.commit}</a>:'—'}</td><td>{currentShadow?<a href={currentShadow.url} target="_blank" rel="noreferrer">{currentShadow.commit}</a>:'—'}</td></tr>
  </tbody></table>
  <div className="comparisonNote"><strong>Appréciation :</strong> {sources?'Sources vérifiées. Comparaison de structure disponible ; supériorité 3D non déterminable sans benchmark identique sur les deux moteurs.':'Données externes non vérifiées : appréciation suspendue.'}</div>
  <p className="comparisonNote">Source : <a href="https://github.com/Doorsofhell/cme-3d-motion-lab" target="_blank" rel="noreferrer">CME-3D</a> · <a href="https://github.com/Doorsofhell/combat-shadow-studio" target="_blank" rel="noreferrer">Shadow Studio</a>. Les mesures de rendu concernent CME-3D uniquement ; « — » signifie non mesuré. Taille du dépôt ≠ performance.</p>
  <div className="comparisonActions"><button onClick={onOpenLab}>↶ Laboratoire</button><button onClick={onCopyReport}>Copier diagnostics</button></div>
 </section>;
}
