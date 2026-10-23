/* Image is captured locally on user interaction: never uploaded from this browser. */
export interface SnapshotContext {
 actor:string;discipline:string;technique:string;renderStyle:string;progress:number;
}
export function snapshotFilename(input:SnapshotContext):string{
 const clean=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,32);
 const stamp=new Date().toISOString().replace(/[:.]/g,'-');
 return 'CME3D_'+clean(input.actor)+'_'+clean(input.technique)+'_'+stamp+'.png';
}
export function captureFighterImage(
 source:HTMLCanvasElement,
 render:()=>void,
 context:SnapshotContext
):string|null{
 try{
  if(!source.width||!source.height)return null;
  // Synchronously repaint immediately before copying: WebGL does not preserve
  // its drawing buffer between frames on mobile.
  render();
  const width=Math.min(source.width,1250);
  const sceneHeight=Math.max(1,Math.round(source.height*width/source.width));
  const header=64,footer=76;
  const output=document.createElement('canvas');
  output.width=width;output.height=sceneHeight+header+footer;
  const ctx=output.getContext('2d');
  if(!ctx)return null;
  ctx.fillStyle='#101e2e';ctx.fillRect(0,0,output.width,output.height);
  ctx.fillStyle='#72e5d1';ctx.font='bold 22px system-ui, sans-serif';
  ctx.fillText('CME-3D · Capture du combattant',18,27);
  ctx.font='14px system-ui, sans-serif';ctx.fillStyle='#d9e8f6';
  ctx.fillText(context.actor+' · '+context.discipline+' · '+context.technique,18,49,width-36);
  ctx.drawImage(source,0,header,width,sceneHeight);
  ctx.fillStyle='#13273a';ctx.fillRect(0,sceneHeight+header,width,footer);
  ctx.fillStyle='#e6f4fa';ctx.font='14px system-ui, sans-serif';
  ctx.fillText('Rendu : '+context.renderStyle+' · Animation : '+Math.round(context.progress*100)+' %',18,sceneHeight+header+24,width-36);
  ctx.fillStyle='#9bb4c6';ctx.font='12px system-ui, sans-serif';
  ctx.fillText('Généré localement · '+new Date().toLocaleString('fr-FR'),18,sceneHeight+header+48,width-36);
  return output.toDataURL('image/png');
 }catch{return null;}
}
