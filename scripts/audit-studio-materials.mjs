import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

/** Report real mesh/material identifiers for the pre-existing GLBs; no images, video or CV. */
const roster=['mma-kadir','mma-amara'];
const uniforms=['boxe','kickboxing','muaythai','mma','bjj','bjj-nogi','judo'];
for(const actor of roster){
 for(const garment of ['photo',...uniforms]){
  const file=resolve('public/fighters',actor,garment==='photo'?'photo.glb':'tenues/'+garment+'.glb');
  const bytes=readFileSync(file),length=bytes.readUInt32LE(12);
  const data=JSON.parse(bytes.toString('utf8',20,20+length));
  const materialNames=(data.materials??[]).map((m,i)=>m.name||'material_'+i);
  const meshNames=(data.meshes??[]).map((m,i)=>m.name||'mesh_'+i);
  console.log('[STUDIO GLB]',actor,garment,'materials='+JSON.stringify(materialNames),'meshes='+JSON.stringify(meshNames.slice(0,24)));
 }
}
