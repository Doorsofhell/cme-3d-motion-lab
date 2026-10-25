import {useMemo,useState} from 'react';
import {CME_APP_VERSION} from './buildInfo';
import './RoadmapPanel.css';

export type RoadmapStatus='Livré'|'En cours'|'À faire'|'Bloqué'|'À vérifier';
export type RoadmapItem={id:string;title:string;area:string;status:RoadmapStatus;version:string;detail:string;priority:'P0'|'P1'|'P2';reference?:string};
/** Inventaire produit versionné dans Git : statut déclaré, pas synchronisation GitHub temps réel. */
export const roadmap:RoadmapItem[]=[
 {id:'UX-01',title:'Quatre destinations et navigation mobile unique',area:'Interface',status:'Livré',version:'0.7.27',priority:'P0',detail:'Studio, Galerie Coachs, Comparatif et Plus.'},
 {id:'UX-02',title:'Composants communs plein écran et caméra',area:'Interface',status:'Livré',version:'0.7.29',priority:'P0',detail:'Contrôles mutualisés ; ergonomie physique Android à confirmer.'},
 {id:'UX-03',title:'Éliminer les conflits CSS et chevauchements Android',area:'Interface',status:'À vérifier',version:'0.7.31',priority:'P0',detail:'Recette visuelle sur plusieurs tailles et orientations Android.'},
 {id:'UX-04',title:'Feuille de route et statuts versionnés',area:'Pilotage',status:'Livré',version:'0.7.30',priority:'P0',detail:'Suivi embarqué, recherche, filtres et version cible ; état édité dans Git.'},
 {id:'UX-05',title:'Unifier Studio Création et Test sur une scène 3D',area:'Interface',status:'En cours',version:'0.8.0',priority:'P0',detail:'Supprimer les doublons de scènes sans perdre les techniques.'},
 {id:'3D-01',title:'Préserver Kadir et Amara GLB historiques',area:'Personnages',status:'Livré',version:'0.7.29',priority:'P0',detail:'Rig, poids de skinning et assets sources conservés.'},
 {id:'3D-02',title:'Morphologie réelle : épaules, taille, hanches, cuisses et poitrine',area:'Personnages',status:'En cours',version:'0.8.0',priority:'P0',detail:'Adapter uniquement les géométries supportées, vérifier face/profil/dos.'},
 {id:'3D-03',title:'Fessiers féminins indépendants des hanches',area:'Personnages',status:'À faire',version:'0.8.1',priority:'P0',detail:'Volume postérieur et raccord bassin/cuisse ; morph réel et non destructif.'},
 {id:'3D-04',title:'Visage, coiffures et détails anatomiques',area:'Personnages',status:'Bloqué',version:'0.9.0',priority:'P1',detail:'Dépend de morph targets ou nouveaux assets autorisés.'},
 {id:'3D-05',title:'Tenues et protections par discipline',area:'Personnages',status:'À vérifier',version:'0.8.1',priority:'P1',detail:'Contrôler les intersections sur toutes les variantes morphologiques.'},
 {id:'3D-06',title:'Naïra originale, riggée et habillée',area:'Personnages',status:'Bloqué',version:'1.0.0',priority:'P1',detail:'Modèle organique professionnel, droits et pipeline artistique nécessaires.'},
 {id:'GL-01',title:'Galerie, profils, portraits 3D et sauvegarde',area:'Galerie',status:'En cours',version:'0.8.0',priority:'P0',detail:'Migration non destructive, surnom, discipline initiale, taille et poids.'},
 {id:'MO-01',title:'Inventaire complet des six disciplines',area:'Biomécanique',status:'En cours',version:'0.8.0',priority:'P0',detail:'Techniques et enchaînements avec support et provenance vérifiables.'},
 {id:'MO-02',title:'Validation des appuis, rotations et contacts',area:'Biomécanique',status:'À faire',version:'0.9.0',priority:'P0',detail:'Mesures reproductibles et validation experte, sans captation vidéo.'},
 {id:'QA-01',title:'Tests CI, TypeScript et non-régression GLB',area:'Qualité',status:'Livré',version:'0.7.29',priority:'P0',detail:'Garde-fous automatisés existants ; couverture à renforcer.'},
 {id:'QA-02',title:'Mesures FPS et latence GLB sur Android',area:'Qualité',status:'À vérifier',version:'0.8.0',priority:'P0',detail:'p50/p95, mémoire si mesurable et récupération WebGL sur appareil physique.'},
 {id:'QA-03',title:'Stress tests sur tous les mouvements',area:'Qualité',status:'À faire',version:'0.9.0',priority:'P1',detail:'Matrice personnages, techniques, vitesses, styles et tenues.'},
 {id:'SH-01',title:'Package moteur indépendant de React',area:'Portabilité',status:'À faire',version:'0.9.0',priority:'P0',detail:'API de simulation stable sans interface ni stockage navigateur.'},
 {id:'SH-02',title:'Export/import complet des combattants',area:'Portabilité',status:'À faire',version:'1.0.0',priority:'P0',detail:'Manifest, assets, licences, checksums et test aller-retour.'},
 {id:'CO-01',title:'Comparatif CME/Shadow à données équivalentes',area:'Comparatif',status:'Bloqué',version:'1.0.0',priority:'P1',detail:'Aucune performance Shadow inventée ; protocole reproductible requis.'},
 {id:'REL-01',title:'Recette physique Android et validation 1.0',area:'Publication',status:'À faire',version:'1.0.0',priority:'P0',detail:'Tests visuels, accessibilité et performance avant annonce de la majeure.'}
];
const statuses:RoadmapStatus[]=['Livré','En cours','À vérifier','À faire','Bloqué'];
export function RoadmapPanel(){
 const [filter,setFilter]=useState('Tous');
 const [query,setQuery]=useState('');
 const [priority,setPriority]=useState('Toutes');
 const areas=useMemo(()=>['Tous',...new Set(roadmap.map(x=>x.area))],[]);
 const filtered=roadmap.filter(x=>(filter==='Tous'||x.area===filter||x.status===filter)&&(priority==='Toutes'||x.priority===priority)&&[x.title,x.detail,x.id,x.version].join(' ').toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')));
 const done=roadmap.filter(x=>x.status==='Livré').length;
 return <section className="roadmapPanel" aria-label="Feuille de route CME-3D">
  <header><small>PILOTAGE DES LIVRAISONS</small><h2>Feuille de route</h2><p>Version installée : <strong>v{CME_APP_VERSION}</strong> · {done} livrés sur {roadmap.length} chantiers suivis.</p><p>Statuts déclarés et versionnés avec le code, non synchronisés en temps réel avec GitHub. « Livré » désigne une fonctionnalité intégrée, pas une recette Android physique certifiée.</p></header>
  <div className="roadmapSummary">{statuses.map(status=><button type="button" key={status} onClick={()=>setFilter(x=>x===status?'Tous':status)} aria-pressed={filter===status}><strong>{roadmap.filter(x=>x.status===status).length}</strong><span>{status}</span></button>)}</div>
  <div className="roadmapFilters"><label>Rechercher<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Chantier, version, identifiant…"/></label><label>Domaine<select value={areas.includes(filter)?filter:'Tous'} onChange={e=>setFilter(e.target.value)}>{areas.map(x=><option key={x}>{x}</option>)}</select></label><label>Priorité<select value={priority} onChange={e=>setPriority(e.target.value)}><option>Toutes</option><option>P0</option><option>P1</option><option>P2</option></select></label></div>
  <p className="roadmapCount">{filtered.length} chantier(s) affiché(s) · prochaine majeure cible : 1.0.0</p>
  <div className="roadmapItems">{filtered.map(x=><article key={x.id} className="roadmapItem"><div className="roadmapItemHead"><strong>{x.title}</strong><span className="roadmapState">{x.status}</span></div><p>{x.detail}</p><div className="roadmapMeta"><span>{x.id} · {x.area}</span><span>{x.priority}</span><span>Version {x.version}</span></div></article>)}</div>
  <p className="roadmapFooter">Mise à jour des statuts à chaque livraison. Les versions futures sont des cibles prévisionnelles, pas des dates garanties. <a href="https://github.com/Doorsofhell/cme-3d-motion-lab/actions" target="_blank" rel="noreferrer">Vérifier les déploiements GitHub</a>.</p>
 </section>;
}
