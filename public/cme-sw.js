/* Offline worker. The registration URL carries the app version (?v=0.7.x).
 * Navigations: network-first, cached shell as offline fallback.
 * Hashed bundles (/assets/): cache-first, dropped when the version changes.
 * 3D models and decoders: stale-while-revalidate, kept across versions. */
const VERSION=new URL(self.location.href).searchParams.get('v')||'dev';
const SHELL='cme3d-shell-'+VERSION,MODELS='cme3d-models';
const BASE=new URL(self.registration.scope).pathname;
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(SHELL);
 try{
  // Precache the shell and the hashed bundles it references, so the first offline launch works.
  const response=await fetch(BASE,{cache:'no-store'});
  if(response.ok){
   const html=await response.clone().text();
   const bundles=[...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)].map(match=>new URL(match[1],self.registration.scope).href);
   await cache.put(BASE,response);
   await cache.addAll([BASE+'manifest.webmanifest',...bundles]);
  }
 }catch{/* Offline install: the shell will be cached on the next online navigation. */}
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key.startsWith('cme3d-')&&key!==SHELL&&key!==MODELS).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
async function networkFirstShell(request){
 const cache=await caches.open(SHELL);
 try{
  const response=await fetch(request);
  if(response.ok)await cache.put(BASE,response.clone());
  return response;
 }catch{
  return (await cache.match(BASE))??Response.error();
 }
}
async function cacheFirst(request,name){
 const cache=await caches.open(name);
 const cached=await cache.match(request,{ignoreVary:true});
 if(cached)return cached;
 const response=await fetch(request);
 if(response.ok)await cache.put(request,response.clone());
 return response;
}
async function staleWhileRevalidate(event,name){
 const cache=await caches.open(name);
 const cached=await cache.match(event.request,{ignoreVary:true});
 const network=fetch(event.request).then(async response=>{
  if(response.ok)await cache.put(event.request,response.clone());
  return response;
 });
 if(cached){event.waitUntil(network.catch(()=>{}));return cached;}
 return network;
}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(BASE))return;
 if(request.mode==='navigate'){event.respondWith(networkFirstShell(request));return;}
 if(url.pathname.startsWith(BASE+'assets/')){event.respondWith(cacheFirst(request,SHELL));return;}
 if(/\/(fighters|draco|anatomie)\//.test(url.pathname)){event.respondWith(staleWhileRevalidate(event,MODELS));return;}
});
