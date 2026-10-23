/**
 * Keep the WebGL canvas alive while the browser/GPU restores its context.
 * Three.js recreates its GL resources after webglcontextrestored; the UI must
 * also leave the error state or the scene stays hidden behind the overlay.
 */
export function watchWebGLContext(
 target:EventTarget,
 callbacks:{onLost:()=>void;onRestored:()=>void}
):()=>void{
 const lost=(event:Event)=>{event.preventDefault();callbacks.onLost();};
 const restored=()=>callbacks.onRestored();
 target.addEventListener('webglcontextlost',lost);
 target.addEventListener('webglcontextrestored',restored);
 return ()=>{
  target.removeEventListener('webglcontextlost',lost);
  target.removeEventListener('webglcontextrestored',restored);
 };
}
