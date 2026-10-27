import {LAB_DISCIPLINES,type LabDiscipline} from './NeutralRig';
import type {Handedness} from './coachProportions';
import './CoachProfileEditor.css';

export type CoachIdentityInput={
 name:string;nickname:string;heightCm:string;weightKg:string;handedness:Handedness;nicknameVariant:number;
};
type Props={
 identite:CoachIdentityInput;
 discipline:LabDiscipline;
 onIdentity:(change:Partial<CoachIdentityInput>)=>void;
 onDiscipline:(discipline:LabDiscipline)=>void;
 onGenerateNickname:()=>void;
};
const NOMS:Record<LabDiscipline,string>={boxing:'Boxe anglaise',kickboxing:'Kick-boxing',muaythai:'Muay-thaï',mma:'MMA',bjj:'JJB',judo:'Judo'};

/** Éditeur compact, intégré au panneau anatomique, sans fenêtre bloquante.
 * Taille et poids alimentent resolvedProportions ; discipline et identité sont
 * persistées avec le même profil que les morphologies.
 */
export function CoachProfileEditor({identite,discipline,onIdentity,onDiscipline,onGenerateNickname}:Props){
 return <details className="sculptorProfile" aria-label="Profil du coach">
  <summary>
   <span className="sculptorProfileName">{identite.name.trim()||'Nom du coach'}</span>
   <span className="sculptorProfileBrief">{identite.nickname.trim()||'Surnom'} · {identite.heightCm||'—'} cm · {identite.weightKg||'—'} kg · {NOMS[discipline]}</span>
   <span className="sculptorProfileChevron" aria-hidden="true">▾</span>
  </summary>
  <div className="sculptorProfileFields">
   <label>Nom <input aria-label="Nom du coach" maxLength={60} value={identite.name}
     placeholder="Nom du combattant" onChange={e=>onIdentity({name:e.currentTarget.value})}/></label>
   <label>Surnom <input aria-label="Surnom du combattant" maxLength={60} value={identite.nickname}
     placeholder="Surnom sportif" onChange={e=>onIdentity({nickname:e.currentTarget.value})}/></label>
   <label>Taille (cm) <input aria-label="Taille en centimètres" type="number" min={100} max={250}
     value={identite.heightCm} onChange={e=>onIdentity({heightCm:e.currentTarget.value})}/></label>
   <label>Poids (kg) <input aria-label="Poids en kilogrammes" type="number" min={25} max={300} step={.1}
     value={identite.weightKg} onChange={e=>onIdentity({weightKg:e.currentTarget.value})}/></label>
   <label>Discipline phare <select aria-label="Discipline phare" value={discipline}
     onChange={e=>onDiscipline(e.currentTarget.value as LabDiscipline)}>
     {LAB_DISCIPLINES.map(id=><option key={id} value={id}>{NOMS[id]}</option>)}
   </select></label>
   <label>Main dominante <select aria-label="Main dominante" value={identite.handedness}
     onChange={e=>onIdentity({handedness:e.currentTarget.value as Handedness})}>
     <option value="right">Droitier</option><option value="left">Gaucher</option>
   </select></label>
   <button type="button" className="sculptorNicknameButton" onClick={onGenerateNickname}>Créer un surnom sportif</button>
  </div>
  <small>La taille et le poids modifient les proportions possibles du GLB. La discipline phare sélectionne la tenue sportive et le contexte d'animation, sans changer les mouvements canoniques.</small>
 </details>;
}
