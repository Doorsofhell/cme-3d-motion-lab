import {Bone,Box3,CatmullRomCurve3,Color,Group,Mesh,MeshStandardMaterial,Object3D,SphereGeometry,TubeGeometry,Vector3} from 'three';

export type HairStyle='rase'|'degrade'|'court'|'mi-long'|'long'|'queue-haute'|'tresse';
export const HAIR_STYLES:readonly {id:HairStyle;label:string;description:string}[]=[
 {id:'rase',label:'Rasé',description:'Cuir chevelu apparent, sans volume ajouté'},
 {id:'degrade',label:'Dégradé',description:'Dessus texturé et tempes courtes'},
 {id:'court',label:'Court',description:'Mèches courtes et volumétriques'},
 {id:'mi-long',label:'Mi-long',description:'Carré sportif et mèches latérales'},
 {id:'long',label:'Long',description:'Chevelure longue sur les épaules'},
 {id:'queue-haute',label:'Queue haute',description:'Cheveux retenus vers l’arrière'},
 {id:'tresse',label:'Tresse',description:'Tresse sportive attachée à la tête'}
];
const TAG='CME_COIFFURE_ADAPTATIVE';
const isHair=(name:string)=>/(?:^|[_:\\s.-])(hair|cheveux|coiffure|scalp|chevelure)(?:$|[_:\\s.-])/i.test(name);
/** Studio & Laboratoire share the same removable accessory on the REAL head
 * bone. This is a lightweight, deliberately approximate hairstyle, not a
 * falsely claimed professional hair asset. The rig and source GLB are intact.
 */
