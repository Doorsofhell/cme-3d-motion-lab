import {Box3,Bone,Object3D,Sphere,Vector3} from 'three';

export type StudioFocusZone='corps'|'buste'|'visage'|'cheveux'|'peau'|'abdomen'|'hanches'|'jambes'|'mains'|'tibias';
export type StudioSection='corps'|'visage'|'peau'|'cheveux'|'tenue'|'protections';
export const FOCUS_LABELS:Record<StudioFocusZone,string>={
 corps:'Corps entier',buste:'Buste',visage:'Visage',cheveux:'Coiffure',
 peau:'Peau du visage et du buste',abdomen:'Taille et abdomen',
 hanches:'Hanches et bassin',jambes:'Jambes',mains:'Gants et mains',tibias:'Protège-tibias'
};
const defaults:Record<StudioSection,StudioFocusZone>={
 corps:'corps',visage:'visage',peau:'peau',cheveux:'cheveux',tenue:'corps',protections:'mains'
};
export function focusForSection(section:StudioSection):StudioFocusZone{return defaults[section];}
export function focusForSetting(key:string,section:StudioSection):StudioFocusZone{
 const setting:Record<string,StudioFocusZone>={
  height:'corps',shoulders:'buste',muscle:'buste',waist:'abdomen',
  jaw:'visage',nose:'visage',eyes:'visage',eyeColor:'visage',
  skin:'peau',hairStyle:'cheveux',hairColor:'cheveux',
  top:'buste',topColor:'buste',bottom:'jambes',bottomColor:'jambes',
  gloves:'mains',gloveColor:'mains',shins:'tibias',shinColor:'tibias',
  roundness:'corps',hips:'hanches',chest:'buste',thighs:'jambes',glutes:'hanches'
 };
 return setting[key]??defaults[section];
}
const normalized=(name:string)=>name.toLowerCase().replace(/^(mixamorig(?:[:_\-])?|armature[|:_-])/, '').replace(/[^a-z0-9]/g,'');
const names:Record<StudioFocusZone,RegExp>={
 corps:/./,
 buste:/^(spine|spine1|spine2|chest|upperchest|neck|leftshoulder|rightshoulder|leftarm|rightarm)$/,
 visage:/^(head|neck|jaw|lefteye|righteye)$/,
 cheveux:/^(head|neck)$/,
 peau:/^(head|neck|spine2|chest|upperchest)$/,
 abdomen:/^(hips|pelvis|spine|spine1)$/,
 hanches:/^(hips|pelvis|leftupleg|rightupleg)$/,
 jambes:/^(leftupleg|rightupleg|leftleg|rightleg|leftfoot|rightfoot)$/,
 mains:/^(lefthand|righthand|leftforearm|rightforearm|leftarm|rightarm)$/,
 tibias:/^(leftleg|rightleg|leftfoot|rightfoot)$/
};
const minimum:Record<StudioFocusZone,number>={
 corps:.5,buste:.36,visage:.22,cheveux:.25,peau:.34,abdomen:.29,hanches:.31,jambes:.38,mains:.34,tibias:.33
};
/** Region positions come only from real skeleton bones in the loaded GLB.
 * Missing specialist bones fall back to full-body framing, never an invented coordinate.
 */
export function mesurerZoneStudio(root:Object3D,zone:StudioFocusZone):{centre:Vector3;rayon:number;os:number;repli:boolean}{
 root.updateMatrixWorld(true);
 const full=new Box3(),selection=new Box3(),point=new Vector3();
 let total=0,count=0;
 root.traverse(obj=>{
  if(!(obj as Bone).isBone)return;
  obj.getWorldPosition(point);
  if(![point.x,point.y,point.z].every(Number.isFinite))return;
  total++;full.expandByPoint(point);
  if(names[zone].test(normalized(obj.name))){selection.expandByPoint(point);count++;}
 });
 if(!total||full.isEmpty())return {centre:new Vector3(0,1,0),rayon:1.2,os:0,repli:true};
 // Selection requires at least two bones except for face/hair, whose Head is sufficient.
 const special=zone==='visage'||zone==='cheveux';
 const repli=(count<(special?1:2));
 const bounds=repli?full:selection;
 const sphere=new Sphere();bounds.getBoundingSphere(sphere);
 const factor=Math.max(.5,root.getWorldScale(new Vector3()).length()/Math.sqrt(3));
 const rayon=Math.max(minimum[repli?'corps':zone]*factor,sphere.radius);
 return {centre:sphere.center.clone(),rayon,os:repli?total:count,repli};
}
/** Fit a bounded bone region inside both portrait and landscape camera frusta. */
export function distancePourZone(rayon:number,fov:number,aspect:number,zone:StudioFocusZone):number{
 const vertical=Math.max(.12,Math.min(1.3,fov*Math.PI/360));
 const horizontal=Math.atan(Math.tan(vertical)*Math.max(.25,aspect));
 const effective=Math.min(vertical,horizontal);
 const margin=zone==='corps'?1.22:1.34;
 return Math.max(.55,rayon/Math.sin(effective)*margin);
}
