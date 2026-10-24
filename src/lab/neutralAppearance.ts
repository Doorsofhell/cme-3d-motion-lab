import {Mesh,MeshStandardMaterial,MeshToonMaterial,Object3D,Color,type Material} from 'three';
import {NATIVE_SKIN_REFERENCE} from './skinTones';

export type NeutralAppearance={
 skin:string;hairColor:string;topColor:string;bottomColor:string;gloveColor:string;eyeColor?:string;
};
export type AppearanceZone=keyof NeutralAppearance;
type Tintable=MeshStandardMaterial|MeshToonMaterial;

const sourceColors=new WeakMap<Material,Color>();
const readableFallback=/^(?:material(?:[._ -]?[0-9]+)?|mat[0-9]*|default(?:material)?|[0-9]+)$/i;

/** Specific costume/hair/eyes identifiers MUST beat generic body/skin identifiers. */
export function appearanceZone(name:string):AppearanceZone|null{
 const id=name.replace(/([a-z])([A-Z])/g,'$1_$2').toLowerCase();
 if(/iris|pupil|eyeball|eye[_. -]/.test(id))return 'eyeColor';
 if(/hair|cheveu|beard|brow|eyelash|cils/.test(id))return 'hairColor';
 if(/glove|mitten|boxing_mitt|gant|handwrap|bandage/.test(id))return 'gloveColor';
 if(/short|pant|trouser|legging|bottom|lowerwear|hakama/.test(id))return 'bottomColor';
 if(/shirt|rash|jersey|top|torso_wear|vest|brassiere|tshirt|t_shirt|kimono|gi_top|uniform/.test(id))return 'topColor';
 if(/(^|[_. :/-])(skin|body|face|head|neck|arm|leg|hand|foot)([_. :/-]|$)/.test(id)||/^(f021_|m018_|m021_)/.test(id))return 'skin';
 if(/(^|[_. :/-])eyes?([_. :/-]|$)/.test(id))return 'eyeColor';
 return null;
}
function zoneFor(mesh:Mesh,material:Material):AppearanceZone|null{
 const explicit=appearanceZone(material.name);
 if(explicit)return explicit;
 // A descriptive mesh name is useful when a material has a generated/generic name.
 // Never paint a garment using a broad enclosing body name if the material is named.
 if(!material.name||readableFallback.test(material.name))return appearanceZone(mesh.name);
 return null;
}

const limit=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
/** A textured GLB already contains its skin colour. Use a *relative* tone, not
 * target RGB multiplied by the texture (which creates the dark/red double tint).
 * Material snapshots are per locally cloned scene; source GLBs stay unchanged.
 */
export function relativeSkinColor(original:Color,targetHex:string):Color{
 const reference=new Color(NATIVE_SKIN_REFERENCE);
 const target=new Color(targetHex);
 const scale=(channel:number,referenceChannel:number)=>
  limit(channel/Math.max(.001,referenceChannel),.48,1.65);
 return new Color().setRGB(
  limit(original.r*scale(target.r,reference.r),0,1),
  limit(original.g*scale(target.g,reference.g),0,1),
  limit(original.b*scale(target.b,reference.b),0,1),
  Color.LinearSRGBColorSpace
 );
}

export function applyNeutralAppearance(root:Object3D,appearance?:NeutralAppearance):number{
 let count=0;
 root.traverse(object=>{
  const mesh=object as Mesh;
  if(!mesh.isMesh)return;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  for(const material of materials){
   if(!(material instanceof MeshStandardMaterial)&&!(material instanceof MeshToonMaterial))continue;
   const zone=zoneFor(mesh,material);
   if(!zone)continue;
   if(appearance&&appearance[zone]){
    if(zone==='skin'&&material.map){
     let source=sourceColors.get(material);
     if(!source){source=material.color.clone();sourceColors.set(material,source);}
     material.color.copy(relativeSkinColor(source,appearance.skin));
    }else{
     material.color.copy(new Color(appearance[zone]));
    }
   }else if(!appearance){
    material.color.set('#a5abb4');
   }else continue;
   material.needsUpdate=true;
   count++;
  }
 });
 return count;
}

/** Count actually recolourable submaterials on the exact (cloned) 3D scene. */
export function inspectCoachMaterialZones(root:Object3D):Record<AppearanceZone,number>{
 const totals:Record<AppearanceZone,number>={skin:0,hairColor:0,topColor:0,bottomColor:0,gloveColor:0,eyeColor:0};
 root.traverse(o=>{
  const mesh=o as Mesh;
  if(!mesh.isMesh)return;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  for(const material of materials){
   if(!(material instanceof MeshStandardMaterial)&&!(material instanceof MeshToonMaterial))continue;
   const zone=zoneFor(mesh,material);
   if(zone)totals[zone]++;
  }
 });
 return totals;
}

/** Neutral anatomy mode preserves the skeleton; never fabricate non-existent GLB meshes. */
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
