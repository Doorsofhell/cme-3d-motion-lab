#!/usr/bin/env node
/** Download the two confirmed CC0 MakeHuman/MPFB anatomical GLBs for Pages.
 * Reject broken/unskinned files rather than inventing fallback humanoids.
 */
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const sources=[
 {sex:'homme',slug:'male-base-mesh-3d-person-rigged-a-pose-380e6d89'},
 {sex:'femme',slug:'female-base-mesh-3d-person-rigged-a-pose-dba97ed5'}
];
const provenance=[];
for(const {sex,slug} of sources){
 const source='https://www.innerscene.com/api/library/'+slug+'/download';
 const r=await fetch(source,{headers:{accept:'application/octet-stream'},signal:AbortSignal.timeout(90000)});
 if(!r.ok)throw new Error('Download '+sex+': HTTP '+r.status);
 const b=Buffer.from(await r.arrayBuffer());
 if(b.byteLength<200_000||b.byteLength>16_000_000||b.toString('utf8',0,4)!=='glTF'||b.readUInt32LE(8)!==b.byteLength)
  throw new Error('Invalid glTF binary '+sex);
 const len=b.readUInt32LE(12);
 if(len<1||len>b.byteLength-20||b.readUInt32LE(16)!==0x4e4f534a)throw new Error('Invalid glTF JSON '+sex);
 const gltf=JSON.parse(b.toString('utf8',20,20+len));
 const skinned=(gltf.meshes??[]).flatMap(x=>x.primitives??[]).filter(p=>
  p.attributes?.POSITION!==undefined&&p.attributes?.JOINTS_0!==undefined&&p.attributes?.WEIGHTS_0!==undefined
 ).reduce((n,p)=>n+(gltf.accessors?.[p.attributes.POSITION]?.count??0),0);
 if((gltf.skins?.length??0)<1||skinned<5000||(gltf.nodes?.length??0)<50)throw Error('No real rigged humanoid '+sex);
 await mkdir('public/anatomie',{recursive:true});
 await writeFile('public/anatomie/'+sex+'.glb',b);
 const sha256=createHash('sha256').update(b).digest('hex');
 provenance.push({sex,source,sha256,bytes:b.byteLength,nodes:gltf.nodes.length,skins:gltf.skins.length,skinnedVertices:skinned});
 console.log(sex+': '+skinned+' skinned vertices, SHA256 '+sha256);
}
if(provenance[0].sha256===provenance[1].sha256)throw Error('Identical H/F models');
await writeFile('public/anatomie/manifest.json',JSON.stringify({version:'0.7.42',license:'CC0-1.0',models:provenance},null,2));
