import {useRef,type CSSProperties} from 'react';

export type PrecisionTone='cyan'|'rouge'|'orange';
type Props={label:string;valeur:number;minimum:number;maximum:number;defaut?:number;actif?:boolean;couleur?:PrecisionTone;affichage?:string;changer:(v:number)=>void;indisponible?:string};
const valeurParDefaut=(n:number,d:number)=>`${n>d?'+':''}${Math.round((n-d)*100)} %`;
/** Curseur numérique réel. Haptique discrète au franchissement du neutre ;
 * ne dépend d'aucun suivi, capteur ou caméra. */
export function PrecisionSlider({label,valeur,minimum,maximum,defaut=1,actif=true,couleur='cyan',affichage,changer,indisponible='Déformation indisponible sur ce modèle GLB'}:Props){
 const precedent=useRef(valeur);
 const modifier=(v:number)=>{
  if(!actif)return;
  const a=precedent.current;precedent.current=v;
  if(a!==v&&((a<defaut&&v>=defaut)||(a>defaut&&v<=defaut))&&typeof navigator!=='undefined'&&typeof navigator.vibrate==='function'){
   try{navigator.vibrate(8);}catch{/* Retour haptique facultatif. */}
  }
  changer(v);
 };
 const n=Math.min(maximum,Math.max(minimum,valeur));
 const progress=Math.max(0,Math.min(100,100*(n-minimum)/(maximum-minimum)));
 return <label className={`sculptorPrecision sculptorPrecision--${couleur}`+(actif?'':' sculptorPrecision--inactive')}>
   <span className="sculptorPrecisionTitle">{label}</span>
   <span className="sculptorPrecisionRow">
    <input type="range" min={minimum} max={maximum} step=".01" value={n} disabled={!actif}
      aria-label={label} aria-valuetext={affichage??valeurParDefaut(valeur,defaut)}
      onChange={e=>modifier(Number(e.currentTarget.value))}
      style={{'--precision-progress':`${progress}%`} as CSSProperties}/>
    <output className="sculptorPrecisionValue">{affichage??valeurParDefaut(valeur,defaut)}</output>
   </span>
   {!actif&&<small className="sculptorPrecisionUnavailable">{indisponible}</small>}
 </label>;
}
