import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
/** Explicit asset gate: a placeholder or blockout can never activate Naïra. */
const base=resolve('public/fighters/mma-naira');
const required=['photo.glb',...['boxe','kickboxing','mma','muaythai','bjj','bjj-nogi','judo'].map(n=>'tenues/'+n+'.glb')];
function validate(file,rigRequired){
 const bytes=readFileSync(file);
 if(bytes.length<100000)throw Error('Insufficient production asset size: '+file);
 if(bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw Error('Invalid glTF 2.0 binary: '+file);
 const size=bytes.readUInt32LE(12);
 if(bytes.toString('ascii',16,20)!=='JSON'||size<=0||size>bytes.length-20)throw Error('Invalid JSON chunk: '+file);
 const doc=JSON.parse(bytes.toString('utf8',20,20+size));
 if(!doc.meshes?.length)throw Error('Missing mesh: '+file);
 if(rigRequired){
  if(!doc.skins?.length)throw Error('Missing rig: '+file);
  const names=new Set((doc.nodes||[]).map(n=>n.name));
  for(const name of ['Hips','Spine','Head','LeftArm','RightArm','LeftUpLeg','RightUpLeg'])if(!names.has(name))throw Error('Missing required rig bone '+name+' in '+file);
 }
 return {meshes:doc.meshes.length,skins:doc.skins?.length||0};
}
const present=required.filter(p=>existsSync(resolve(base,p)));
if(present.length===0){console.log('NAÏRA: assets not yet shipped; coach must remain disabled.');process.exit(0)}
if(present.length!==required.length)throw Error('Incomplete Naïra asset pack: missing '+required.filter(x=>!present.includes(x)).join(', '));
for(const item of required)console.log('NAÏRA',item,validate(resolve(base,item),item==='photo.glb'));
console.log('NAÏRA: structural gate passed. Visual and motion QA still mandatory before activation.');
