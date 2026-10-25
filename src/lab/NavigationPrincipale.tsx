import type {ReactNode} from 'react';

/** Barre principale unique de CME-3D : quatre destinations stables. */
export type DestinationPrincipale='studio'|'lab'|'gallery'|'other';
const destinations:readonly {id:DestinationPrincipale;libelle:string;icone:ReactNode}[]=[
 {id:'studio',libelle:'Studio Coach',icone:<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3M8 18h8"/></svg>},
 {id:'lab',libelle:'Mouvements',icone:<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7zM4 5v14"/></svg>},
 {id:'gallery',libelle:'Galerie',icone:<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m4 18 6-5 4 3 3-4 4 4"/></svg>},
 {id:'other',libelle:'Plus',icone:<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>}
];
export const NAVIGATION_PRINCIPALE=destinations.map(({id,libelle})=>({id,libelle}));
export function NavigationPrincipale({actif,ouvrir}:{actif:DestinationPrincipale;ouvrir:(destination:DestinationPrincipale)=>void}){
 return <nav className="labTabs cmeNavigationPrincipale" aria-label="Navigation principale CME-3D">
  {destinations.map(destination=><button type="button" key={destination.id}
   className={actif===destination.id?'selected':''}
   aria-current={actif===destination.id?'page':undefined}
   aria-label={destination.libelle} onClick={()=>ouvrir(destination.id)}>
   {destination.icone}<span>{destination.libelle}</span>
  </button>)}
 </nav>;
}