export function applyCoachHair(root:Object3D,style:HairStyle,color:string):number{
 const former=root.getObjectByName(TAG) as Group|null;
 if(former&&former.userData.cmeHairStyle===style){
  // Changement de couleur sans réallocation des géométries (Android).
  (former.userData.cmeHairMaterial as MeshStandardMaterial|undefined)?.color.set(color);
  return former.children.length;
 }
 if(former){
  former.parent?.remove(former);
  former.traverse(o=>{const mesh=o as Mesh;if(mesh.isMesh){mesh.geometry.dispose();(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>m.dispose());}});
 }
 root.updateWorldMatrix(true,true);
 const bones:Bone[]=[],faces:Mesh[]=[];
 root.traverse(o=>{
  if(o instanceof Bone&&/head$/i.test(o.name.replace(/[^a-z0-9]/gi,'')))bones.push(o);
  const mesh=o as Mesh;
  if(!mesh.isMesh||mesh.userData.cmeHiddenSource)return;
  if(isHair(mesh.name))mesh.visible=false;
  if(/(?:^|[_:-])(head|face)(?:$|[_:-])/i.test(mesh.name))faces.push(mesh);
 });
 const bone=bones[0],faceMesh=faces[0];
 if(!bone||style==='rase')return bone?1:0;
 const skull=new Box3();
 if(faceMesh)skull.setFromObject(faceMesh);
 const centre=skull.isEmpty()?bone.getWorldPosition(new Vector3()).add(new Vector3(0,.12,0)):skull.getCenter(new Vector3());
 const size=skull.isEmpty()?new Vector3(.20,.28,.20):skull.getSize(new Vector3());
 // Sanity limits prevent blended/malformed mesh bounds from becoming wigs.
 const w=Math.max(.14,Math.min(.29,size.x));
 const h=Math.max(.20,Math.min(.38,size.y));
 const d=Math.max(.15,Math.min(.3,size.z));
 const local=bone.worldToLocal(centre.clone());
 const attachment=new Group();attachment.name=TAG;
 attachment.position.copy(local);
 attachment.userData.cmeHairStyle=style;
 const mat=new MeshStandardMaterial({name:'cme-hair',color:new Color(color),roughness:.78,metalness:0,side:2});
 attachment.userData.cmeHairMaterial=mat;
 const add=(geo:SphereGeometry|TubeGeometry)=>{
  const m=new Mesh(geo,mat);m.castShadow=false;attachment.add(m);return m;
 };
 const cap=add(new SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI*.6));
 cap.scale.set(w*.58,h*.52,d*.59);
 cap.position.y=h*.19;
 const lock=(angle:number,length:number,thickness=.038,rotation=0)=>{
  // Courbes réellement volumétriques suivant l'os de tête ; jamais simple teinte.
  const x=Math.sin(angle)*w*.45,z=Math.cos(angle)*d*.45;
  const curve=new CatmullRomCurve3([
   new Vector3(x*.82,h*.3,z*.82),
   new Vector3(x,h*.03,z),
   new Vector3(x*1.03,-length*.4,z*.96+rotation),
   new Vector3(x*1.02,-length*.82,z*.9+rotation)
  ]);
  return add(new TubeGeometry(curve,9,w*thickness,5,false));
 };
 const dome=style==='degrade'?.44:style==='court'?.62:style==='mi-long'?.59:.52;
 cap.scale.set(w*.58,h*dome,d*.59);
 if(style==='degrade'){
  for(let i=0;i<12;i++){
   const a=(i/11-.5)*1.8;
   const tuft=add(new SphereGeometry(1,8,6));
   tuft.scale.set(w*.065,h*.12,d*.08);
   tuft.position.set(Math.sin(a)*w*.31,h*.20,Math.cos(a)*d*.36);
  }
 }else if(style==='court'){
  for(let i=0;i<9;i++){
   const a=(i/8-.5)*1.6;
   const tuft=add(new SphereGeometry(1,7,5));
   tuft.scale.set(w*.085,h*.10,d*.075);
   tuft.position.set(Math.sin(a)*w*.36,h*.21,Math.cos(a)*d*.45);
  }
 }else if(style==='mi-long'){
  for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2;lock(a,h*.62,.051);}
 }else if(style==='long'){
  for(let i=0;i<14;i++){const a=(i/14)*Math.PI*2;lock(a,h*(.8+((i%3)*.12)));}
 }else if(style==='queue-haute'||style==='tresse'){
  // Bandeau et queue attachés au sommet postérieur de la calotte.
  const band=add(new SphereGeometry(1,9,7));
  band.scale.set(w*.18,h*.17,d*.17);
  band.position.set(0,h*.30,-d*.44);
  if(style==='queue-haute'){
   for(let i=0;i<9;i++){
    const angle=i/9*Math.PI*2;
    const curve=new CatmullRomCurve3([
     new Vector3(Math.sin(angle)*w*.09,h*.32,-d*.42),
     new Vector3(Math.sin(angle)*w*.12,h*.03,-d*.63),
     new Vector3(Math.sin(angle)*w*.15,-h*.44,-d*.76),
     new Vector3(Math.sin(angle)*w*.21,-h*.95,-d*.65)
    ]);
    add(new TubeGeometry(curve,12,w*.035,5,false));
   }
  }else{
   // Volume géométrique tressé, trois brins intercalés et boucles serrées.
   for(let strand=0;strand<3;strand++){
    const vertices:Vector3[]=[];
    for(let i=0;i<=18;i++){
     const progress=i/18;
     const phase=progress*Math.PI*7+strand*Math.PI*2/3;
     vertices.push(new Vector3(
      Math.sin(phase)*w*.12*(1-.3*progress),
      h*.24-progress*h*1.45,
      -d*.54+Math.cos(phase)*d*.08
     ));
    }
    add(new TubeGeometry(new CatmullRomCurve3(vertices),27,w*.042,5,false));
   }
   const finish=add(new SphereGeometry(1,8,6));
   finish.scale.set(w*.11,h*.09,d*.11);finish.position.set(0,-h*1.21,-d*.54);
  }
 }

 bone.add(attachment);
 return attachment.children.length;
}
