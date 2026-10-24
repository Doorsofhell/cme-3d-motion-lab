import {BufferAttribute,Mesh,Object3D,SkinnedMesh,type BufferGeometry} from 'three';
import {cloneOwnedGeometry} from '../adapters/geometryOwnership';

export type CoachBodyShape={shoulders:number;muscle:number;waist:number;sex?:'homme'|'femme';roundness?:number;hips?:number;thighs?:number;bust?:number};
export type CoachFaceShape={jaw:number;nose:number;eyes:number};
export type FaceControl=keyof CoachFaceShape;
export type CoachShapeSupport={torsoVertices:number;hipVertices:number;thighVertices:number;bustVertices:number;faceMorphs:Record<FaceControl,number>};
type Cache={geometry:BufferGeometry;reference:Float32Array;weights:Float32Array};
const cache=new WeakMap<SkinnedMesh,Cache>();
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:1));
const boneName=(name:string)=>name.toLowerCase().replace(/^.*(?:mixamorig|armature[|:_-])/, '').replace(/[^a-z0-9]/g,'');
const isChest=(name:string)=>/^(spine[12]|upperchest|chest|clavicle|shoulder)/.test(name);
const isHips=(name:string)=>/^(hips|pelvis|spine$|lowerback)/.test(name);
const isThigh=(name:string)=>/^(leftupleg|rightupleg|leftthigh|rightthigh|thigh[lr])/.test(name);
const shapeMorph=(name:string):{control:FaceControl;direction:-1|1}|null=>{
 const key=name.toLowerCase().replace(/[^a-z0-9]/g,'');
 const matches=[
  [/^jaw(wide|width|large|broad|big)$/, 'jaw',1],
  [/^jaw(narrow|small|thin)$/, 'jaw',-1],
  [/^nose(wide|width|big|large)$/, 'nose',1],
  [/^nose(narrow|small|thin)$/, 'nose',-1],
  [/^eye(s)?(large|big|wide|size)$/, 'eyes',1],
  [/^eye(s)?(small|narrow|thin)$/, 'eyes',-1]
 ] as const;
 for(const [pattern,control,direction] of matches)if(pattern.test(key))return {control,direction};
 return null;
};
/** Detect blend shapes explicitly named for proportions; expression/speech targets are excluded. */
export function inspectCoachShapes(root:Object3D):CoachShapeSupport{
 const result:CoachShapeSupport={torsoVertices:0,hipVertices:0,thighVertices:0,bustVertices:0,faceMorphs:{jaw:0,nose:0,eyes:0}};
 root.traverse(o=>{
  const mesh=o as Mesh;
  if(!mesh.isMesh)return;
  if(mesh instanceof SkinnedMesh){
   const weights=computeTorsoWeights(mesh);
   if(weights){
    for(let i=0;i<weights.length;i+=3){
     if(weights[i]+weights[i+1]>.4)result.torsoVertices++;
     if(weights[i]>.5)result.bustVertices++;
     if(weights[i+1]+weights[i+2]*.4>.4)result.hipVertices++;
     if(weights[i+2]>.4)result.thighVertices++;
    }
   }
  }
  for(const name of Object.keys(mesh.morphTargetDictionary??{})){
   const match=shapeMorph(name);
   if(match)result.faceMorphs[match.control]++;
  }
 });
 return result;
}
function computeTorsoWeights(mesh:SkinnedMesh):Float32Array|null{
 const geo=mesh.geometry,positions=geo.getAttribute('position');
 const joints=geo.getAttribute('skinIndex'),skinWeights=geo.getAttribute('skinWeight');
 if(!positions||!joints||!skinWeights||!mesh.skeleton?.bones.length)return null;
 const isChestBone=mesh.skeleton.bones.map(b=>isChest(boneName(b.name)));
 const isHipBone=mesh.skeleton.bones.map(b=>isHips(boneName(b.name)));
 const isThighBone=mesh.skeleton.bones.map(b=>isThigh(boneName(b.name)));
 if(!isChestBone.some(Boolean)&&!isHipBone.some(Boolean)&&!isThighBone.some(Boolean))return null;
 const result=new Float32Array(positions.count*3);
 for(let i=0;i<positions.count;i++){
  for(let k=0;k<4;k++){
   const id=joints.getComponent(i,k),weight=skinWeights.getComponent(i,k);
   if(isChestBone[id])result[i*3]+=weight;
   if(isHipBone[id])result[i*3+1]+=weight;
   if(isThighBone[id])result[i*3+2]+=weight;
  }
 }
 return result;
}
/**
 * Shape real skinned GLB geometry without touching bones, bind matrices, skinIndex,
 * skinWeight, motion samplers or the cached GLTF. Vertex changes are intentionally
 * modest and restricted to vertices weighted to torso bones.
 */
