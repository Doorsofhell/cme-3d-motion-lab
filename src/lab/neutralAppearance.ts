import {Mesh,MeshStandardMaterial,MeshToonMaterial,Object3D,Color} from 'three';

export type NeutralAppearance={
 skin:string;hairColor:string;topColor:string;bottomColor:string;gloveColor:string;eyeColor?:string;
};

/** Conservative material adapter: never alters bones, vertices, skin weights or animation.
 * Unknown meshes keep their source texture/color rather than being painted uniformly.
 */
export function appearanceZone(name:string):keyof NeutralAppearance|null{
 const id=name.toLowerCase();
 if(/(^|[_. -])(iris|eyeball|eye(s)?)([_. -]|$)/.test(id))return 'eyeColor';
 if(/(^|[_. -])(skin|body|face|head|neck|arm|leg|hand|foot)([_. -]|$)/.test(id)||/^(f021_|m018_|m021_)/.test(id))return 'skin';
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
   if(!(material instanceof MeshStandardMaterial)&&!(material instanceof MeshToonMaterial))continue;
   // Material-specific zones take precedence over an enclosing skinned body mesh.
   const zone=appearanceZone(material.name)||(!material.name||/^(?:material(?:[._ -]?[0-9]+)?|mat[0-9]*|default(?:material)?)$/i.test(material.name)?appearanceZone(mesh.name):null);
   if(!zone)continue;
   if(appearance&&appearance[zone]){
    material.color.copy(new Color(appearance[zone]));
    // Retain source texture, transparency and physical shading; no uniform grey override.
   }else if(!appearance){
    material.color.set('#a5abb4');
   }else continue;
   material.needsUpdate=true;
   count++;
  }
 });
 return count;
}

/** Honest per-zone capabilities, determined from the actual cloned GLB material names. */
export function inspectCoachMaterialZones(root:Object3D):Record<keyof NeutralAppearance,number>{
 const totals={skin:0,hairColor:0,topColor:0,bottomColor:0,gloveColor:0,eyeColor:0};
 root.traverse(o=>{
  const mesh=o as Mesh;
  if(!mesh.isMesh)return;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  for(const material of materials){
   if(!(material instanceof MeshStandardMaterial)&&!(material instanceof MeshToonMaterial))continue;
   const zone=appearanceZone(material.name)||(!material.name||/^(?:material(?:[._ -]?[0-9]+)?|mat[0-9]*|default(?:material)?)$/i.test(material.name)?appearanceZone(mesh.name):null);
   if(zone)totals[zone]++;
  }
 });
 return totals;
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
