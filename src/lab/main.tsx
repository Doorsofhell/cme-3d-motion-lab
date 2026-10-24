import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import {autoClearEnabled,clearApplicationCache} from './cachePolicy';

// Mount immediately: never block the interface on Cache Storage or SW APIs.
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

// Cache cleanup runs after startup. A former service worker may still control
// this navigation; unregistration takes effect for future navigations.
if(autoClearEnabled()){
 void clearApplicationCache().catch(error=>console.warn('CME-3D: cache cleanup failed',error));
}else if('serviceWorker' in navigator){
 void navigator.serviceWorker.register(import.meta.env.BASE_URL+'cme-sw.js').catch(()=>{});
}
