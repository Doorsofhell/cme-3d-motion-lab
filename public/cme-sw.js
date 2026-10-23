/* Scoped service worker, works under GitHub Pages /cme-3d-motion-lab/. */
const VERSION='cme3d-lab-v0-5-1';
const BASE=new URL(self.registration.scope).pathname;
const files=['index.html','manifest.webmanifest','cme-icon-192.png','cme-icon-512.png'];
self.addEventListener('install',e=>{
 e.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(files.map(p=>BASE+p))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('cme3d-') && k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
 const req=e.request, url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(BASE))return;
 const rel=url.pathname.slice(BASE.length);
 if(rel===''||rel==='index.html'||rel.startsWith('fighters/')||rel.startsWith('draco/')){
  e.respondWith(fetch(req).then(res=>{
   if(res.ok){const copy=res.clone();caches.open(VERSION).then(c=>c.put(req,copy));}
   return res;
  }).catch(()=>caches.match(req).then(cached=>cached||Response.error())));
  return;
 }
 if(rel.startsWith('assets/')||rel.startsWith('cme-icon-')||rel==='manifest.webmanifest'){
  e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
   if(res.ok){const copy=res.clone();caches.open(VERSION).then(c=>c.put(req,copy));}
   return res;
  })));
 }
});
