import {Suspense,type ReactNode} from 'react';
import {OrbitControls,useProgress} from '@react-three/drei';
import './SceneControls.css';
import {CameraPedagogique} from './CameraPedagogique';

/** Commandes caméra partagées par toutes les scènes 3D. */
export function SceneCameraControls({automatic=false,motion='',target=[0,1,0],minDistance=.5,maxDistance=80}:{automatic?:boolean;motion?:string;target?:[number,number,number];minDistance?:number;maxDistance?:number}){
 return automatic?<CameraPedagogique mouvement={motion} active/>:<OrbitControls makeDefault target={target} enablePan={false} minDistance={minDistance} maxDistance={maxDistance}/>;
}
export function SceneCameraButton({automatic,onToggle}:{automatic:boolean;onToggle:()=>void}){
 return <button type="button" className="cmeCameraAuto" aria-label={automatic?'Activer la caméra libre':'Activer la caméra pédagogique'} title="Mode caméra" aria-pressed={automatic} onClick={onToggle}>◉ {automatic?'Auto':'Libre'}</button>;
}
/** Un état de chargement explicite, réutilisable par les scènes GLB. */
export function SceneLoadingBoundary({children,label='Chargement du modèle 3D…'}:{children:ReactNode;label?:string}){
 return <Suspense fallback={<group name={label}/>}>{children}</Suspense>;
}

/** Barre de commandes unique, responsive et sans chevauchement sur Android. */
export function SceneToolbar({children,actions,variant='lab'}:{children?:ReactNode;actions:ReactNode;variant?:'lab'|'studio'}){
 return <div className={`cmeSceneToolbar cmeSceneToolbar--${variant}`} role="group" aria-label="Commandes de la scène 3D" onDoubleClick={e=>e.stopPropagation()} onTouchEnd={e=>e.stopPropagation()}>
  {children&&<div className="cmeSceneToolbarModes">{children}</div>}
  <div className="cmeSceneToolbarActions">{actions}</div>
 </div>;
}

/** Indicateur visible pendant le chargement réseau des modèles GLB. */
export function SceneLoadingIndicator(){
 const {active,progress}=useProgress();
 if(!active)return null;
 return <div className="cmeSceneLoading" role="status" aria-live="polite">Chargement du modèle 3D · {Math.round(progress)} %</div>;
}
