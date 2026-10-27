import type {ShapeKey} from './visualShapePresets';
import {activeShapeGroups} from './visualShapePresets';
import type {SculptorRegion} from './sculptorRegions';
import {MorphThumbnail} from './MorphThumbnail';

type Props={
 region:SculptorRegion|null;
 sex:'homme'|'femme';
 valeur:number;
 disponible:boolean;
 onChoisir:(cle:ShapeKey|'height',valeur:number)=>void;
};
/** Palette indépendante du Canvas 3D : aucun bouton ne masque le coach.
 * Les préréglages sont uniquement ceux pris en charge par le véritable GLB.
 * Le rail vertical défile sous le doigt ; sélectionner applique immédiatement.
 */
export function SculptorFloatingPresets({region,sex,valeur,disponible,onChoisir}:Props){
 if(!region)return <aside className="sculptorFloatingPresets" aria-label="Formes prédéfinies"><span className="sculptorFloatingHint">Choisir une zone</span></aside>;
 const cle=region.forme;
 const group=cle&&cle!=='height'?activeShapeGroups(sex).find(item=>item.id===cle):null;
 const presets=cle==='height'?[
  {id:'height-petit',label:'Compact',value:.9},
  {id:'height-neutre',label:'Naturel',value:1},
  {id:'height-grand',label:'Grand',value:1.1}
 ]:group?.presets??[];
 const possible=!!cle&&disponible&&presets.length>0;
 return <aside className="sculptorFloatingPresets" aria-label={'Formes prédéfinies : '+region.libelle}>
   <header className="sculptorFloatingHead"><strong>{region.libelle}</strong><small>Formes</small></header>
   {possible?
    <div className="sculptorFloatingList" role="group" aria-label={'Choisir une forme pour '+region.libelle}>
      {presets.map(form=><button key={form.id} type="button"
        className={'sculptorFloatingPreset'+(Math.abs(valeur-form.value)<.005?' is-active':'')}
        aria-label={region.libelle+' : '+form.label}
        aria-pressed={Math.abs(valeur-form.value)<.005}
        onClick={()=>onChoisir(cle,form.value)}>
        {cle==='height'?<span className="sculptorPresetHeight" aria-hidden="true">{form.value===1?'│':form.value<1?'⌄':'⌃'}</span>:
          <MorphThumbnail part={cle as ShapeKey} value={form.value}/>}
        <span>{form.label}</span>
      </button>)}
    </div>:
    <div className="sculptorFloatingUnavailable" role="status">
     {cle&&!disponible?'Modèle GLB sans déformation compatible.':
      'Aucune forme 3D dédiée : utiliser les couleurs ou équipements du panneau inférieur.'}
    </div>
   }
 </aside>;
}