export function applyCoachBodyShape(root:Object3D,shape:CoachBodyShape):number{
 let modified=0;
 root.traverse(o=>{
  if(!(o instanceof SkinnedMesh))return;
  let state=cache.get(o);
  if(!state){
   const weights=computeTorsoWeights(o);
   if(!weights||!weights.some(x=>x>.4))return;
   const female=shape.sex==='femme';
   const femaleNeutral=!female||[
    shape.roundness??1,shape.hips??1,shape.thighs??1,shape.bust??1
   ].every(v=>Math.abs(v-1)<.001);
   if(!cache.has(o)&&Math.abs(shape.shoulders-1)<.001&&Math.abs(shape.muscle-1)<.001&&Math.abs(shape.waist-1)<.001&&femaleNeutral)return;
   const previous=o.geometry;
   const source=previous.getAttribute('position');
   const newGeo=cloneOwnedGeometry(previous);
   state={geometry:newGeo,reference:new Float32Array(source.array as ArrayLike<number>),weights};
   cache.set(o,state);
   o.geometry=newGeo;
   // attachOutfit already owns its per-instance garments and masked body geometries.
   // Release an abandoned owned GPU buffer after copying, never a cached GLTF source.
   if(previous.userData.cmeOwned===true)previous.dispose();
  }
  const position=state.geometry.getAttribute('position') as BufferAttribute;
  const ref=state.reference;
  const shoulder=clamp(shape.shoulders,.75,1.25)-1;
  const muscle=clamp(shape.muscle,.7,1.35)-1;
  const waist=clamp(shape.waist,.75,1.3)-1;
  const female=shape.sex==='femme';
  const roundness=female?clamp(shape.roundness??1,.7,1.3)-1:0;
  const hips=female?clamp(shape.hips??1,.75,1.35)-1:0;
  const thighs=female?clamp(shape.thighs??1,.75,1.3)-1:0;
  const bust=female?clamp(shape.bust??1,.75,1.35)-1:0;
  // Compute the anterior chest envelope from the reference geometry rather
  // than assuming that BufferGeometry.boundingBox was precalculated.
  let sumX=0,sumY=0,sumZ=0,count=0,minChestX=Infinity,maxChestX=-Infinity;
  if(Math.abs(bust)>.0001){
   for(let j=0;j<state.weights.length/3;j++)if(state.weights[j*3]>.5){
    const xx=ref[j*3],yy=ref[j*3+1],zz=ref[j*3+2];
    sumX+=xx;sumY+=yy;sumZ+=zz;count++;
    minChestX=Math.min(minChestX,xx);maxChestX=Math.max(maxChestX,xx);
   }
  }
  const widthScale=count?Math.max(.1,(maxChestX-minChestX)*.5):.1;
  const chestCenterX=count?sumX/count:0,chestCenterY=count?sumY/count:0,chestCenterZ=count?sumZ/count:0;
  const neutralShape=shoulder===0&&muscle===0&&waist===0&&roundness===0&&hips===0&&thighs===0&&bust===0;
  // Extra cloth clearance is deliberately tiny, weighted only to chest/hips.
  // It reduces poke-through for attached garments; it is not collision detection.
  const clothClearance=o.name.startsWith('tenue:')
   ?Math.min(.012,Math.max(Math.abs(shoulder),Math.abs(muscle),Math.abs(waist),Math.abs(hips),Math.abs(thighs),Math.abs(roundness),Math.abs(bust))*.04):0;
  for(let i=0;i<position.count;i++){
   if(neutralShape){
    // Exact byte-level neutral restoration, including IEEE-754 negative zero.
    position.setXYZ(i,ref[i*3],ref[i*3+1],ref[i*3+2]);
    continue;
   }
   const chest=state.weights[i*3],pelvis=state.weights[i*3+1],upperLeg=state.weights[i*3+2];
   const torso=Math.min(1,chest+pelvis);
   // All deformations use REAL skinning influence: no changes to bones or skinning data.
   const hipRegion=Math.min(1,pelvis+upperLeg*.45);
   const fullness=Math.min(1,chest*.35+pelvis+upperLeg*.65);
   const extent=Math.min(1,torso+upperLeg);
   const width=1+shoulder*.25*chest+waist*.28*pelvis+muscle*.12*torso+
    hips*.22*hipRegion+thighs*.19*upperLeg+roundness*.095*fullness+clothClearance*extent;
   const depth=1+muscle*.14*torso+waist*.12*pelvis+
    hips*.095*hipRegion+thighs*.11*upperLeg+roundness*.105*fullness+clothClearance*extent;
   const x=ref[i*3],y=ref[i*3+1],z=ref[i*3+2];
   const front=count>0&&z>chestCenterZ;
   const nx=(Math.abs(x-chestCenterX)-widthScale*.38)/(widthScale*.38);
   const ny=(y-chestCenterY)/(widthScale*.72);
   const localized=front?Math.exp(-nx*nx*1.8-ny*ny*1.7):0;
   const projection=bust*.24*widthScale*chest*localized;
   position.setXYZ(i,x*width,y,z*depth+projection);
   if(extent>.4)modified++;
  }
  position.needsUpdate=true;
  state.geometry.computeVertexNormals();
  state.geometry.computeBoundingBox();state.geometry.computeBoundingSphere();
 });
 return modified;
}
/** Use only morph targets proven to exist on each cloned mesh. */
export function applyCoachFaceShapes(root:Object3D,shape:CoachFaceShape):number{
 let affected=0;
 root.traverse(o=>{
  const mesh=o as Mesh;
  if(!mesh.isMesh||!mesh.morphTargetInfluences||!mesh.morphTargetDictionary)return;
  for(const [name,index] of Object.entries(mesh.morphTargetDictionary)){
   const match=shapeMorph(name);if(!match)continue;
   const value=clamp(shape[match.control],.8,1.2)-1;
   const influence=Math.min(1,Math.max(0,match.direction*value*4));
   mesh.morphTargetInfluences[index]=influence;affected++;
  }
 });
 return affected;
}

/**
 * Shared Studio/Laboratoire adapter. Only a cloned rig should be passed here:
 * canonical animations, bone positions, bind matrices and source GLBs stay intact.
 * Unavailable face morph targets and torso weights are ignored.
 */
export function applyCoachLookGeometry(root:Object3D,look:CoachBodyShape & CoachFaceShape & {height:number}):{torsoVertices:number;faceTargets:number}{
 root.scale.setScalar(clamp(look.height,.9,1.1));
 return {
  torsoVertices:applyCoachBodyShape(root,look),
  faceTargets:applyCoachFaceShapes(root,look)
 };
}
