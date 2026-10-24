import {Suspense,type ReactNode} from 'react';
import {OrbitControls} from '@react-three/drei';
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
