import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
/** Checks a real, binary GLB; never treats a placeholder as a completed coach. */
const base=resolve('public/fighters/mma-amara');
const candidate=resolve(base,'fitness-fighter.glb');
const outfits=['boxe','kickboxing','mma','muaythai','bjj','bjj-nogi','judo'];
const verify=(path)=>{
 const bytes=readFileSync(path);
 if(bytes.length<100_000)throw Error('GLB too small for a production-ready fighter: '+path);
 if(bytes.toString('ascii',0,4)!=='glTF')throw Error('Invalid GLB signature: '+path);
 if(bytes.readUInt32LE(4)!==2)throw Error('Only glTF 2.0 is supported: '+path);
 if(bytes.readUInt32LE(8)!==bytes.length)throw Error('GLB length mismatch: '+path);
 const jsonSize=bytes.readUInt32LE(12);
 if(bytes.toString('ascii',16,20)!=='JSON')throw Error('Missing JSON chunk: '+path);
 const doc=JSON.parse(bytes.toString('utf8',20,20+jsonSize));
 if(!Array.isArray(doc.skins)||!doc.skins.length)throw Error('A skinned/rigged fighter is required: '+path);
 if(!Array.isArray(doc.meshes)||!doc.meshes.length)throw Error('No meshes in GLB: '+path);
 const boneNames=new Set((doc.nodes||[]).map(n=>n.name));
 for(const name of ['Hips','Spine','Head','LeftArm','RightArm','LeftUpLeg','RightUpLeg'])if(!boneNames.has(name))throw Error('Required Shadow-compatible bone missing: '+name);
 return {meshes:doc.meshes.length,skins:doc.skins.length,bytes:bytes.length};
};
if(!existsSync(candidate)){
 console.log('AMARA: production mesh pending. Existing coach remains active; no fabricated delivery status.');
 process.exit(0);
}
console.log('Amara base:',verify(candidate));
for(const outfit of outfits){
 const file=resolve(base,'fitness-tenues',outfit+'.glb');
 if(!existsSync(file))throw Error('Missing outfit for new body: '+file);
 console.log(outfit,verify(file));
}
console.log('AMARA: structural GLB checks passed; visual motion and clipping QA still required.');
