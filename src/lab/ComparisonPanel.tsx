import {useEffect,useState,type ChangeEvent} from 'react';
import type {RigReport} from './App';
import {CME_APP_VERSION} from './buildInfo';
interface Metrics{fps:number;drawCalls:number;triangles:number;textures:number;geometries:number;webgl:string;dpr:number}
interface Props{
 metrics:Metrics;report:RigReport|null;snapshot:string|null;
 actor:string;discipline:string;technique:string;renderStyle:string;
 onOpenLab:()=>void;onCopyReport:()=>void;
}
export function ComparisonPanel({metrics,report,snapshot,actor,discipline,technique,renderStyle,onOpenLab,onCopyReport}:Props){
 const [reference,setReference]=useState<string|null>(null);
 const [filename,setFilename]=useState('');
 const [note,setNote]=useState('');
 const [view,setView]=useState<'images'|'method'>('images');
 useEffect(()=>()=>{if(reference)URL.revokeObjectURL(reference);},[reference]);
 const upload=(e:ChangeEvent<HTMLInputElement>)=>{
  const file=e.target.files?.[0];
  if(!file)return;
  if(!file.type.startsWith('image/')||file.size>15_000_000){setNote('Sélectionne une image PNG/JPEG de moins de 15 Mo.');return;}
  const url=URL.createObjectURL(file);
  setReference(old=>{if(old)URL.revokeObjectURL(old);return url;});
  setFilename(file.name);setNote('Image de référence chargée localement, sans envoi à un serveur.');
 };
 return <section className="engineComparison" aria-label="Comparatif moteur 3D CME et Shadow Studio">
  <div className="comparisonHead"><div><strong>Comparatif 3D</strong><small>Même coach, même technique et même pose pour comparer les rendus.</small></div><div className="comparisonSwitch"><button className={view==='images'?'active':''} onClick={()=>setView('images')}>Visuel</button><button className={view==='method'?'active':''} onClick={()=>setView('method')}>Mesures</button></div></div>
  {view==='images'?<>
    <div className="comparisonMedia">
     <div className="comparisonFrame"><strong>CME-3D · v{CME_APP_VERSION}</strong>{snapshot?<img src={snapshot} alt="Capture du combattant CME-3D"/>:<div className="comparisonPlaceholder">Aucune capture enregistrée<button onClick={onOpenLab}>Retourner au laboratoire</button></div>}<small>{actor} · {discipline} · {technique} · {renderStyle}</small></div>
     <div className="comparisonFrame"><strong>Shadow Studio · Référence</strong>{reference?<img src={reference} alt="Capture Shadow Studio choisie par l'utilisateur"/>:<div className="comparisonPlaceholder">Importe une capture du même geste, au même instant.</div>}<label className="comparisonUpload">Importer image<input aria-label="Importer une capture Shadow Studio" type="file" accept="image/png,image/jpeg,image/webp" onChange={upload}/></label><small>{filename||'Aucune donnée du moteur importée'}</small></div>
    </div>
    <p className="comparisonNote">{note||'Deux captures visibles côte à côte ; le moteur de référence n’est ni lancé, ni modifié depuis CME-3D.'}</p>
  </>:<>
   <table className="comparisonTable"><thead><tr><th>Mesure</th><th>CME-3D</th><th>Shadow Studio</th></tr></thead><tbody>
     <tr><td>Fréquence actuelle</td><td>{metrics.fps||'–'} FPS</td><td>Non mesurée</td></tr>
     <tr><td>API de rendu</td><td>{metrics.webgl}</td><td>Non mesurée</td></tr>
     <tr><td>Triangles</td><td>{metrics.triangles.toLocaleString('fr-FR')}</td><td>Non mesuré</td></tr>
     <tr><td>Appels GPU</td><td>{metrics.drawCalls}</td><td>Non mesuré</td></tr>
     <tr><td>Articulations</td><td>{report?.bones??'–'}</td><td>Non mesuré</td></tr>
     <tr><td>Animation de la technique</td><td>{report?.techniqueFound?'Disponible':'Non résolue'}</td><td>À tester</td></tr>
     <tr><td>Validation biomécanique</td><td>En cours</td><td>Non évaluée</td></tr>
    </tbody></table>
   <p className="comparisonNote">Les FPS CME sont mesurés pendant l'usage de CME-3D, pas dans les mêmes conditions sur l’autre moteur. Ce tableau ne prétend pas établir une supériorité objective.</p>
  </>}
  <div className="comparisonActions"><button onClick={onOpenLab}>↶ Tester dans CME-3D</button><button onClick={onCopyReport}>Copier diagnostics CME</button></div>
 </section>;
}
