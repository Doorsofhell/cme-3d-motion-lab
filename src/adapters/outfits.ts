import { Bone, BufferAttribute, Color, Material, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, Skeleton, SkinnedMesh, SRGBColorSpace, DoubleSide } from 'three';
import {cloneOwnedGeometry} from './geometryOwnership';
function hiddenKeys(s:string):Set<string>{
 const bytes=Uint8Array.from(atob(s),c=>c.charCodeAt(0)),dv=new DataView(bytes.buffer),keys=new Set<string>();
 for(let o=0;o+6<=bytes.length;o+=6)keys.add(`${dv.getInt16(o,true)},${dv.getInt16(o+2,true)},${dv.getInt16(o+4,true)}`);return keys;
}
export function maskBody(pos:ArrayLike<number>,indices:ArrayLike<number>,keys:Set<string>,factor:number,keep?:ArrayLike<number>){
 const hidden=new Uint8Array(pos.length/3);let matched=0;
 for(let i=0;i<hidden.length;i++){const k=`${Math.round(pos[3*i]*factor)},${Math.round(pos[3*i+1]*factor)},${Math.round(pos[3*i+2]*factor)}`;if(keys.has(k) && !keep?.[i]){hidden[i]=1;matched++;}}
 const index:number[]=[];for(let i=0;i<indices.length;i+=3){const a=indices[i],b=indices[i+1],c=indices[i+2];if(hidden[a]&&hidden[b]&&hidden[c])continue;index.push(a,b,c);}return {index,matched};
}
/** Prépare un matériau de vêtement SPORTIF existant pour un rendu de studio.
 * Ne change jamais l'albédo, les cartes textures, la découpe ni la transparence.
 * Cette fonction est partagée par les six disciplines et les deux coachs.
 */
