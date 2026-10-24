import {useFrame,useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {useMemo} from 'react';
/** Cadrage pédagogique déterministe, sans caméra utilisateur ni captation vidéo. */
export function CameraPedagogique({mouvement,active}:{mouvement:string;active:boolean}){
 const {camera}=useThree();
 const target=useMemo(()=>new Vector3(),[]);
 useFrame((_,delta)=>{
  if(!active)return;
  const nom=mouvement.toLowerCase();
  const pied=/kick|foot|teep|low|middle|high|mawashi|geri|ashi|balay|fauch|sweep|genou/.test(nom);
  const bras=/jab|cross|hook|crochet|upper|direct|punch|coude|elbow/.test(nom);
  const visée=pied?new Vector3(0,.65,0):bras?new Vector3(0,1.25,0):new Vector3(0,.98,0);
  const position=pied?new Vector3(2.25,1.35,2.95):bras?new Vector3(1.6,1.8,2.6):new Vector3(0,1.45,3.5);
  const facteur=1-Math.exp(-Math.min(delta,.05)*2.5);
  camera.position.lerp(position,facteur);
  target.lerp(visée,facteur);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
 });
 return null;
}
