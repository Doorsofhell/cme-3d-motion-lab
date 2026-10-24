import {Bone,CapsuleGeometry,Mesh,MeshStandardMaterial,Object3D,Quaternion,SphereGeometry,Vector3} from 'three';

export type NeutralBuildReport={segments:number;missing:string[];sex:'homme'|'femme'};
export const CANONICAL_SEGMENTS=[
 ['Hips','Spine'],['Spine','Spine1'],['Spine1','Spine2'],['Spine2','Neck'],['Neck','Head'],
 ['LeftShoulder','LeftArm'],['LeftArm','LeftForeArm'],['LeftForeArm','LeftHand'],
 ['RightShoulder','RightArm'],['RightArm','RightForeArm'],['RightForeArm','RightHand'],
 ['LeftUpLeg','LeftLeg'],['LeftLeg','LeftFoot'],['LeftFoot','LeftToeBase'],
 ['RightUpLeg','RightLeg'],['RightLeg','RightFoot'],['RightFoot','RightToeBase']
] as const;
const material=()=>new MeshStandardMaterial({color:'#a7abb2',roughness:.94,metalness:0});
const prefix=(s:string)=>s.replace(/^mixamorig:?/i,'').toLowerCase();

/** Create a neutral anatomical study surface attached to an existing canonical rig.
 * No skin textures, clothing or coach accessories are used. The source GLB geometry
 * is hidden; all new primitives follow the same animated bones and rest transforms.
 * This is a procedural *study proxy*, not a sculpted/clinically validated body mesh.
 */
export function buildNeutralHumanoid(root:Object3D,sex:'homme'|'femme'):NeutralBuildReport{
 const bones=new Map<string,Bone>();
 root.traverse(o=>{if((o as Bone).isBone)bones.set(prefix(o.name),o as Bone);});
 root.updateMatrixWorld(true);
 const missing:string[]=[];
 const shoulder=sex==='femme'?.93:1;
 const torso=sex==='femme'?.91:1;
 const radius=(name:string)=>{
  if(/upLeg/i.test(name))return .125;
  if(/leg$/i.test(name))return .092;
  if(/forearm/i.test(name))return .061;
  if(/arm$/i.test(name))return .078*shoulder;
  if(/spine|hips/i.test(name))return .17*torso;
  if(/neck/i.test(name))return .064;
  if(/head/i.test(name))return .10;
  if(/foot/i.test(name))return .07;
  return .075;
 };
 let segments=0;
 for(const [from,to] of CANONICAL_SEGMENTS){
  const a=bones.get(from.toLowerCase()),b=bones.get(to.toLowerCase());
  if(!a||!b){missing.push(from+'→'+to);continue;}
  const start=new Vector3(),end=new Vector3();
  a.getWorldPosition(start);b.getWorldPosition(end);
  const length=start.distanceTo(end);
  if(length<.005){missing.push(from+'→'+to+' (longueur nulle)');continue;}
  // Les GLB n'utilisent pas tous le mètre : la largeur suit la longueur réelle des os.
  const r=Math.max(length*.12,Math.min(length*.38,radius(from)*Math.max(1,length/.22)));
  const geometry=new CapsuleGeometry(r,Math.max(.001,length-2*r),5,10);
  const mesh=new Mesh(geometry,material());
  mesh.name='CME_NEUTRAL_'+from+'_'+to;
  const center=start.clone().add(end).multiplyScalar(.5);
  a.worldToLocal(center);
  mesh.position.copy(center);
  const direction=end.clone().sub(start).normalize();
  a.getWorldQuaternion(mesh.quaternion);
  mesh.quaternion.invert().multiply(new Quaternion().setFromUnitVectors(new Vector3(0,1,0),direction));
  mesh.visible=true;
  mesh.frustumCulled=false;
  a.add(mesh);
  segments++;
 }
 const head=bones.get('head');
 if(head){
  const neck=bones.get('neck');
  const neckPos=new Vector3(),headPos=new Vector3();
  neck?.getWorldPosition(neckPos);head.getWorldPosition(headPos);
  const headRadius=Math.max(.035,neck?neckPos.distanceTo(headPos)*.75:.11);
  const sphere=new Mesh(new SphereGeometry(headRadius*(sex==='femme'?.96:1),16,12),material());
  sphere.name='CME_NEUTRAL_HEAD';
  sphere.position.set(0,headRadius*.55,0);
  sphere.visible=true;
  sphere.frustumCulled=false;
  head.add(sphere);
 }
 return {segments,missing,sex};
}
