import {Bone,Box3,CatmullRomCurve3,Color,Group,IcosahedronGeometry,Mesh,MeshStandardMaterial,Object3D,SphereGeometry,TubeGeometry,Vector3,type BufferGeometry} from 'three';

export type HairStyle='rase'|'court'|'degrade'|'boucles'|'long'|'queue-haute'|'tresse';
export const HAIR_STYLES:readonly {id:HairStyle;label:string;description:string}[]=[
 {id:'rase',label:'Rasé',description:'Sans ajout capillaire'},
 {id:'court',label:'Court',description:'Coupe courte structurée'},
 {id:'degrade',label:'Dégradé',description:'Volume sur le sommet, côtés courts'},
 {id:'boucles',label:'Bouclé',description:'Boucles courtes sur le sommet'},
 {id:'long',label:'Long',description:'Mèches mi-longues autour de la tête'},
 {id:'queue-haute',label:'Queue haute',description:'Cheveux attachés pour le sport'},
 {id:'tresse',label:'Tresse',description:'Tresse attachée pour les entraînements'}
];
const TAG='CME_COIFFURE_ADAPTATIVE';
const isHair=(name:string)=>/(?:^|[_:\\s.-])(hair|cheveux|coiffure|scalp|chevelure)(?:$|[_:\\s.-])/i.test(name);
export function hasEditableHairRoot(root:Object3D):boolean{
 let found=false;
 root.traverse(o=>{if(o instanceof Bone&&/head$/i.test(o.name.replace(/[^a-z0-9]/gi,'')))found=true;});
 return found;
}
function clean(root:Object3D){
 const former=root.getObjectByName(TAG);
 if(!former)return;
 former.parent?.remove(former);
 const disposed=new Set<object>();
 former.traverse(o=>{
  const mesh=o as Mesh;if(!mesh.isMesh)return;
  if(!disposed.has(mesh.geometry)){mesh.geometry.dispose();disposed.add(mesh.geometry);}
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  materials.forEach(m=>{if(!disposed.has(m)){m.dispose();disposed.add(m);}});
 });
}
/** Géométries capillaires réelles, optimisées pour mobile (pas de cheveux simulés
 * par recoloration). Chaque coiffure est parentée à l'os Head existant :
 * animations, coordonnées canoniques et skinning inchangés.
 * Ce sont des formes procédurales, pas des GLB capillaires professionnels. */
export function applyCoachHair(root:Object3D,style:HairStyle,color:string):number{
 clean(root);
 root.updateWorldMatrix(true,true);
 const bones:Bone[]=[],faces:Mesh[]=[];
 root.traverse(o=>{
  if(o instanceof Bone&&/head$/i.test(o.name.replace(/[^a-z0-9]/gi,'')))bones.push(o);
  const mesh=o as Mesh;
  if(!mesh.isMesh||mesh.userData.cmeHiddenSource)return;
  if(isHair(mesh.name))mesh.visible=false;
  if(/(?:^|[_:-])(head|face)(?:$|[_:-])/i.test(mesh.name))faces.push(mesh);
 });
 const bone=bones[0],face=faces[0];
 if(!bone||style==='rase')return bone?1:0;
 const skull=new Box3();
 if(face)skull.setFromObject(face);
 const centre=skull.isEmpty()?bone.getWorldPosition(new Vector3()).add(new Vector3(0,.12,0)):skull.getCenter(new Vector3());
 const size=skull.isEmpty()?new Vector3(.20,.28,.20):skull.getSize(new Vector3());
 const w=Math.max(.14,Math.min(.29,size.x)),h=Math.max(.20,Math.min(.38,size.y)),d=Math.max(.15,Math.min(.30,size.z));
 const attachment=new Group();attachment.name=TAG;
 attachment.position.copy(bone.worldToLocal(centre.clone()));
 const mat=new MeshStandardMaterial({name:'cme-cheveux-proceduraux',color:new Color(color),roughness:.82,metalness:0});
 const add=(geo:BufferGeometry,x=0,y=0,z=0):Mesh=>{
  const m=new Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=false;attachment.add(m);return m;
 };
 const cap=add(new SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI*.53),0,h*.17,0);
 cap.scale.set(w*.60,h*.45,d*.61);
 const boucle=(x:number,y:number,z:number,r:number)=>{
  const part=add(new IcosahedronGeometry(1,1),x,y,z);
  part.scale.set(r,r*.88,r*.91);return part;
 };
 const wave=(points:Vector3[],radius:number)=>{
  add(new TubeGeometry(new CatmullRomCurve3(points),12,radius,6,false));
 };
 if(style==='court'||style==='degrade'){
  if(style==='degrade'){cap.scale.set(w*.56,h*.28,d*.55);cap.position.y=h*.30;}
  for(let i=0;i<(style==='degrade'?14:10);i++){
   const a=(i/13-.5)*2.1,co=Math.cos(a),si=Math.sin(a);
   const lock=add(new SphereGeometry(1,10,6),si*w*.35,h*(style==='degrade'?.32:.22),co*d*.37);
   lock.scale.set(w*.065,h*(style==='degrade'?.15:.1),d*.07);
  }
 }else if(style==='boucles'){
  cap.scale.set(w*.58,h*.38,d*.58);
  for(let i=0;i<22;i++){
   const a=i*2.39996,rad=Math.sqrt((i+.5)/22);
   boucle(Math.cos(a)*w*.47*rad,h*(.40-.17*rad),Math.sin(a)*d*.46*rad,w*(.10+.03*(i%3)));
  }
 }else if(style==='long'){
  for(let i=0;i<16;i++){
   const a=i/16*Math.PI*2,x=Math.cos(a)*w*.48,z=Math.sin(a)*d*.48;
   const len=h*(.64+.12*(i%3));
   wave([new Vector3(x*.8,h*.25,z*.8),new Vector3(x,h*.02,z),
    new Vector3(x*1.1,-len*.35,z*.96),new Vector3(x*.98,-len*.73,z*.92)],w*.033);
  }
 }else if(style==='queue-haute'||style==='tresse'){
  // Attachée haut à l'arrière de la tête : la coiffure reste une pièce
  // géométrique liée à l'os tête, aucun changement aux articulations.
  for(let i=0;i<9;i++){
   const a=i/9*Math.PI*2;
   wave([new Vector3(Math.cos(a)*w*.27,h*.30,Math.sin(a)*d*.35),
    new Vector3(0,h*.36,-d*.50)],w*.021);
  }
  const tie=add(new SphereGeometry(1,10,6),0,h*.35,-d*.50);
  tie.scale.set(w*.14,h*.065,d*.13);
  if(style==='queue-haute'){
   for(let i=0;i<9;i++){
    const a=i/9*Math.PI*2;
    wave([new Vector3(Math.cos(a)*w*.055,h*.35,-d*.51),
     new Vector3(Math.cos(a)*w*.13,h*.13,-d*.65),
     new Vector3(Math.cos(a)*w*.10,-h*.38,-d*.62),
     new Vector3(Math.cos(a)*w*.03,-h*.72,-d*.67)],w*.031);
   }
  }else{
   for(let i=0;i<8;i++){
    const y=h*.27-i*h*.122,offset=i%2===0?1:-1;
    const segment=add(new IcosahedronGeometry(1,1),offset*w*.065,y,-d*(.52+.035*i));
    segment.scale.set(w*.15*(1-i*.05),h*.09,d*.105);
    segment.rotation.z=offset*.24;
   }
  }
 }
 bone.add(attachment);
 return attachment.children.length;
}
