import {Mesh,MeshStandardMaterial,MeshToonMaterial,Object3D,Color,type Material} from 'three';
import {NATIVE_SKIN_REFERENCE} from './skinTones';

export type NeutralAppearance={
 skin:string;hairColor:string;topColor:string;bottomColor:string;gloveColor:string;shinColor?:string;eyeColor?:string;accessories?:('gloves'|'shins')[];
};
export type AppearanceZone=Exclude<keyof NeutralAppearance,'accessories'>;

const sourceColors=new WeakMap<Material,Color>();
/** Uniforme isolé par matériau cloné. La nuance de peau est la nouvelle
 * couleur de référence, pas un multiplicateur accumulé sur la texture sombre.
 * Le détail lumineux de la texture est conservé dans le shader avant l'éclairage.
 * Les vraies textures, normales, UV, skinning et animations restent intacts.
 */
type SkinUniform={value:Color};
const skinTargets=new WeakMap<Material,SkinUniform>();
export function readSkinToneTarget(material:Material):Color|undefined{return skinTargets.get(material)?.value.clone();}
export function installSkinToneShader(material:MeshStandardMaterial|MeshToonMaterial,hex:string):void{
 let uniform=skinTargets.get(material);
 if(uniform){uniform.value.set(hex);return;}
 uniform={value:new Color(hex)};
 skinTargets.set(material,uniform);
 const initialOnBeforeCompile=material.onBeforeCompile.bind(material);
 material.onBeforeCompile=(shader,renderer)=>{
  initialOnBeforeCompile(shader,renderer);
  shader.uniforms.cmeSkinTarget=uniform;
  shader.fragmentShader=shader.fragmentShader.replace(
   '#include <map_fragment>',
   `#include <map_fragment>
    // Recalibrage réversible : la texture conserve son micro-relief et
    // son contraste de luminance, la couleur choisie pilote le teint.
    float cmeSkinLuma=dot(diffuseColor.rgb,vec3(0.2126,0.7152,0.0722));
    float cmeSkinDetail=0.70+0.30*smoothstep(0.035,0.72,cmeSkinLuma);
    diffuseColor.rgb=clamp(cmeSkinTarget*cmeSkinDetail,0.0,1.0);`
  ).replace('void main() {','uniform vec3 cmeSkinTarget;\nvoid main() {');
 };
 material.customProgramCacheKey=()=> 'cme-skin-ton-direct-v1';
 material.needsUpdate=true;
}

const readableFallback=/^(?:material|mat)(?:[._ -]?[0-9]+)?$|^default(?:material)?$|^[0-9]+$/i;

/** Specific costume/hair/eyes identifiers MUST beat generic body/skin identifiers. */
export function appearanceZone(name:string):AppearanceZone|null{
 const id=name.replace(/([a-z])([A-Z])/g,'$1_$2').toLowerCase();
 if(/iris|pupil|eyeball|eye[_. -]/.test(id))return 'eyeColor';
 if(/hair|cheveu|scalp|beard|brow|eyelash|cils/.test(id))return 'hairColor';
 if(/glove|mitten|boxing_mitt|gant|handwrap|bandage|sangle.mma/.test(id))return 'gloveColor';
 if(/protection|protege.tibia|shinguard|shin.guard|velcro/.test(id))return 'shinColor';
 if(/short|pantalon|pant|trouser|legging|bottom|lowerwear|hakama/.test(id))return 'bottomColor';
 if(/shirt|rash|jersey|top|torso_wear|vest|veste|brassiere|tshirt|t_shirt|kimono|gi[_-]|col[_-]|haut|uniform/.test(id))return 'topColor';
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
 // Imported clothing uses synthetic mesh names; only an explicitly named body/iris/hair mesh
 // may override a descriptive material, never recolour arbitrary outfit fabrics.
 if(/^(?:f021|m021|m018)[_-](?:body|head)/i.test(mesh.name)&&!appearanceZone(material.name))return 'skin';
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
  limit(original.b*scale(target.b,reference.b),0,1)
 );
}

