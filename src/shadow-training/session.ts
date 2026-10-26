import type {Plan,PlanItem} from './plan';
import {ActiveTimer} from './timer';
export type PhaseShadow='pret'|'decompte'|'travail'|'repos'|'termine';
export type ShadowSessionState={
 phase:PhaseShadow;paused:boolean;itemIndex:number;round:number;reps:number;
 remaining:number|null;sessionSec:number;speed:number;banner:string|null;
};
const COUNTDOWN=3.6, BETWEEN_ITEMS=15;
/** Port sans suivi ni audio du cycle temporel Shadow : décompte, travail, repos,
 * changements de rounds, séances programmées, pause, reprise. Horloge injectable.
 * La logique de choix est importée du dépôt Shadow au commit figé.
 */
export class ShadowTrainingMachine{
 private readonly timer:ActiveTimer;
 private readonly active:ActiveTimer;
 private state:ShadowSessionState;
 private phaseLength=0;
 private pendingItem=false;
 constructor(public readonly plan:Plan,now:()=>number=()=>performance.now()){
  this.timer=new ActiveTimer(now);this.active=new ActiveTimer(now);
  this.state={phase:'pret',paused:false,itemIndex:Math.max(0,plan.start),round:1,reps:0,remaining:null,sessionSec:0,
   speed:plan.items[Math.max(0,plan.start)]?.speed??.7,banner:null};
 }
 snapshot():ShadowSessionState{return {...this.state};}
 get item():PlanItem|undefined{return this.plan.items[this.state.itemIndex];}
 private enter(phase:PhaseShadow,seconds:number,banner:string|null=null){
  this.state.phase=phase;this.phaseLength=seconds;this.timer.reset();
  this.state.remaining=phase==='decompte'||phase==='repos'||(phase==='travail'&&seconds>0)?seconds:null;
  this.state.banner=banner;
  if(!this.state.paused)this.timer.start();
  if(phase==='travail'&&!this.state.paused)this.active.start();else this.active.pause();
 }
 start(){
  if(!this.item)return;
  if(this.state.phase==='termine'){this.state.itemIndex=Math.max(0,this.plan.start);this.state.round=1;this.state.reps=0;}
  this.state.paused=false;this.state.banner=null;
  this.enter('decompte',COUNTDOWN);
 }
 pause(){
  if(this.state.paused||this.state.phase==='pret'||this.state.phase==='termine')return;
  this.state.paused=true;this.timer.pause();this.active.pause();
 }
 resume(){
  if(!this.state.paused)return;
  this.state.paused=false;this.timer.start();
  if(this.state.phase==='travail')this.active.start();
 }
 restart(){
  this.state.round=1;this.state.reps=0;this.state.paused=false;
  this.start();
 }
 goto(index:number){
  if(index<0||index>=this.plan.items.length)return;
  this.timer.pause();this.active.pause();
  this.state.itemIndex=index;this.state.round=1;this.state.reps=0;this.state.paused=false;
  this.state.speed=this.plan.items[index].speed;
  this.enter('pret',0);
 }
 setSpeed(v:number){this.state.speed=Math.min(1.5,Math.max(.25,v));}
 onRep(){if(this.state.phase==='travail'&&!this.state.paused)this.state.reps++;}
 tick(){
  if(this.state.paused)return this.snapshot();
  const sec=this.timer.elapsed/1000;
  const remaining=this.phaseLength-sec;
  this.state.sessionSec=this.active.elapsed/1000;
  const it=this.item;
  if(this.state.phase==='decompte'&&remaining<=0){
   this.enter('travail',it?.work??0);
  }else if(this.state.phase==='travail'&&it?.work&&remaining<=0){
   if(this.state.round<it.rounds){
    this.state.round++;
    if(it.roundRest>0)this.enter('repos',it.roundRest);
    else this.enter('travail',it.work);
   }else if(this.state.itemIndex<this.plan.items.length-1){
    this.state.itemIndex++;this.state.round=1;this.state.reps=0;
    this.state.speed=this.item?.speed??.7;
    this.enter('repos',Math.max(BETWEEN_ITEMS,Math.min(it.roundRest,30)), 'Prochain : '+(this.item?.label??this.item?.name));
   }else this.enter('termine',0);
  }else if(this.state.phase==='repos'&&remaining<=0){
   this.enter('travail',this.item?.work??0);
  }
  const timed=this.state.phase==='decompte'||this.state.phase==='repos'||(this.state.phase==='travail'&&!!this.item?.work);
  this.state.remaining=timed?Math.max(0,this.phaseLength-this.timer.elapsed/1000):null;
  return this.snapshot();
 }
}
