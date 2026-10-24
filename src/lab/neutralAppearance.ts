import {Mesh,MeshStandardMaterial,Object3D,Color} from 'three';

export type NeutralAppearance={
 skin:string;hairColor:string;topColor:string;bottomColor:string;gloveColor:string;
};

/** Conservative material adapter: never alters bones, vertices, skin weights or animation.
 * Unknown meshes keep their source texture/color rather than being painted uniformly.
 */
export function appearanceZone(name:string):keyof NeutralAppearance|null{
 const id=name.toLowerCase();
 if(/(^|[_. -])(skin|body|face|head|neck|arm|leg|hand|foot)([_. -]|$)/.test(id))return 'skin';
 if(/hair|beard|brow/.test(id))return 'hairColor';
 if(/glove|mitt/.test(id))return 'gloveColor';
 if(/short|pant|trouser|legging|bottom/.test(id))return 'bottomColor';
 if(/shirt|rash|jersey|top|torso|vest/.test(id))return 'topColor';
 return null;
}
export function applyNeutralAppearance(root:Object3D,appearance?:NeutralAppearance):number{
 let count=0;
 root.traverse(object=>{
  const mesh=object as Mesh;
  if(!mesh.isMesh)return;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  for(const material of materials){
   if(!(material instanceof MeshStandardMaterial))continue;
   const zone=appearanceZone(mesh.name+' '+material.name);
   if(!zone)continue;
   if(appearance){
    material.color.copy(new Color(appearance[zone]));
    // Retain source texture, transparency and physical shading; no uniform grey override.
   }else{
    material.color.set('#a5abb4');
   }
   material.needsUpdate=true;
   count++;
  }
 });
 return count;
}

/** Neutral test mode: homogeneous matte surface, without skin or costume textures.
 * Hide only explicitly named detachable equipment meshes. Some source GLBs have
 * clothing fused into the body mesh; that geometry cannot be removed safely here.
 * A certified bare neutral rig will require a dedicated asset.
 */
export function applyNeutralRigMaterials(root:Object3D):number{
 let count=0;
 root.traverse(object=>{
  const mesh=object as Mesh;
  if(!mesh.isMesh)return;
  const id=mesh.name.toLowerCase();
  if(/(^|[_. -])(gloves?|shinguards?|headgear|helmet|pads?|shoes?)([_. -]|$)/.test(id)){
   mesh.visible=false;
   return;
  }
  mesh.visible=true;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  for(const material of materials){
   if(!(material instanceof MeshStandardMaterial))continue;
   material.color.set('#a7abb2');
   material.map=null;
   material.emissiveMap=null;
   material.roughness=.92;
   material.metalness=0;
   material.needsUpdate=true;
   count++;
  }
 });
 return count;
}
