#!/usr/bin/env node
/** Download the two confirmed CC0 MakeHuman/MPFB anatomical GLBs for Pages.
 * Reject broken/unskinned files rather than inventing fallback humanoids.
 */
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
// Expected SHA-256 of the reviewed files: any upstream change fails the build instead of shipping silently.
const sources=[
 {sex:'homme',slug:'male-base-mesh-3d-person-rigged-a-pose-380e6d89',sha256:'d15a07e2b4cf1d08a3b91cb212a9a06a91438077f05a3f2a62f45351e8a71eb8'},
 {sex:'femme',slug:'female-base-mesh-3d-person-rigged-a-pose-dba97ed5',sha256:'a571a5872a5f9d75c013ce6d88b3484436cf2109bf133fbc31e42c41f52389f1'}
];
const provenance=[];
for(const {sex,slug,sha256:expected} of sources){
 const source='https://www.innerscene.com/api/library/'+slug+'/download';
 // Reuse a previously downloaded file (CI cache) when it still matches the pinned hash.
 const cached=await readFile('public/anatomie/'+sex+'.glb').catch(()=>null);
 const reuse=cached&&createHash('sha256').update(cached).digest('hex')===expected;
 let b=cached;
 if(!reuse){
  const r=await fetch(source,{headers:{accept:'application/octet-stream'},signal:AbortSignal.timeout(90000)});
  if(!r.ok)throw new Error('Download '+sex+': HTTP '+r.status);
  b=Buffer.from(await r.arrayBuffer());
 }
 if(b.byteLength<200_000||b.byteLength>16_000_000||b.toString('utf8',0,4)!=='glTF'||b.readUInt32LE(8)!==b.byteLength)
  throw new Error('Invalid glTF binary '+sex);
 const sha256=createHash('sha256').update(b).digest('hex');
 if(sha256!==expected)throw new Error('Unexpected SHA-256 for '+sex+': '+sha256+' (expected '+expected+'). Review the new file, then update the pinned hash.');
 const len=b.readUInt32LE(12);
 if(len<1||len>b.byteLength-20||b.readUInt32LE(16)!==0x4e4f534a)throw new Error('Invalid glTF JSON '+sex);
 const gltf=JSON.parse(b.toString('utf8',20,20+len));
 const skinned=(gltf.meshes??[]).flatMap(x=>x.primitives??[]).filter(p=>
  p.attributes?.POSITION!==undefined&&p.attributes?.JOINTS_0!==undefined&&p.attributes?.WEIGHTS_0!==undefined
 ).reduce((n,p)=>n+(gltf.accessors?.[p.attributes.POSITION]?.count??0),0);
 if((gltf.skins?.length??0)<1||skinned<5000||(gltf.nodes?.length??0)<50)throw Error('No real rigged humanoid '+sex);
 await mkdir('public/anatomie',{recursive:true});
 await writeFile('public/anatomie/'+sex+'.glb',b);
 provenance.push({sex,source,sha256,bytes:b.byteLength,nodes:gltf.nodes.length,skins:gltf.skins.length,skinnedVertices:skinned});
 console.log(sex+': '+skinned+' skinned vertices, SHA256 '+sha256+(reuse?' (cache)':''));
}
if(provenance[0].sha256===provenance[1].sha256)throw Error('Identical H/F models');
await writeFile('public/anatomie/manifest.json',JSON.stringify({version:'0.7.42',license:'CC0-1.0',models:provenance},null,2));
