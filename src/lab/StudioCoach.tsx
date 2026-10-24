import {useRef,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import './StudioCoach.css';

type Category='corps'|'visage'|'peau'|'cheveux'|'tenue'|'protections';
export type CoachLook={
 sex:'homme'|'femme';height:number;shoulders:number;muscle:number;waist:number;
 jaw:number;nose:number;eyes:number;skin:string;eyeColor:string;
 hairStyle:'rase'|'court'|'long';hairColor:string;
 top:'rashguard'|'tshirt'|'aucun';topColor:string;
 bottom:'short'|'legging';bottomColor:string;
 gloves:'boxe'|'mma'|'aucun';gloveColor:string;
 shins:boolean;shinColor:string;
};
export const defaultCoachLook:CoachLook={
 sex:'homme',height:1,shoulders:1,muscle:1,waist:1,jaw:1,nose:1,eyes:1,
 skin:'#b97a56',eyeColor:'#4a2f1e',hairStyle:'court',hairColor:'#201713',
 top:'rashguard',topColor:'#252934',bottom:'short',bottomColor:'#d6363c',
 gloves:'boxe',gloveColor:'#d6363c',shins:false,shinColor:'#20232c'
};
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(v)?v:min));
export function normalizeCoachLook(input:Partial<CoachLook>):CoachLook{
 const out={...defaultCoachLook,...input};
 const num=(k:'height'|'shoulders'|'muscle'|'waist'|'jaw'|'nose'|'eyes',a:number,b:number)=>{out[k]=clamp(out[k],a,b);};
 num('height',.9,1.1);num('shoulders',.75,1.25);num('muscle',.7,1.35);num('waist',.75,1.3);
 num('jaw',.8,1.2);num('nose',.8,1.2);num('eyes',.8,1.2);
 for(const k of ['skin','eyeColor','hairColor','topColor','bottomColor','gloveColor','shinColor'] as const){
  if(!/^#[0-9a-fA-F]{6}$/.test(out[k]))out[k]=defaultCoachLook[k];
 }
 if(!['homme','femme'].includes(out.sex))out.sex='homme';
 if(!['rase','court','long'].includes(out.hairStyle))out.hairStyle='court';
 if(!['rashguard','tshirt','aucun'].includes(out.top))out.top='rashguard';
 if(!['short','legging'].includes(out.bottom))out.bottom='short';
 if(!['boxe','mma','aucun'].includes(out.gloves))out.gloves='boxe';
 out.shins=out.shins===true;
 return out;
}
export function parseCoachLookJson(text:string):CoachLook{
 const parsed:unknown=JSON.parse(text);
 if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('Format JSON invalide');
 const doc=parsed as Record<string,unknown>;
 if(doc.schema!=='cme-coach-look-v1')throw Error('Version de profil non prise en charge');
 if(!doc.look||typeof doc.look!=='object'||Array.isArray(doc.look))throw Error('Apparence absente');
 const input=doc.look as Record<string,unknown>;
 const required=Object.keys(defaultCoachLook);
 if(required.some(k=>!(k in input)))throw Error('Profil incomplet');
 for(const k of required){
  const expected=typeof defaultCoachLook[k as keyof CoachLook];
  if(typeof input[k]!==expected)throw Error('Type de paramètre incorrect : '+k);
 }
 return normalizeCoachLook(input as CoachLook);
}
function Mannequin({look}:{look:CoachLook}){
 const skin=look.skin,top=look.top==='aucun'?skin:look.topColor;
 const h=look.height,shoulder=look.shoulders*(look.sex==='femme'?.94:1),arm=look.muscle,waist=look.waist;
 return <group scale={[1,h,1]} position={[0,-.1,0]}>
  <mesh position={[0,1.62,0]} scale={[.21*look.jaw,.27,.19]}><sphereGeometry args={[1,20,16]}/><meshStandardMaterial color={skin} roughness={.86}/></mesh>
  <mesh position={[0,1.6,.194]} scale={[.045*look.nose,.075*look.nose,.06*look.nose]}><sphereGeometry args={[1,14,10]}/><meshStandardMaterial color={skin}/></mesh>
  {look.hairStyle!=='rase'&&<mesh position={[0,1.83,-.015]} scale={[.21,look.hairStyle==='long'?.19:.11,.19]}><sphereGeometry args={[1,20,12]}/><meshStandardMaterial color={look.hairColor}/></mesh>}
  {[-1,1].map(s=><group key={s}>
   <mesh position={[s*.083,1.65,.177]} scale={[.036*look.eyes,.026,.018]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color={look.eyeColor}/></mesh>
   <mesh position={[s*.32*shoulder,1.13,0]} rotation={[0,0,s*.13]} scale={[.105*arm,.36,.115]}><capsuleGeometry args={[1,1,6,12]}/><meshStandardMaterial color={top} roughness={.88}/></mesh>
   <mesh position={[s*.35*shoulder,.76,0]} scale={[.105*arm,.24,.1]}><capsuleGeometry args={[1,1,6,12]}/><meshStandardMaterial color={skin}/></mesh>
   <mesh position={[s*.35*shoulder,.49,.02]} scale={[look.gloves==='boxe'?.14:.105,.12,.12]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color={look.gloves==='aucun'?skin:look.gloveColor}/></mesh>
   <mesh position={[s*.15,.28,0]} scale={[.14,.42,.16]}><capsuleGeometry args={[1,1,6,12]}/><meshStandardMaterial color={look.bottom==='legging'?look.bottomColor:skin}/></mesh>
   <mesh position={[s*.15,-.28,0]} scale={[.11,.35,.12]}><capsuleGeometry args={[1,1,6,12]}/><meshStandardMaterial color={look.shins?look.shinColor:look.bottom==='legging'?look.bottomColor:skin}/></mesh>
   <mesh position={[s*.15,-.73,.11]} scale={[.12,.075,.24]}><sphereGeometry args={[1,14,10]}/><meshStandardMaterial color={skin}/></mesh>
  </group>)}
  <mesh position={[0,1.13,0]} scale={[.32*shoulder,.43,.19*arm]}><capsuleGeometry args={[1,1,8,16]}/><meshStandardMaterial color={top}/></mesh>
  <mesh position={[0,.68,0]} scale={[.25*waist,.22,.16]}><sphereGeometry args={[1,18,12]}/><meshStandardMaterial color={top}/></mesh>
  <mesh position={[0,.46,0]} scale={[.26,.19,.18]}><sphereGeometry args={[1,18,12]}/><meshStandardMaterial color={look.bottomColor}/></mesh>
 </group>;
}
const sections:Category[]=['corps','visage','peau','cheveux','tenue','protections'];
export function StudioCoach(){
 const [look,setLook]=useState<CoachLook>(defaultCoachLook);
 const [section,setSection]=useState<Category>('corps');
 const [message,setMessage]=useState('');
 const importRef=useRef<HTMLInputElement>(null);
 const update=<K extends keyof CoachLook>(key:K,value:CoachLook[K])=>setLook(l=>normalizeCoachLook({...l,[key]:value}));
 const range=(key:'height'|'shoulders'|'muscle'|'waist'|'jaw'|'nose'|'eyes',label:string,min:number,max:number)=><label className="coachField"><span>{label} <b>{look[key].toFixed(2)}</b></span><input type="range" min={min} max={max} step=".01" value={look[key]} onChange={e=>update(key,Number(e.target.value))}/></label>;
 const color=(key:'skin'|'eyeColor'|'hairColor'|'topColor'|'bottomColor'|'gloveColor'|'shinColor',label:string)=><label className="coachColor"><span>{label}</span><input type="color" value={look[key]} onChange={e=>update(key,e.target.value)}/></label>;
 const choose=<K extends 'sex'|'hairStyle'|'top'|'bottom'|'gloves'>(key:K,label:string,values:CoachLook[K][])=><label className="coachField"><span>{label}</span><select value={look[key]} onChange={e=>update(key,e.target.value as CoachLook[K])}>{values.map(v=><option key={v} value={v}>{v}</option>)}</select></label>;
 const importJson=async(file:File|undefined)=>{
  if(!file)return;
  try{
   if(file.size>100_000)throw Error('Fichier trop volumineux');
   const next=parseCoachLookJson(await file.text());
   setLook(next);setMessage('Profil importé et paramètres validés.');
  }catch(error){setMessage('Import refusé : '+(error instanceof Error?error.message:'fichier invalide'));}
 };
 const exportJson=()=>{const json=JSON.stringify({schema:'cme-coach-look-v1',look},null,2);const blob=new Blob([json],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='cme-coach-look.json';a.click();URL.revokeObjectURL(url);setMessage('Configuration exportée : apparence uniquement, sans modification du moteur.');};
 return <section className="coachStudio" aria-label="Studio Coach">
  <header className="coachStudioHeader"><div><small>STUDIO COACH · PROTOTYPE 3D</small><h2>Créer un combattant</h2></div><button onClick={()=>{setLook(defaultCoachLook);setMessage('Apparence réinitialisée');}}>Réinitialiser</button></header>
  <div className="coachStudioLayout">
   <div className="coachPreview" aria-label="Aperçu 3D permanent du mannequin personnalisable">
    <Canvas camera={{position:[0,1.05,3.4],fov:38}} dpr={[1,1.5]} gl={{antialias:true}}>
     <color attach="background" args={['#171920']}/><ambientLight intensity={1.4}/><directionalLight position={[3,5,4]} intensity={2.1}/>
     <Mannequin look={look}/><OrbitControls target={[0,.65,0]} enablePan={false} minDistance={2.2} maxDistance={5}/>
    </Canvas>
    <span className="coachPreviewLabel">Mannequin procédural · aperçu d'apparence, non rig canonique validé</span>
   </div>
   <div className="coachEditor">
    <nav className="coachCategories" aria-label="Catégories de personnalisation">{sections.map(s=><button key={s} className={section===s?'active':''} onClick={()=>setSection(s)}>{({corps:'Corps',visage:'Visage',peau:'Peau',cheveux:'Cheveux',tenue:'Tenue',protections:'Protections'} as Record<Category,string>)[s]}</button>)}</nav>
    <div className="coachFields">
     {section==='corps'&&<>{choose('sex','Base morphologique',['homme','femme'])}{range('height','Taille relative',.9,1.1)}{range('shoulders','Épaules',.75,1.25)}{range('muscle','Musculature',.7,1.35)}{range('waist','Taille',.75,1.3)}</>}
     {section==='visage'&&<>{range('jaw','Mâchoire',.8,1.2)}{range('nose','Nez',.8,1.2)}{range('eyes','Yeux',.8,1.2)}{color('eyeColor','Couleur des yeux')}</>}
     {section==='peau'&&color('skin','Teint')}
     {section==='cheveux'&&<>{choose('hairStyle','Coiffure',['rase','court','long'])}{color('hairColor','Couleur des cheveux')}</>}
     {section==='tenue'&&<>{choose('top','Haut',['rashguard','tshirt','aucun'])}{color('topColor','Couleur du haut')}{choose('bottom','Bas',['short','legging'])}{color('bottomColor','Couleur du bas')}</>}
     {section==='protections'&&<>{choose('gloves','Gants',['boxe','mma','aucun'])}{color('gloveColor','Couleur des gants')}<label className="coachField"><span>Protège-tibias</span><input type="checkbox" checked={look.shins} onChange={e=>update('shins',e.target.checked)}/></label>{color('shinColor','Couleur des protections')}</>}
    </div>
    <div className="coachActions">
      <button onClick={exportJson}>Exporter JSON</button>
      <button onClick={()=>importRef.current?.click()}>Importer JSON</button>
      <input ref={importRef} type="file" accept=".json,application/json" hidden aria-label="Fichier de profil Coach" onChange={e=>{void importJson(e.target.files?.[0]);e.target.value='';}}/>
     </div>
    {message&&<p role="status" className="coachStatus">{message}</p>}
   </div>
  </div>
 </section>;
}
