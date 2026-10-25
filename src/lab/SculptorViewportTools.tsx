import type {AnatomicalView} from './AnatomicalReference';
type Props={vue:AnatomicalView|null;filDeFer:boolean;disponible:boolean;choisirVue:(v:AnatomicalView)=>void;retablir:()=>void;changerFilDeFer:()=>void};
function Pictogramme({nom}:{nom:'face'|'profil'|'reset'|'wire'}){
 const paths={face:<><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4v16"/></>,profil:<path d="m8 3 7 2 4 6-3 4-4 1v5H7v-7l-2-2 3-4z"/>,reset:<><path d="M4 10a8 8 0 1 1 2 8"/><path d="M4 4v6h6"/></>,wire:<><path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10"/></>};
 return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[nom]}</svg>;
}
/** Rail caméra séparé du Canvas : aucun outil au-dessus du mannequin. */
export function SculptorViewportTools({vue,filDeFer,disponible,choisirVue,retablir,changerFilDeFer}:Props){
 return <nav className="sculptorViewportTools" aria-label="Caméra et maillage">
  <button type="button" title="Vue de face" aria-label="Vue de face" aria-pressed={vue==='face'} onClick={()=>choisirVue('face')}><Pictogramme nom="face"/></button>
  <button type="button" title="Profil droit" aria-label="Profil droit" aria-pressed={vue==='profil-droit'} onClick={()=>choisirVue('profil-droit')}><Pictogramme nom="profil"/></button>
  <button type="button" title="Recentrer la caméra" aria-label="Recentrer la caméra" onClick={retablir}><Pictogramme nom="reset"/></button>
  <button type="button" title={disponible?'Afficher le vrai maillage':'Maillage non chargé'} aria-label="Fil de fer du modèle chargé" aria-pressed={filDeFer} disabled={!disponible} onClick={changerFilDeFer}><Pictogramme nom="wire"/></button>
 </nav>;
}
