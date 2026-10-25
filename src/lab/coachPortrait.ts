/** Garde-fous d'image galerie : aucun portrait vide, tout noir ou trop volumineux. */
export function portraitLooksValid(data:string):boolean{
 return /^data:image\/jpeg;base64,[A-Za-z0-9+/=]{500,}$/.test(data)&&data.length<320_000;
}
export function captureCoachPortrait(source:HTMLCanvasElement):string|null{
 if(!source.width||!source.height)return null;
 try{
  const out=document.createElement('canvas');
  out.width=256;out.height=320;
  const ctx=out.getContext('2d',{willReadFrequently:true});
  if(!ctx)return null;
  ctx.fillStyle='#dce5ee';ctx.fillRect(0,0,out.width,out.height);
  // Conserve le cadrage complet, sans étirer le coach.
  const scale=Math.min(out.width/source.width,out.height/source.height);
  const w=source.width*scale,h=source.height*scale;
  ctx.drawImage(source,(out.width-w)/2,(out.height-h)/2,w,h);
  // Surfaces WebGL perdues / non rendues donnent des images uniformes.
  const pixels=ctx.getImageData(0,0,out.width,out.height).data;
  const samples:[[number,number],[number,number],[number,number],[number,number]]=[[128,80],[128,140],[128,210],[128,265]];
  const codes=samples.map(([x,y])=>{const i=(y*out.width+x)*4;return pixels[i]+','+pixels[i+1]+','+pixels[i+2];});
  if(new Set(codes).size<2)return null;
  const image=out.toDataURL('image/jpeg',.78);
  return portraitLooksValid(image)?image:null;
 }catch{return null;}
}
