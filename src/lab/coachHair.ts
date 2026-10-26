import {Bone,Box3,CatmullRomCurve3,Color,CylinderGeometry,Group,Mesh,MeshStandardMaterial,Object3D,SphereGeometry,TubeGeometry,Vector3} from 'three';

/** Coupes procédurales VRAIMENT géométriques, non présentées comme des GLB premium.
 * Elles restent sur l'os de tête, donc suivent les 6 disciplines et les animations. */
export type HairStyle='rase'|'court'|'long'|'degrade'|'boucle'|'tresse'|'queue-haute'|'chignon';
export const HAIR_STYLES:readonly {id:HairStyle;label:string}[]=[
 {id:'rase',label:'Crâne rasé'},{id:'court',label:'Court texturé'},
 {id:'degrade',label:'Dégradé sportif'},{id:'boucle',label:'Boucles courtes'},
 {id:'long',label:'Cheveux longs'},{id:'queue-haute',label:'Queue haute'},
 {id:'tresse',label:'Tresse de sport'},{id:'chignon',label:'Chignon serré'}
];
const TAG='CME_COIFFURE_ADAPTATIVE';
const cheveux=(name:string)=>/(?:^|[_:\\s.-])(hair|cheveux|coiffure|scalp|chevelure)(?:$|[_:\\s.-])/i.test(name);
export function hasCoachHairAnchor(root:Object3D):boolean{
 let ok=false;root.traverse(o=>{if(o instanceof Bone&&/head$/i.test(o.name.replace(/[^a-z0-9]/gi,'')))ok=true;});return ok;
}
function nettoyer(g:Group){
 const geos=new Set<Mesh['geometry']>(),mats=new Set<MeshStandardMaterial>();
 g.traverse(o=>{const m=o as Mesh;if(!m.isMesh)return;geos.add(m.geometry);for(const x of (Array.isArray(m.material)?m.material:[m.material]))if(x instanceof MeshStandardMaterial)mats.add(x);});
 for(const x of geos)x.dispose();
 for(const x of mats)x.dispose();
}
export function applyCoachHair(root:Object3D,style:HairStyle,color:string):number{
 const old=root.getObjectByName(TAG) as Group|null;
 // Modification de teinte sans recréer les sommets à chaque événement du color picker.
 if(old&&old.userData.cmeStyle===style){
  let count=0;old.traverse(o=>{const m=o as Mesh;if(!m.isMesh)return;
   for(const mat of (Array.isArray(m.material)?m.material:[m.material]))if(mat instanceof MeshStandardMaterial){mat.color.set(color);count++;}
  });return count;
 }
 if(old){old.parent?.remove(old);nettoyer(old);}
 root.updateWorldMatrix(true,true);
 let bone:Bone|undefined,head:Mesh|undefined;
 root.traverse(o=>{
  if(!bone&&o instanceof Bone&&/head$/i.test(o.name.replace(/[^a-z0-9]/gi,'')))bone=o;
  const m=o as Mesh;
  if(!m.isMesh||m.userData.cmeHiddenSource)return;
  if(cheveux(m.name))m.visible=false;
  if(!head&&/(?:^|[_:-])(head|face)(?:$|[_:-])/i.test(m.name))head=m;
 });
 if(!bone)return 0;
 if(style==='rase')return 1;
 const bounds=new Box3();if(head)bounds.setFromObject(head);
 const center=bounds.isEmpty()?bone.getWorldPosition(new Vector3()).add(new Vector3(0,.10,0)):bounds.getCenter(new Vector3());
 const bSize=bounds.isEmpty()?new Vector3(.20,.28,.20):bounds.getSize(new Vector3());
 const w=Math.max(.14,Math.min(.29,bSize.x)),h=Math.max(.20,Math.min(.38,bSize.y)),d=Math.max(.15,Math.min(.30,bSize.z));
 const attach=new Group();attach.name=TAG;attach.userData.cmeStyle=style;
 attach.position.copy(bone.worldToLocal(center.clone()));
 const mat=new MeshStandardMaterial({name:'cme-cheveux-proceduraux',color:new Color(color),roughness:.88,metalness:0});
 const add=(geometry:SphereGeometry|TubeGeometry|CylinderGeometry,pos:[number,number,number]=[0,0,0],scale?:[number,number,number])=>{
  const mesh=new Mesh(geometry,mat);mesh.position.set(...pos);if(scale)mesh.scale.set(...scale);
  mesh.castShadow=false;mesh.receiveShadow=false;attach.add(mesh);return mesh;
 };
 // Calotte : aucun polygone du corps, de peau ou du rig n'est altéré.
 if(style==='degrade'){
  add(new SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI*.53),[0,h*.19,0],[w*.56,h*.30,d*.57]);
 }else{
  add(new SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI*.61),[0,h*.19,0],
   [w*.58,(style==='boucle'?.48:.52)*h,d*.59]);
 }
 const strand=(pts:Vector3[],radius:number,segments=10)=>add(new TubeGeometry(new CatmullRomCurve3(pts),segments,radius,5,false));
 if(style==='court'||style==='degrade'){
  const n=style==='court'?14:20;
  for(let i=0;i<n;i++){
   const angle=(i/(n-1)-.5)*2.25;
   const x=Math.sin(angle)*w*.39,z=Math.cos(angle)*d*.44;
   const lock=add(new SphereGeometry(1,7,5),[x,h*(style==='degrade'?.35:.28),z],
    [w*.078,h*(style==='degrade'?.065:.11),d*.085]);
   lock.rotation.z=.13*Math.sin(angle*2);
  }
 }
 if(style==='boucle'){
  for(let i=0;i<28;i++){
   const a=2*Math.PI*i/28;
   const phi=.42+(i%3)*.33;
   add(new SphereGeometry(1,9,7),[
    Math.sin(phi)*Math.cos(a)*w*.48,
    h*(.28+Math.cos(phi)*.28),
    Math.sin(phi)*Math.sin(a)*d*.48
   ],[w*.115,h*.095,d*.115]);
  }
 }
 if(style==='long'){
  for(let i=0;i<20;i++){
   const a=2*Math.PI*i/20,x=Math.cos(a)*w*.47,z=Math.sin(a)*d*.47;
   const length=h*(.82+(i%4)*.06);
   strand([new Vector3(x*.8,h*.22,z*.85),new Vector3(x,h*.03,z),
    new Vector3(x*1.02,-length*.45,z*.95),new Vector3(x*.98,-length*.87,z*.9)],w*.03);
  }
 }
 if(style==='queue-haute'||style==='tresse'){
  const pts=[new Vector3(0,h*.32,-d*.4),new Vector3(0,h*.42,-d*.67),
   new Vector3(0,h*.15,-d*.95),new Vector3(0,-h*.42,-d*1.15),
   new Vector3(0,-h*1.22,-d*1.2)];
  strand(pts,w*(style==='tresse'?.065:.087),16);
  if(style==='tresse')for(let i=0;i<9;i++){
   const p=pts[1].clone().lerp(pts[4],(i+.3)/10);
   p.x=(i%2===0?1:-1)*w*.055;
   add(new SphereGeometry(1,8,6),[p.x,p.y,p.z],[w*.105,h*.069,d*.105]);
  }
  add(new SphereGeometry(1,11,8),[0,h*.35,-d*.56],[w*.22,h*.17,d*.24]);
 }
 if(style==='chignon'){
  add(new SphereGeometry(1,16,12),[0,h*.30,-d*.52],[w*.43,h*.34,d*.47]);
  for(let i=0;i<8;i++){
   const a=i/8*Math.PI*2;
   add(new SphereGeometry(1,8,6),[Math.cos(a)*w*.20,h*(.31+Math.sin(a)*.12),-d*.71],
    [w*.10,h*.075,d*.12]);
  }
 }
 bone.add(attach);
 return attach.children.length;
}
