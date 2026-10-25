import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Box3,Bone,Object3D,PerspectiveCamera,Sphere,Vector3} from 'three';
import {distancePourZone,mesurerZoneStudio,type StudioFocusZone} from './studioFocus';
import {directionAnatomique,type AnatomicalView} from './AnatomicalReference';

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
type OrbitAccess={
 target?:Vector3;update?:()=>void;
 addEventListener?:(name:string,cb:()=>void)=>void;
 removeEventListener?:(name:string,cb:()=>void)=>void;
};
type FrameDestination={position:Vector3;target:Vector3};
/** Shared skeletal camera: smooth focus when editing; user OrbitControls input
 * immediately cancels animation. Pedagogical auto camera remains independent.
 * No webcam, video frame processing or motion-sampler updates.
 */
export function CadrageSquelette({racine,actif,zone,refocus=0,orientation=null}:{racine:Object3D|null;actif:boolean;zone?:StudioFocusZone;refocus?:number;orientation?:AnatomicalView|null}){
 const {camera,controls}=useThree();
 const destination=useRef<FrameDestination|null>(null);
 const orbit=controls as unknown as OrbitAccess|null;
 useEffect(()=>{
  if(!actif||!racine||!(camera instanceof PerspectiveCamera)){destination.current=null;return;}
  const {centre,rayon}=zone?mesurerZoneStudio(racine,zone):mesurerSquelette(racine);
  const distance=zone?distancePourZone(rayon,camera.fov,camera.aspect,zone):
   Math.max(2,rayon/Math.sin(camera.fov*Math.PI/360)*1.2);
  // Preserve viewing direction if the user previously rotated, but recenter to
  // the true target bone region (including off-origin rigs).
  const previous=orbit?.target??new Vector3(0,1,0);
  const direction=orientation?new Vector3(...directionAnatomique(orientation)):camera.position.clone().sub(previous);
  if(direction.lengthSq()<.001)direction.set(0,.12,1);
  direction.normalize();
  const position=centre.clone().addScaledVector(direction,distance);
  camera.near=Math.max(.01,distance-rayon*2);
  camera.far=Math.max(100,distance+rayon*6);
  camera.updateProjectionMatrix();
  if(zone){destination.current={position,target:centre};}
  else{
   // Keep legacy lab automatic framing semantics without a focus zone.
   destination.current=null;
   camera.position.copy(position);camera.lookAt(centre);
   if(orbit?.target){orbit.target.copy(centre);orbit.update?.();}
  }
 },[racine,actif,zone,refocus,camera,orbit,orientation]);
 useEffect(()=>{
  if(!orbit?.addEventListener)return;
  const cancel=()=>{destination.current=null;};
  orbit.addEventListener('start',cancel);
  return ()=>orbit.removeEventListener?.('start',cancel);
 },[orbit]);
 useFrame((_,delta)=>{
  const aim=destination.current;
  if(!aim||!actif)return;
  const speed=1-Math.exp(-Math.min(.05,delta)*5);
  camera.position.lerp(aim.position,speed);
  if(orbit?.target){orbit.target.lerp(aim.target,speed);orbit.update?.();}
  else camera.lookAt(aim.target);
  if(camera.position.distanceToSquared(aim.position)<.00005&&
     (!orbit?.target||orbit.target.distanceToSquared(aim.target)<.00005)){
   camera.position.copy(aim.position);
   if(orbit?.target){orbit.target.copy(aim.target);orbit.update?.();}
   else camera.lookAt(aim.target);
   destination.current=null;
  }
 });
 return null;
}
