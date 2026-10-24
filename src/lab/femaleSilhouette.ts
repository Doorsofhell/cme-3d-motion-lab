import {Box3,SkinnedMesh,type Object3D} from 'three';
/** Subtle athletic silhouette adjustment for the female comic coach only.
 * Geometry is cloned, and only torso/hip-weighted vertices are modified.
 * Head, arms, legs and joints remain untouched; no rig or motion edits.
 */
export function refineFemaleAthleteSilhouette(root:Object3D):void{
 root.traverse(node=>{
  const mesh=node as SkinnedMesh;
  if(!mesh.isSkinnedMesh)return;
  const original=mesh.geometry;
  const pos=original.getAttribute('position');
  const joints=original.getAttribute('skinIndex');
  const weights=original.getAttribute('skinWeight');
  if(!pos||!joints||!weights)return;
  const torso=new Set<number>();
  mesh.skeleton.bones.forEach((bone,i)=>{
   if(/hips|pelvis|spine|chest|abdomen|torso/i.test(bone.name)&&!/shoulder|arm|neck|head/i.test(bone.name))torso.add(i);
  });
  if(!torso.size)return;
  const geometry=original.clone();
  const p=geometry.getAttribute('position');
  geometry.computeBoundingBox();
  const bounds=geometry.boundingBox??new Box3();
  const height=bounds.max.y-bounds.min.y;
  if(height<.1){geometry.dispose();return;}
  const centerX=(bounds.min.x+bounds.max.x)*.5;
  const centerZ=(bounds.min.z+bounds.max.z)*.5;
  for(let i=0;i<p.count;i++){
   let torsoWeight=0;
   for(let k=0;k<4;k++)if(torso.has(joints.getComponent(i,k)))torsoWeight+=weights.getComponent(i,k);
   if(torsoWeight<.65)continue;
   const y=p.getY(i),t=(y-bounds.min.y)/height;
   // Smooth localized widening; maximum 3.5% at the hip and 2% upper torso.
   const hip=Math.exp(-Math.pow((t-.48)/.12,2));
   const chest=Math.exp(-Math.pow((t-.68)/.10,2));
   const blend=Math.min(1,(torsoWeight-.65)/.3);
   const width=1+blend*(.035*hip+.02*chest);
   const depth=1+blend*(.02*hip+.012*chest);
   p.setXYZ(i,centerX+(p.getX(i)-centerX)*width,y,centerZ+(p.getZ(i)-centerZ)*depth);
  }
  p.needsUpdate=true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  geometry.userData.cmeOwned=true;
  mesh.geometry=geometry;
 });
}
