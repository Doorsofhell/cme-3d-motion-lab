import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group} from 'three';

/** Mannequin de secours autonome : aucun chargement GLB, texture ou squelette externe.
 * Il garantit un sujet 3D visible pendant le diagnostic des assets Android.
 * Les gestes sont des démonstrations simplifiées, pas des mouvements biomécaniques validés.
 */
export function MannequinAutonome({sex,playing,proportions}:{sex:'homme'|'femme';playing:boolean;proportions:{height:number;shoulders:number;muscle:number;waist:number}}){
 const brasG=useRef<Group>(null),brasD=useRef<Group>(null);
 const jambesG=useRef<Group>(null),jambesD=useRef<Group>(null);
 const temps=useRef(0);
 useFrame((_,delta)=>{
  if(playing)temps.current+=Math.min(delta,.05);
  const mouvement=Math.sin(temps.current*1.8);
  if(brasG.current)brasG.current.rotation.x=-.22+mouvement*.18;
  if(brasD.current)brasD.current.rotation.x=-.22-mouvement*.18;
  if(jambesG.current)jambesG.current.rotation.x=mouvement*.12;
  if(jambesD.current)jambesD.current.rotation.x=-mouvement*.12;
 });
 const largeur=sex==='femme'?.91:1;
 const mat={color:'#a7abb2',roughness:.87,metalness:0};
 return <group scale={[proportions.height,proportions.height,proportions.height]}>
  <mesh position={[0,.98,0]} scale={[proportions.waist*.27,.23,.16]}><sphereGeometry args={[1,18,12]}/><meshStandardMaterial {...mat}/></mesh>
  <mesh position={[0,1.29,0]} scale={[proportions.shoulders*.35*largeur,.37,proportions.muscle*.19]}><sphereGeometry args={[1,24,16]}/><meshStandardMaterial {...mat}/></mesh>
  <mesh position={[0,1.65,0]} scale={[.075,.11,.075]}><sphereGeometry args={[1,14,10]}/><meshStandardMaterial {...mat}/></mesh>
  <mesh position={[0,1.81,0]} scale={[sex==='femme'?.115:.124,.16,.115]}><sphereGeometry args={[1,24,16]}/><meshStandardMaterial {...mat}/></mesh>
  {([-1,1] as const).map((side)=><group key={side}>
   <group position={[side*.38*largeur,1.49,0]} ref={side<0?brasG:brasD}>
    <mesh position={[side*.07,-.19,0]} rotation={[0,0,side*-.2]}><capsuleGeometry args={[.085*proportions.muscle,.30,6,12]}/><meshStandardMaterial {...mat}/></mesh>
    <mesh position={[side*.13,-.49,.05]} rotation={[.1,0,side*-.08]}><capsuleGeometry args={[.067*proportions.muscle,.28,6,12]}/><meshStandardMaterial {...mat}/></mesh>
    <mesh position={[side*.15,-.72,.05]} scale={[.075,.11,.055]}><sphereGeometry args={[1,12,10]}/><meshStandardMaterial {...mat}/></mesh>
   </group>
   <group position={[side*.16,.89,0]} ref={side<0?jambesG:jambesD}>
    <mesh position={[0,-.24,0]}><capsuleGeometry args={[.13*proportions.muscle,.36,6,14]}/><meshStandardMaterial {...mat}/></mesh>
    <mesh position={[0,-.62,.015]}><capsuleGeometry args={[.09*proportions.muscle,.35,6,14]}/><meshStandardMaterial {...mat}/></mesh>
    <mesh position={[0,-.88,.095]} scale={[.105,.07,.22]}><sphereGeometry args={[1,14,10]}/><meshStandardMaterial {...mat}/></mesh>
   </group>
  </group>)}
 </group>;
}
