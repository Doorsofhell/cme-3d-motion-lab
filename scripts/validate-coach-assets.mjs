import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

/**
 * Structural gate for the TWO currently shipped fighters and their 14 outfit GLBs.
 * Never calls a camera, image analysis, mocap or video API.
 * Static rig compatibility is NOT a biomechanical or visual collision certification.
 */
const actors=['mma-kadir','mma-amara'];
const outfits=['boxe','kickboxing','muaythai','mma','bjj','bjj-nogi','judo'];

export function inspectGlb(file){
 const b=readFileSync(file);
 if(b.length<100_000)throw Error('Modèle GLB trop petit ou incomplet : '+file);
 if(b.toString('ascii',0,4)!=='glTF'||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw Error('Entête GLB invalide : '+file);
 const size=b.readUInt32LE(12);
 if(b.toString('ascii',16,20)!=='JSON'||size<=0||size>b.length-20)throw Error('Bloc JSON GLB invalide : '+file);
 const doc=JSON.parse(b.toString('utf8',20,20+size));
 if(!doc.meshes?.length||!doc.skins?.length||!doc.nodes?.length)throw Error('Maillage ou squelette absent : '+file);
 const skins=doc.skins.flatMap(s=>s.joints??[]);
 if(!skins.length)throw Error('Aucun os lié au maillage : '+file);
 const names=new Set(skins.map(i=>doc.nodes[i]?.name).filter(Boolean));
 if(!names.size)throw Error('Os sans nom, impossible de réassocier les tenues : '+file);
 const skinnedNodes=doc.nodes.filter(n=>Number.isInteger(n.mesh)&&Number.isInteger(n.skin));
 if(!skinnedNodes.length)throw Error('Aucun maillage skinné attaché à un squelette : '+file);
 const hasWeights=skinnedNodes.some(n=>doc.meshes[n.mesh]?.primitives?.some(p=>
  p.attributes?.POSITION!==undefined&&p.attributes?.JOINTS_0!==undefined&&p.attributes?.WEIGHTS_0!==undefined
 ));
 if(!hasWeights)throw Error('Poids de skinning absents : '+file);
 return {names,skinnedMeshes:skinnedNodes.length,meshes:doc.meshes.length,size:b.length};
}

export function compareRigBones(body,outfit){
 const matched=[...outfit.names].filter(n=>body.names.has(n));
 const unmatched=[...outfit.names].filter(n=>!body.names.has(n));
 return {matched:matched.length,missing:unmatched,ratio:matched.length/outfit.names.size};
}

export function validateShippedCoachAssets(root=resolve('public/fighters')){
 const checked=[];
 for(const actor of actors){
  const body=inspectGlb(resolve(root,actor,'photo.glb'));
  for(const outfit of outfits){
   const file=resolve(root,actor,'tenues',outfit+'.glb');
   const model=inspectGlb(file);
   const compatible=compareRigBones(body,model);
   // Avoid silently binding clothing to the outfit's foreign skeleton.
   if(compatible.ratio<.85)throw Error(
    actor+'/'+outfit+' : os communs '+compatible.matched+'/'+model.names.size+
    ' ; os non retrouvés '+compatible.missing.slice(0,12).join(', ')
   );
   checked.push({actor,outfit,sharedBones:compatible.matched,outfitBones:model.names.size,meshes:model.skinnedMeshes});
  }
 }
 if(checked.length!==actors.length*outfits.length)throw Error('Couverture de toutes les tenues incomplète');
 return checked;
}

if(process.argv[1]&&resolve(process.argv[1])===resolve(new URL(import.meta.url).pathname)){
 const checks=validateShippedCoachAssets();
 for(const c of checks)console.log(c.actor,c.outfit,c.sharedBones+'/'+c.outfitBones+' os compatibles, '+c.meshes+' maillage(s) skinné(s)');
 console.log('Validation structurelle : 2 humanoïdes, 6 disciplines et variantes JJB, 14 GLB de tenue. Collisions et mouvements réels à tester sur Android.');
}
