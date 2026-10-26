import {CanvasTexture,Color,SRGBColorSpace,Texture} from 'three';
/** Restaurer des carnations claires ET foncées sans empiler les teintures.
 * Les nuances s'appliquent sur la copie non modifiée du GLB ; pores/grain restent.
 */
const textures=new WeakMap<Texture,Map<string,CanvasTexture>>();
export function retintSkinPixels(source:Uint8ClampedArray,target:Color):Uint8ClampedArray{
 const result=new Uint8ClampedArray(source.length);
 const total=[0,0,0];let count=0;
 for(let i=0;i<source.length;i+=4){
  if(source[i+3]<24)continue;
  for(let j=0;j<3;j++)total[j]+=source[i+j];
  count++;
 }
 const means=total.map(x=>Math.max(4,x/Math.max(count,1)));
 const hex='#'+target.getHexString();
 const rgb=[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];
 for(let i=0;i<source.length;i+=4){
  for(let j=0;j<3;j++)result[i+j]=Math.min(255,Math.round(rgb[j]*Math.pow(Math.max(0,source[i+j])/means[j],.72)));
  result[i+3]=source[i+3];
 }
 return result;
}
export function recolorSkinTexture(original:Texture,tone:string):CanvasTexture|null{
 if(typeof document==='undefined')return null;
 const image=original.image as {width?:number;height?:number}|undefined;
 if(!image||!image.width||!image.height)return null;
 const width=image.width,height=image.height;
 if(width*height>4096*4096)return null;
 let entries=textures.get(original);
 if(!entries){entries=new Map();textures.set(original,entries);}
 const stored=entries.get(tone);
 if(stored)return stored;
 try{
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d',{willReadFrequently:true});
  if(!context)return null;
  context.drawImage(original.image as CanvasImageSource,0,0,width,height);
  const pixels=context.getImageData(0,0,width,height);
  pixels.data.set(retintSkinPixels(pixels.data,new Color(tone)));
  context.putImageData(pixels,0,0);
  const tex=new CanvasTexture(canvas);
  tex.colorSpace=SRGBColorSpace;
  tex.flipY=original.flipY;
  tex.wrapS=original.wrapS;tex.wrapT=original.wrapT;
  tex.repeat.copy(original.repeat);tex.offset.copy(original.offset);
  tex.anisotropy=original.anisotropy;
  tex.magFilter=original.magFilter;tex.minFilter=original.minFilter;
  tex.generateMipmaps=original.generateMipmaps;
  tex.needsUpdate=true;
  entries.set(tone,tex);
  // Avoid accumulating unbounded GPU textures if users select many custom colors.
  if(entries.size>14){const first=entries.keys().next().value;if(first){const old=entries.get(first);entries.delete(first);old?.dispose();}}
  return tex;
 }catch{/* Texture CORS / canvas inaccessible : conserver le rendu standard. */}
 return null;
}
