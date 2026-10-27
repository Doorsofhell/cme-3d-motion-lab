const KEY='cme3d:auto-clear-cache';
export function autoClearEnabled():boolean{
 try{return localStorage.getItem(KEY)==='true';}catch{return false;}
}
export function setAutoClearEnabled(value:boolean):void{
 try{localStorage.setItem(KEY,String(value));}catch{/* Storage may be disabled. */}
}
/** Clears this app's Cache Storage and unregisters only its scoped service workers.
 * Does not erase localStorage, IndexedDB, or data from other GitHub Pages apps.
 */
export async function clearApplicationCache():Promise<{caches:number;workers:number}>{
 let cachesRemoved=0,workersRemoved=0;
 const base=new URL(import.meta.env.BASE_URL,location.origin).pathname;
 if('caches' in window){
  const keys=await caches.keys();
  for(const key of keys){
   // GitHub Pages may share origin with other projects: avoid deleting their caches.
   if(key.includes('cme-3d')||key.includes('cme3d')||key.includes('motion-lab')){
    if(await caches.delete(key))cachesRemoved++;
   }
  }
 }
 if('serviceWorker' in navigator){
  const regs=await navigator.serviceWorker.getRegistrations();
  for(const reg of regs){
   if(new URL(reg.scope).pathname.startsWith(base)&&await reg.unregister())workersRemoved++;
  }
 }
 return {caches:cachesRemoved,workers:workersRemoved};
}
