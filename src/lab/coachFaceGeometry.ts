import {Box3,Mesh,SkinnedMesh,Object3D,type BufferAttribute,type BufferGeometry} from 'three';
import {cloneOwnedGeometry} from '../adapters/geometryOwnership';
type FaceParam={jaw:number;nose:number;eyes:number};
type LocalState={geo:BufferGeometry;source:Float32Array;bounds:Box3;lastSignature?:string};
const cache=new WeakMap<SkinnedMesh,LocalState>();
const clamp=(v:number)=>Math.max(.8,Math.min(1.2,Number.isFinite(v)?v:1));
export const isEditableHead=(mesh:Mesh)=>
 mesh instanceof SkinnedMesh&&
 /(?:^|[_:-])(head|face|visage)(?:$|[_:-])/i.test(mesh.name)&&
 !!mesh.geometry.getAttribute('position');
export function countEditableHeadVertices(root:Object3D):number{
 let count=0;
 root.traverse(o=>{const m=o as Mesh;if(isEditableHead(m)&&!m.userData.cmeHiddenSource)count+=m.geometry.getAttribute('position').count;});
 return count;
}
/** Fallback for GLBs without sculpted facial morph targets. Limited, localized
 * deformation of actual skinned HEAD vertices: jaw width, central front nose,
 * outer-eye spacing. The source GLB, bones and skin weights remain untouched.
 * This cannot synthesize missing separated iris meshes or expressions.
 */
export function applyCoachFaceGeometry(root:Object3D,shape:FaceParam):number{
 let modified=0;
 root.traverse(o=>{
  const mesh=o as Mesh;
  if(!isEditableHead(mesh)||mesh.userData.cmeHiddenSource)return;
  const head=mesh as SkinnedMesh;
  let state=cache.get(head);
  const input=[clamp(shape.jaw)-1,clamp(shape.nose)-1,clamp(shape.eyes)-1];
  if(!state){
   if(input.every(v=>Math.abs(v)<.0001))return;
   const original=head.geometry;
   const geo=cloneOwnedGeometry(original);
   if(!geo.boundingBox)geo.computeBoundingBox();
   state={geo,source:new Float32Array(original.getAttribute('position').array as ArrayLike<number>),bounds:geo.boundingBox!.clone()};
   cache.set(head,state);head.geometry=geo;
   if(original.userData.cmeOwned===true)original.dispose();
  }
  const signature=input.join('|');
  if(state.lastSignature===signature)return;
  const pos=state.geo.getAttribute('position') as BufferAttribute,ref=state.source;
  const box=state.bounds;
  const minX=box.min.x,maxX=box.max.x,minY=box.min.y,maxY=box.max.y,minZ=box.min.z,maxZ=box.max.z;
  const width=Math.max(1e-4,maxX-minX),height=Math.max(1e-4,maxY-minY),depth=Math.max(1e-4,maxZ-minZ);
  const midX=(minX+maxX)/2;
  for(let i=0;i<pos.count;i++){
   const x=ref[i*3],y=ref[i*3+1],z=ref[i*3+2];
   const nx=(x-midX)/width,ny=(y-minY)/height,nz=(z-minZ)/depth;
   const front=Math.max(0,Math.min(1,(nz-.45)*2.4));
   const jawMask=Math.max(0,Math.min(1,(.54-ny)*2.9));
   const noseMask=Math.exp(-Math.pow(nx/.14,2)-Math.pow((ny-.49)/.17,2))*front;
   const eyeMask=Math.exp(-Math.pow((Math.abs(nx)-.23)/.13,2)-Math.pow((ny-.66)/.10,2))*front;
   const dx=(x-midX)*(input[0]*.24*jawMask+input[2]*.18*eyeMask);
   const dz=input[1]*depth*.19*noseMask;
   pos.setXYZ(i,x+dx,y,z+dz);
   if(Math.abs(dx)+Math.abs(dz)>1e-6)modified++;
  }
  pos.needsUpdate=true;
  state.geo.computeVertexNormals();
  state.geo.computeBoundingBox();state.geo.computeBoundingSphere();
  state.lastSignature=signature;
 });
 return modified;
}
