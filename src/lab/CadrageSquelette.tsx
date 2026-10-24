import {useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {Box3,Bone,Object3D,PerspectiveCamera,Sphere,Vector3} from 'three';

export function mesurerSquelette(racine:Object3D):{centre:Vector3;rayon:number;os:number}{
 racine.updateMatrixWorld(true);
 const limites=new Box3();const point=new Vector3();let os=0;
 racine.traverse(objet=>{
  if(!(objet as Bone).isBone)return;
  objet.getWorldPosition(point);
  if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||!Number.isFinite(point.z))return;
  limites.expandByPoint(point);os++;
 });
 if(os===0||limites.isEmpty())return {centre:new Vector3(0,1,0),rayon:1.2,os:0};
 const sphere=new Sphere();limites.getBoundingSphere(sphere);
 return {centre:sphere.center.clone(),rayon:Math.max(.4,sphere.radius),os};
}

/** Cadre le squelette réel, indépendamment de l'échelle et de l'origine du GLB. */
export function CadrageSquelette({racine,actif}:{racine:Object3D|null;actif:boolean}){
 const {camera,controls}=useThree();
 useEffect(()=>{
  if(!racine||!actif||!(camera instanceof PerspectiveCamera))return;
  const {centre,rayon}=mesurerSquelette(racine);
  const demiAngle=(camera.fov*Math.PI/180)/2;
  const distance=Math.max(2,rayon/Math.sin(demiAngle)*1.2);
  camera.position.copy(centre).add(new Vector3(0,rayon*.12,distance));
  camera.near=Math.max(.01,distance-rayon*2);
  camera.far=Math.max(100,distance+rayon*6);
  camera.lookAt(centre);camera.updateProjectionMatrix();
  const orbit=controls as {target?:Vector3;update?:()=>void}|null;
  if(orbit?.target){orbit.target.copy(centre);orbit.update?.();}
 },[racine,actif,camera,controls]);
 return null;
}
