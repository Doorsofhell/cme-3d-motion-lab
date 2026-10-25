import {Box3,Mesh,Object3D,Sphere,Vector3} from 'three';

/** Bounds of the ACTUALLY VISIBLE silhouette, not just bone pivots.
 * Conservative geometry bounding boxes are used once per reframing: no
 * per-frame vertex traversal or GPU readback on Android.
 * Also works with CC0 MakeHuman rigs whose bone names differ from Mixamo.
 */
export function mesurerSilhouetteVisible(root:Object3D):{centre:Vector3;rayon:number;maillages:number}|null{
 root.updateWorldMatrix(true,true);
 const box=new Box3(),world=new Box3();
 let count=0;
 root.traverse(obj=>{
  const mesh=obj as Mesh;
  if(!mesh.isMesh||mesh.userData.cmeHiddenSource)return;
  let parent:Object3D|null=mesh,visible=true;
  while(parent){if(!parent.visible){visible=false;break;}if(parent===root)break;parent=parent.parent;}
  if(!visible)return;
  const geo=mesh.geometry,position=geo?.getAttribute('position');
  if(!position?.count)return;
  if(!geo.boundingBox)geo.computeBoundingBox();
  if(!geo.boundingBox||geo.boundingBox.isEmpty())return;
  world.copy(geo.boundingBox).applyMatrix4(mesh.matrixWorld);
  if(![world.min.x,world.min.y,world.min.z,world.max.x,world.max.y,world.max.z].every(Number.isFinite))return;
  box.union(world);count++;
 });
 if(!count||box.isEmpty())return null;
 const sphere=new Sphere();
 box.getBoundingSphere(sphere);
 return {centre:sphere.center,rayon:Math.max(.4,sphere.radius),maillages:count};
}

/** Explicit, stable perspective-camera distance shared by face, back & profiles.
 * Used by four-view tests to guard against cropping on narrow Android layouts.
 * Do not use frame-to-frame changes in distance when toggling views.
 */
export function calculerDistanceSilhouette(rayon:number,verticalFov:number,aspect:number):number{
 const fov=Math.max(.12,Math.min(1.3,verticalFov*Math.PI/360));
 const horizontal=Math.atan(Math.tan(fov)*Math.max(.25,aspect));
 return Math.max(.55,rayon/Math.sin(Math.min(fov,horizontal))*1.26);
}