export function applyNeutralAppearance(root:Object3D,appearance?:NeutralAppearance):number{
 let count=0;
 root.traverse(object=>{
  const mesh=object as Mesh;
  if(!mesh.isMesh)return;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  if(mesh.name.startsWith('tenue:')&&appearance?.accessories){
   const zones=materials.map(m=>zoneFor(mesh,m));
   if(zones.length&&zones.every(z=>z==='gloveColor'))mesh.visible=appearance.accessories.includes('gloves');
   else if(zones.length&&zones.every(z=>z==='shinColor'))mesh.visible=appearance.accessories.includes('shins');
  }
  for(const material of materials){
   if(!(material instanceof MeshStandardMaterial)&&!(material instanceof MeshToonMaterial))continue;
   const zone=zoneFor(mesh,material);
   if(!zone)continue;
   if(appearance&&appearance[zone]){
    if(zone==='skin'&&material.map){
     installSkinToneShader(material,appearance[zone]);
     // Aucun cumul des corrections lorsque l'utilisateur passe clair → foncé → clair.
     count++;continue;
    }
    if((zone==='eyeColor'||zone==='hairColor')&&material.map){
     let source=sourceColors.get(material);
     if(!source){source=material.color.clone();sourceColors.set(material,source);}
     // Maps retain their painted albedo and fine texture: shift tint relative to a reference.
     const reference=zone==='eyeColor'?'#4a2f1e':'#201713';
     const base=new Color(reference),target=new Color(appearance[zone]);
     const scale=(c:number,r:number)=>limit(c/Math.max(.002,r),.35,1.95);
     material.color.setRGB(limit(source.r*scale(target.r,base.r),0,1),limit(source.g*scale(target.g,base.g),0,1),limit(source.b*scale(target.b,base.b),0,1));
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
 const totals:Record<AppearanceZone,number>={skin:0,hairColor:0,topColor:0,bottomColor:0,gloveColor:0,shinColor:0,eyeColor:0};
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
  // Strict anatomy: never show any independently attached clothing, footwear
  // or protection, even when an upstream GLB accidentally contains such meshes.
  if(/(^|[_. :/-])(tenue|garment|clothing|shirt|rashguard|shorts?|pants?|pantalon|brassiere|vest|veste|gi|kimono|gloves?|gants?|shinguards?|headgear|helmet|pads?|shoes?|chaussure)([_. :/-]|$)/.test(id)){
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


/**
 * Mannequin anatomique satin gris : ne change jamais les meshes, le rig ou la
 * géométrie de référence. L'effet premium reste une approximation de matière
 * sur le GLB réellement disponible, pas une sculpture anatomique nouvelle.
 * Ne pas appeler applyNeutralAppearance ensuite dans cette vue.
 */
export function applyAnatomicalMannequinMaterials(root:Object3D):number{
 prepareEditableNeutralBody(root);
 let count=0;
 root.traverse(object=>{
  const mesh=object as Mesh;
  if(!mesh.isMesh||!mesh.visible||mesh.userData.cmeHiddenSource)return;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  for(const material of materials){
   if(!(material instanceof MeshStandardMaterial))continue;
   material.color.set('#adb5c1');
   material.map=null;
   material.emissiveMap=null;
   material.metalness=.32;
   material.roughness=.48;
   material.needsUpdate=true;
   count++;
  }
 });
 return count;
}

/**
 * Neutral Creator: show a true, editable human silhouette with original skin,
 * hair and iris textures. This never installs the technical grey anatomy shader.
 * Called only on a cloned scene, leaving source assets and outfits untouched.
 */
export function prepareEditableNeutralBody(root:Object3D):number{
 let hidden=0;
 root.traverse(o=>{
  const mesh=o as Mesh;
  if(!mesh.isMesh)return;
  const id=mesh.name.toLowerCase();
  if(/(^|[_. :/-])(tenue|garment|clothing|shirt|rashguard|shorts?|pants?|pantalon|brassiere|vest|veste|gi|kimono|gloves?|gants?|shinguards?|headgear|helmet|pads?|shoes?|chaussure)([_. :/-]|$)/.test(id)){
   mesh.visible=false;hidden++;return;
  }
  // Respect meshes deliberately hidden by the renderer itself.
  if(!mesh.userData.cmeHiddenSource)mesh.visible=true;
 });
 return hidden;
}