export function prepareSportOutfitMaterial(original:Material,lowCost=false):Material{
 if(!(original instanceof MeshStandardMaterial))return original.clone();
 const m=original;
 if(m.map){m.map.colorSpace=SRGBColorSpace;m.map.anisotropy=lowCost?2:4;}
 if(m.normalMap)m.normalMap.anisotropy=lowCost?2:4;
 if(lowCost)return m.clone();
 const sheen=Number(m.userData?.css_sheen??0),coat=Number(m.userData?.css_coat??0);
 // Les vrais plis et surpiqûres restent issus des normal/roughness maps GLB.
 const premium=new MeshPhysicalMaterial({
  name:m.name,color:m.color.clone(),map:m.map??null,normalMap:m.normalMap??null,
  normalScale:m.normalScale.clone(),normalMapType:m.normalMapType,
  roughness:m.roughness,roughnessMap:m.roughnessMap??null,
  metalness:m.metalness,metalnessMap:m.metalnessMap??null,
  bumpMap:m.bumpMap??null,bumpScale:m.bumpScale,
  aoMap:m.aoMap??null,aoMapIntensity:m.aoMapIntensity,
  lightMap:m.lightMap??null,lightMapIntensity:m.lightMapIntensity,
  emissive:m.emissive.clone(),emissiveMap:m.emissiveMap??null,
  emissiveIntensity:m.emissiveIntensity,alphaMap:m.alphaMap??null,
  transparent:m.transparent,opacity:m.opacity,alphaTest:m.alphaTest,
  depthWrite:m.depthWrite,depthTest:m.depthTest,
  vertexColors:m.vertexColors,flatShading:m.flatShading,
  side:/brassiere|haut-/i.test(m.name)?DoubleSide:m.side,
  polygonOffset:m.polygonOffset||/brassiere|haut-/i.test(m.name),
  polygonOffsetFactor:m.polygonOffset?m.polygonOffsetFactor:-1,
  polygonOffsetUnits:m.polygonOffset?m.polygonOffsetUnits:-1,
  sheen:Math.min(.22,Math.max(.035,sheen)),sheenRoughness:.78,
  sheenColor:m.color.clone().lerp(new Color('#ffffff'),.12),
  clearcoat:Math.min(.18,Math.max(0,coat)),clearcoatRoughness:.52,
  specularIntensity:.38
 });
 premium.userData={...m.userData};
 return premium;
}
/** Rebind the discipline outfit to the real fighter's original bones; clone geometry to avoid skin poke-through. */
export function attachOutfit(body:Object3D,outfit:Object3D,lowCost=false):{garments:number;hiddenVertices:number}{
 const bones=new Map<string,Bone>(),skins:SkinnedMesh[]=[];
 body.traverse(o=>{if((o as Bone).isBone)bones.set(o.name,o as Bone);if((o as SkinnedMesh).isSkinnedMesh)skins.push(o as SkinnedMesh);});
 const anchor=skins[0];if(!anchor)throw Error('No skinned human body in source GLB');
 let hiding:{keys:string;scale:number}|null=null;const garments:SkinnedMesh[]=[];
 outfit.traverse(o=>{if(o.userData?.hideBody)hiding={keys:String(o.userData.hideBody),scale:Number(o.userData.hideScale??1000)};if((o as SkinnedMesh).isSkinnedMesh)garments.push(o as SkinnedMesh);});
 for(const g of garments){
  const mesh=new SkinnedMesh(cloneOwnedGeometry(g.geometry),prepareSportOutfitMaterial(g.material as Material,lowCost));mesh.name='tenue:'+g.name;
  mesh.position.copy(g.position);mesh.quaternion.copy(g.quaternion);mesh.scale.copy(g.scale);
  const skeleton=new Skeleton(g.skeleton.bones.map(b=>bones.get(b.name)??b),g.skeleton.boneInverses);
  anchor.parent?.add(mesh);mesh.updateMatrixWorld(true);mesh.bind(skeleton,g.bindMatrix);
  mesh.frustumCulled=false;mesh.castShadow=!lowCost;mesh.receiveShadow=!lowCost;mesh.normalizeSkinWeights();
 }
 let hiddenVertices=0;
 if(hiding){
  const h=hiding as {keys:string;scale:number};const keys=hiddenKeys(h.keys);
  for(const skin of skins){
   const old=skin.geometry,geo=cloneOwnedGeometry(old),p=geo.getAttribute('position');
   const indices=geo.index?Array.from(geo.index.array):Array.from({length:p.count},(_,i)=>i);
   // A garment's coverage map must never amputate the real forearms.
   // Preserve vertices weighted to shoulder, upper arm or forearm bones;
   // keep only hands/wrists hidden where the gloves actually cover them.
   const joints=geo.getAttribute('skinIndex'),weights=geo.getAttribute('skinWeight');
   const armIds=new Set<number>();
   skin.skeleton.bones.forEach((bone,index)=>{if(/^(Left|Right)(Shoulder|Arm|ForeArm)$/.test(bone.name))armIds.add(index);});
   const keep=new Uint8Array(p.count);
   if(joints&&weights&&armIds.size){
    for(let i=0;i<p.count;i++){
     for(let k=0;k<4;k++){
      if(armIds.has(joints.getComponent(i,k))&&weights.getComponent(i,k)>.22){keep[i]=1;break;}
     }
    }
   }
   const r=maskBody(p.array,indices,keys,h.scale,keep);hiddenVertices+=r.matched;
   geo.setIndex(new BufferAttribute(p.count>65535?new Uint32Array(r.index):new Uint16Array(r.index),1));skin.geometry=geo;
  }
 }
 return {garments:garments.length,hiddenVertices};
}
/**
 * Real-world skin response: preserve the source colour/normal maps while using
 * subdued broad specular highlights and micro-bump. Skin is neither chrome nor
 * satin; fabric/leather have their own, distinct response.
 * The source geometry remains unchanged: no fabricated facial detail.
 */
export function enhanceHumanMaterial(scene:Object3D,lowCost=false):void{
 scene.traverse(o=>{
  const mesh=o as Mesh;
  if(!mesh.isMesh)return;
  mesh.frustumCulled=false;
  mesh.castShadow=!lowCost;
  mesh.receiveShadow=!lowCost;
  const originals=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  const result=originals.map(original=>{
   const m=original as MeshStandardMaterial;
   if(!m)return original;
   if(m.map){m.map.colorSpace=SRGBColorSpace;m.map.anisotropy=lowCost?2:6;}
   if(m.normalMap)m.normalMap.anisotropy=lowCost?2:6;
   if(/opacity/i.test(m.name)){
    const clone=m.clone();
    clone.alphaTest=.4;clone.transparent=false;
    return clone;
   }
   const isFace=/head|face/i.test(m.name);
   const params={
    name:m.name,
    color:m.color.clone(),
    map:m.map??null,
    normalMap:m.normalMap??null,
    normalScale:m.normalScale?.clone().multiplyScalar(lowCost?.7:.85),
    roughness:isFace?.64:.73,
    metalness:0,
    vertexColors:m.vertexColors,
    side:m.side
   };
   if(lowCost)return new MeshStandardMaterial(params);
   return new MeshPhysicalMaterial({
    ...params,
    ior:1.42,
    specularIntensity:isFace?.30:.24,
    specularColor:'#fff4eb',
    clearcoat:isFace?.022:.012,
    clearcoatRoughness:.76,
    sheen:.025,
    sheenRoughness:.95,
    sheenColor:'#dab4a0'
   });
  });
  mesh.material=Array.isArray(mesh.material)?result:result[0];
 });
}
