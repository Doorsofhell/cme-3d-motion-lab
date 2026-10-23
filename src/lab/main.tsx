import {autoClearEnabled,clearApplicationCache} from './cachePolicy';
// Run before mounting the 3D app; disable the caching worker in test mode.
if(autoClearEnabled()){
 try{await clearApplicationCache();}catch(error){console.warn('CME-3D: cache cleanup failed',error);}
}else if('serviceWorker' in navigator){
 navigator.serviceWorker.register(import.meta.env.BASE_URL+'cme-sw.js').catch(()=>{});
}
import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
