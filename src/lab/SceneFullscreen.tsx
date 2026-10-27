import {useEffect,useRef,useState,type MouseEvent,type TouchEvent} from 'react';

/** Un unique plein écran natif (avec repli CSS) et des gestes cohérents par scène. */
export function useSceneFullscreen(){
 const ref=useRef<HTMLElement>(null);
 const lastTap=useRef(0);
 // Expiration évitant de supprimer le prochain véritable double-clic desktop.
 const ignoreSyntheticClick=useRef(0);
 const inFlight=useRef(false);
 const [fullscreen,setFullscreen]=useState(false);
 useEffect(()=>{
  const sync=()=>{inFlight.current=false;setFullscreen(document.fullscreenElement===ref.current);};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.fullscreenElement)setFullscreen(false);};
  document.addEventListener('fullscreenchange',sync);
  window.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('fullscreenchange',sync);window.removeEventListener('keydown',escape);};
 },[]);
 const toggle=()=>{
  const element=ref.current;
  if(!element||inFlight.current)return;
  if(document.fullscreenElement===element){
   inFlight.current=true;
   void document.exitFullscreen().catch(()=>setFullscreen(false)).finally(()=>{inFlight.current=false;});
   return;
  }
  // Sortir du repli CSS si l'API native a été refusée sur l'appareil.
  if(fullscreen&&!document.fullscreenElement){setFullscreen(false);return;}
  if(element.requestFullscreen){
   inFlight.current=true;
   void element.requestFullscreen().catch(()=>setFullscreen(true)).finally(()=>{inFlight.current=false;});
   return;
  }
  setFullscreen(v=>!v);
 };
 const isControl=(target:EventTarget)=>target instanceof Element&&!!target.closest('button,input,select,textarea,summary,a');
 const onDoubleClick=(event:MouseEvent<HTMLElement>)=>{
  if(ignoreSyntheticClick.current>Date.now()){ignoreSyntheticClick.current=0;return;}
  if(!isControl(event.target))toggle();
 };
 const onTouchEnd=(event:TouchEvent<HTMLElement>)=>{
  if(isControl(event.target)||event.touches.length>0||event.changedTouches.length!==1)return;
  const now=Date.now();
  if(now-lastTap.current>0&&now-lastTap.current<350){
   event.preventDefault();
   lastTap.current=0;
   ignoreSyntheticClick.current=now+700;
   toggle();
  }else lastTap.current=now;
 };
 return {ref,fullscreen,toggle,onDoubleClick,onTouchEnd};
}
export function SceneFullscreenButton({fullscreen,onClick}:{fullscreen:boolean;onClick:()=>void}){
 return <button type="button" className="cmeFullscreenToggle" onClick={event=>{event.stopPropagation();onClick();}} aria-label={fullscreen?'Quitter le plein écran':'Agrandir la scène 3D'}>{fullscreen?'Réduire ✕':'⛶'}</button>;
}
