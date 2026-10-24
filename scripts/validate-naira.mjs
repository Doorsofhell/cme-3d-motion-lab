import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
/** Naïra production gate. Missing assets keep the character disabled; partial packs fail CI. */
const base=resolve('public/fighters/mma-naira');
const outfits=['boxe','kickboxing','mma','muaythai','bjj','bjj-nogi','judo'];
const required=['photo.glb',...outfits.map(n=>'tenues/'+n+'.glb')];
const bodyBones=['Hips','Spine','Head','LeftArm','RightArm','LeftUpLeg','RightUpLeg'];
const available=required.filter(name=>existsSync(resolve(base,name)));
if(!available.length){console.log('NAÏRA: no production assets; keep fighter disabled.');process.exit(0)}
if(available.length!==required.length)throw Error('Incomplete Naïra pack: '+required.filter(n=>!available.includes(n)).join(', '));
function validate(file,isBody){
 const b=readFileSync(file);
 if(b.length<100000)throw Error('GLB below production size floor: '+file);
 if(b.toString('ascii',0,4)!=='glTF'||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw Error('Invalid GLB header: '+file);
 const size=b.readUInt32LE(12);
 if(b.toString('ascii',16,20)!=='JSON'||size<=0||size>b.length-20)throw Error('Invalid GLB JSON chunk: '+file);
 const doc=JSON.parse(b.toString('utf8',20,20+size));
 if(!doc.meshes?.length||!doc.accessors?.length)throw Error('Missing mesh or accessors: '+file);
 if(!doc.materials?.length)throw Error('Missing materials: '+file);
 const primitives=doc.meshes.flatMap(m=>m.primitives||[]);
 if(!primitives.length)throw Error('Missing geometry primitives: '+file);
 if(primitives.some(p=>p.attributes?.POSITION===undefined||p.indices===undefined))throw Error('Missing indexed geometry: '+file);
 if(primitives.some(p=>p.attributes?.TEXCOORD_0===undefined))throw Error('Missing UV0: '+file);
 if(isBody){
  if(!doc.skins?.length)throw Error('No skeleton skin: '+file);
  const nodes=doc.nodes||[];
  const names=new Set(nodes.map(n=>n.name));
  for(const bone of bodyBones)if(!names.has(bone))throw Error('Missing bone '+bone+': '+file);
  if(primitives.every(p=>p.attributes?.JOINTS_0===undefined||p.attributes?.WEIGHTS_0===undefined))throw Error('No skinned mesh vertices: '+file);
  if(!doc.skins.some(s=>s.joints?.length>=20))throw Error('Rig too sparse for human combat motion: '+file);
  const positions=primitives.map(p=>doc.accessors[p.attributes.POSITION]).filter(Boolean);
  const totalVertices=positions.reduce((n,a)=>n+(a.count||0),0);
  if(totalVertices<12000)throw Error('Body geometry below minimum detail floor: '+totalVertices);
  if(!doc.textures?.length||!doc.images?.length)throw Error('Body lacks texture images: '+file);
  return {meshes:doc.meshes.length,vertices:totalVertices,joints:Math.max(...doc.skins.map(s=>s.joints?.length||0)),textures:doc.textures.length};
 }
 return {meshes:doc.meshes.length,primitives:primitives.length};
}
for(const name of required)console.log('NAÏRA',name,validate(resolve(base,name),name==='photo.glb'));
console.log('NAÏRA: structural production gates passed; visual, licensing and biomechanical QA remain mandatory.');
