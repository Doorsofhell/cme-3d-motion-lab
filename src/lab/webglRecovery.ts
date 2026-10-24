/** WebGL loss and recovery during an active 3D session.
 * The renderer may intentionally lose its context while replacing a canvas.
 * Ignore events from canvases no longer owned by the active viewer.
 */
export function watchWebGLContext(
 target:EventTarget,
 handlers:{onLost:()=>void;onRestored:()=>void},
 isActive:()=>boolean=()=>true
):()=>void{
 let disposed=false;
 const active=()=>!disposed&&isActive();
 const lost=(event:Event)=>{
  if(!active())return;
  event.preventDefault();
  handlers.onLost();
 };
 const restored=()=>{if(active())handlers.onRestored();};
 target.addEventListener('webglcontextlost',lost);
 target.addEventListener('webglcontextrestored',restored);
 return ()=>{
  disposed=true;
  target.removeEventListener('webglcontextlost',lost);
  target.removeEventListener('webglcontextrestored',restored);
 };
}
