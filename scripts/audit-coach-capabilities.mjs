import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const actors=[['Homme / Kadir','mma-kadir'],['Femme / Amara','mma-amara']];
const outfits=['boxe','kickboxing','muaythai','mma','bjj','bjj-nogi','judo'];
function glb(path){
 const bytes=readFileSync(resolve(path));
 if(bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2)throw Error('GLB invalide '+path);
 const jsonSize=bytes.readUInt32LE(12);
 const doc=JSON.parse(bytes.toString('utf8',20,20+jsonSize));
 return doc;
}
const meshNames=doc=>(doc.meshes??[]).map(m=>m.name??'').filter(Boolean);
const matNames=doc=>(doc.materials??[]).map(m=>m.name??'').filter(Boolean);
const reg={
 peau:/^([mf]0[0-9]+_(head|body))|skin|face/i,
 cheveux:/hair|cheveu|beard|brow/i,
 gants:/glove|gant|mitt/i,
 protections:/prot[eè]ge|protection|shin|velcro/i,
 haut:/haut|brassiere|rash|gi-|col-|vest|shirt/i,
 bas:/short|pantalon|legging|pant/i,
 yeux:/iris|eyeball|eye/i
};
function zones(doc){
 const all=[...meshNames(doc),...matNames(doc)];
 return Object.fromEntries(Object.entries(reg).map(([zone,rx])=>[zone,all.filter(name=>rx.test(name)).length]));
}
function morphs(doc){
 const list=[];
 for(const mesh of doc.meshes??[]){
  const shapes=mesh.extras?.targetNames??mesh.extras?.target_names??[];
  for(const name of shapes)list.push(String(name));
  // A target without a semantic name is NOT a safe facial/body control.
 }
 return {named:list,unnamedCount:(doc.meshes??[]).reduce((sum,m)=>sum+(m.primitives??[]).reduce((n,p)=>n+(p.targets?.length??0),0),0)};
}
const reports=[];
for(const [label,actor] of actors){
 const body=glb('public/fighters/'+actor+'/photo.glb');
 const assets=outfits.map(name=>({name,doc:glb('public/fighters/'+actor+'/tenues/'+name+'.glb')}));
 const figures={
  label,actor,bodyMeshes:body.meshes?.length??0,bodySkins:body.skins?.length??0,
  bodyMaterials:matNames(body),bodyZones:zones(body),bodyMorphTargets:morphs(body),
  outfits:assets.map(x=>({name:x.name,materials:matNames(x.doc).length,zones:zones(x.doc),morphs:morphs(x.doc).named.length}))
 };
 if(!figures.bodySkins||!figures.bodyMeshes||assets.length!==7)throw Error('Pack de coach incomplet : '+actor);
 reports.push(figures);
}
for(const r of reports){
 console.log('[CAPACITES]',r.label,
 JSON.stringify({bodyMeshes:r.bodyMeshes,bodyMaterials:r.bodyMaterials,bodyZones:r.bodyZones,morphNames:r.bodyMorphTargets.named,morphPrimitives:r.bodyMorphTargets.unnamedCount,
 outfits:r.outfits}));
 if(!r.bodyZones.peau)throw Error('Peau GLB non reconnue : '+r.actor);
}
console.log('Audit structurel complet : homme + femme et 14 tenues. Aucune conclusion visuelle / anatomique ni nouvelle coiffure synthétique.');
