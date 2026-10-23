/** WebGL loss and recovery during an active 3D session. */
export function watchWebGLContext(
 target:EventTarget,
 handlers:{onLost:()=>void;onRestored:()=>void}
):()=>void{
 let disposed=false;
 const lost=(event:Event)=>{
  event.preventDefault();
  if(!disposed)handlers.onLost();
 };
 const restored=()=>{if(!disposed)handlers.onRestored();};
 target.addEventListener('webglcontextlost',lost);
 target.addEventListener('webglcontextrestored',restored);
 return ()=>{
  disposed=true;
  target.removeEventListener('webglcontextlost',lost);
  target.removeEventListener('webglcontextrestored',restored);
 };
}
