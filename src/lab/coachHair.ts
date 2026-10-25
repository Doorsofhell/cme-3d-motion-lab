import {Bone,Box3,CapsuleGeometry,CatmullRomCurve3,Color,Group,Mesh,MeshStandardMaterial,Object3D,SphereGeometry,TubeGeometry,Vector3} from 'three';

export type HairStyle='rase'|'court'|'long';
const TAG='CME_COIFFURE_ADAPTATIVE';
const isHair=(name:string)=>/(?:^|[_:\\s.-])(hair|cheveux|coiffure|scalp|chevelure)(?:$|[_:\\s.-])/i.test(name);
/** Studio & Laboratoire share the same removable accessory on the REAL head
 * bone. This is a lightweight, deliberately approximate hairstyle, not a
 * falsely claimed professional hair asset. The rig and source GLB are intact.
 */
export function applyCoachHair(root:Object3D,style:HairStyle,color:string):number{
 const former=root.getObjectByName(TAG);
 if(former){
  former.parent?.remove(former);
  former.traverse(o=>{const mesh=o as Mesh;if(mesh.isMesh){mesh.geometry.dispose();(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>m.dispose());}});
 }
 root.updateWorldMatrix(true,true);
 let bone:Bone|null=null,faceMesh:Mesh|null=null;
 root.traverse(o=>{
  if(o instanceof Bone&&/head$/i.test(o.name.replace(/[^a-z0-9]/gi,'')))bone=o;
  const mesh=o as Mesh;
  if(!mesh.isMesh||mesh.userData.cmeHiddenSource)return;
  if(isHair(mesh.name))mesh.visible=false;
  if(!faceMesh&&/(?:^|[_:-])(head|face)(?:$|[_:-])/i.test(mesh.name))faceMesh=mesh;
 });
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
 const mat=new MeshStandardMaterial({name:'cme-hair',color:new Color(color),roughness:.86,metalness:0});
 const add=(geo:SphereGeometry|TubeGeometry)=>{
  const m=new Mesh(geo,mat);m.castShadow=false;attachment.add(m);return m;
 };
 const cap=add(new SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI*.6));
 cap.scale.set(w*.58,h*.52,d*.59);
 cap.position.y=h*.19;
 if(style==='court'){
  for(let i=0;i<9;i++){
   const angle=(i/8-.5)*1.6;
   const lock=add(new SphereGeometry(1,7,5));
   lock.scale.set(w*.085,h*.10,d*.075);
   lock.position.set(Math.sin(angle)*w*.36,h*.21,Math.cos(angle)*d*.45);
  }
 }else{
  // Lightweight hanging, rounded locks: independently orientable with the
  // head bone; no scalp snapping or change to canonical animations.
  for(let i=0;i<14;i++){
   const a=(i/14)*Math.PI*2;
   const x=Math.cos(a)*w*.47,z=Math.sin(a)*d*.47;
   const length=h*(.8+((i%3)*.12));
   const curve=new CatmullRomCurve3([
    new Vector3(x*.88,h*.24,z*.82),
    new Vector3(x,h*.02,z),
    new Vector3(x*1.06,-length*.36,z*.95),
    new Vector3(x*1.02,-length*.7,z*.89)
   ]);
   add(new TubeGeometry(curve,7,w*.038,4,false));
  }
 }
 bone.add(attachment);
 return attachment.children.length;
}
