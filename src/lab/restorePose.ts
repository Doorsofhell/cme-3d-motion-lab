import type {Bone,Object3D} from 'three';
/** Reference pose helper copied from Shadow v0.31; no Shadow runtime dependencies. */
export function restoreReferencePose(root:Object3D){
 root.traverse(o=>{
  if(!(o as Bone).isBone)return;
  const ref=(o.userData.cssRef ??={q:o.quaternion.clone(),p:o.position.clone(),s:o.scale.clone()});
  o.quaternion.copy(ref.q);o.position.copy(ref.p);o.scale.copy(ref.s);
 });
}
