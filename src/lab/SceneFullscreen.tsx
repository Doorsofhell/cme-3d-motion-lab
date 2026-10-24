import {useEffect,useRef,useState,type MouseEvent,type TouchEvent,type ReactNode} from 'react';

/** Contrôle 3D partagé : même plein écran, mêmes gestes et même bouton partout. */
export function useSceneFullscreen(){
 const ref=useRef<HTMLElement>(null);
 const lastTap=useRef(0);
 const [fullscreen,setFullscreen]=useState(false);
 useEffect(()=>{
  const sync=()=>setFullscreen(document.fullscreenElement===ref.current);
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.fullscreenElement)setFullscreen(false);};
  document.addEventListener('fullscreenchange',sync);
  window.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('fullscreenchange',sync);window.removeEventListener('keydown',escape);};
 },[]);
 const toggle=()=>{
  const element=ref.current;
  if(!element)return;
  if(document.fullscreenElement===element){void document.exitFullscreen().catch(()=>setFullscreen(false));return;}
  if(element.requestFullscreen){void element.requestFullscreen().catch(()=>setFullscreen(v=>!v));return;}
  setFullscreen(v=>!v);
 };
 const isControl=(target:EventTarget)=>target instanceof Element&&!!target.closest('button,input,select,textarea,summary,a');
 const onDoubleClick=(event:MouseEvent<HTMLElement>)=>{if(!isControl(event.target))toggle();};
 const onTouchEnd=(event:TouchEvent<HTMLElement>)=>{
  if(isControl(event.target))return;
  const now=Date.now();
  if(now-lastTap.current<350){event.preventDefault();lastTap.current=0;toggle();}
  else lastTap.current=now;
 };
 return {ref,fullscreen,toggle,onDoubleClick,onTouchEnd};
}
export function SceneFullscreenButton({fullscreen,onClick}:{fullscreen:boolean;onClick:()=>void}){
 return <button type="button" className="cmeFullscreenToggle" onClick={event=>{event.stopPropagation();onClick();}} aria-label={fullscreen?'Quitter le plein écran':'Agrandir la scène 3D'}>{fullscreen?'Réduire ✕':'⛶'}</button>;
}
