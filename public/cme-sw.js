/* Optional offline worker. Network-first for HTML and JS to avoid stale releases. */
const VERSION='cme3d-lab-v0-7-6';
const BASE=new URL(self.registration.scope).pathname;
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key.startsWith('cme3d-')&&key!==VERSION).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(BASE))return;
 // Never intercept HTML, JS or CSS. Let the browser fetch the deployed release.
 if(request.mode==='navigate'||url.pathname.endsWith('.html')||url.pathname.endsWith('.js')||url.pathname.endsWith('.css')||url.pathname.includes('/assets/'))return;
 if(!url.pathname.includes('/fighters/')&&!url.pathname.includes('/draco/'))return;
 event.respondWith(fetch(request).catch(async()=>{
  const cached=await caches.match(request);
  return cached??Response.error();
 }));
});
