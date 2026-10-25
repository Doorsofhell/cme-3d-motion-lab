import type {CoachLook} from './StudioCoach';
export type ShapeKey='shoulders'|'muscle'|'waist'|'roundness'|'hips'|'glutes'|'thighs'|'bust'|'jaw'|'nose'|'eyes';
export type ShapePreset={id:string;label:string;value:number;symbol:string};
export type ShapeGroup={id:ShapeKey;label:string;zone:'corps'|'buste'|'visage'|'abdomen'|'hanches'|'jambes';sex:'all'|'femme'|'homme';requires:'torso'|'hip'|'thigh'|'bust'|'face';presets:readonly ShapePreset[]};
const variations=(id:string,labels:readonly string[],values:readonly number[],symbols:readonly string[]):ShapePreset[]=>
 labels.map((label,i)=>({id:id+'-'+i,label,value:values[i],symbol:symbols[i]}));
const group=(id:ShapeKey,label:string,zone:ShapeGroup['zone'],sex:ShapeGroup['sex'],requires:ShapeGroup['requires'],labels:string[],values:number[],symbols:string[]):ShapeGroup=>
 ({id,label,zone,sex,requires,presets:variations(id,labels,values,symbols)});
export const SHAPE_GROUPS:readonly ShapeGroup[]=[
 group('shoulders','Épaules','buste','all','torso',['Étroites','Naturelles','Larges','Puissantes'],[.78,1,1.14,1.25],['╱╲','⌒','⏜','⏣']),
 group('muscle','Musculature','corps','all','torso',['Fine','Naturelle','Athlétique','Massive'],[.72,1,1.2,1.35],['│','◯','◇','⬡']),
 group('waist','Taille et abdomen','abdomen','all','torso',['Fine','Naturelle','Épaisse','Ronde'],[.77,1,1.16,1.3],['⌛','│','▱','◯']),
 group('roundness','Rondeur générale','corps','all','torso',['Fine','Naturelle','Pleine','Ronde'],[.72,1,1.15,1.3],['│','◇','◯','⬭']),
 group('bust','Volume pectoral / poitrine','buste','all','bust',['Discrète','Naturelle','Pleine','Développée'],[.76,1,1.16,1.35],['◡','◠','◒','●']),
 group('hips','Hanches','hanches','all','hip',['Étroites','Naturelles','Larges','Arrondies'],[.77,1,1.18,1.35],['│','◇','◯','⬭']),
 group('glutes','Fessiers','hanches','all','hip',['Discrets','Naturels','Galbés','Développés'],[.77,1,1.18,1.35],['◡','◠','◒','●']),
 group('thighs','Cuisses','jambes','all','thigh',['Fines','Naturelles','Athlétiques','Puissantes'],[.76,1,1.16,1.3],['│','∣∣','⌢⌢','◖◗']),
 group('jaw','Mâchoire','visage','all','face',['Fine','Naturelle','Large'],[.8,1,1.2],['▽','◡','▱']),
 group('nose','Nez','visage','all','face',['Fin','Naturel','Large'],[.8,1,1.2],['⌄','♢','◇']),
 group('eyes','Yeux','visage','all','face',['Petits','Naturels','Grands'],[.8,1,1.2],['˘','◡','◉'])
];
/** Parité fonctionnelle sans recopier une silhouette féminine sur le corps masculin. */
export function activeShapeGroups(sex:CoachLook['sex']):readonly ShapeGroup[]{
 const female=sex==='femme';
 return SHAPE_GROUPS.filter(g=>g.sex==='all'||g.sex===sex).map(g=>{
  const label=g.id==='bust'?(female?'Poitrine':'Pectoraux'):
   g.id==='hips'?(female?'Hanches et bassin':'Bassin'):
   g.id==='glutes'?(female?'Galbe des fessiers':'Fessiers et puissance'):
   g.id==='shoulders'?(female?'Épaules et posture':'Carrure des épaules'):g.label;
  const labels=g.id==='bust'?(female?['Discrète','Naturelle','Généreuse','Développée']:['Discrets','Naturels','Athlétiques','Développés']):
   g.id==='glutes'?(female?['Discrets','Naturels','Galbés','Athlétiques']:['Fins','Naturels','Musclés','Puissants']):
   g.id==='hips'?(female?['Étroites','Naturelles','Arrondies','Amples']:['Étroit','Naturel','Large','Robuste']):null;
  return {...g,label,presets:labels?g.presets.map((p,i)=>({...p,label:labels[i]})):g.presets};
 });
}
export function applyShapePreset(look:CoachLook,id:ShapeKey,value:number):CoachLook{
 const group=activeShapeGroups(look.sex).find(g=>g.id===id);
 if(!group||!group.presets.some(p=>p.value===value))throw Error('Forme indisponible : '+id);
 return {...look,[id]:value};
}
export function randomShapeLook(look:CoachLook,rand:()=>number=Math.random,available:(group:ShapeGroup)=>boolean=()=>true):CoachLook{
 let result={...look};
 for(const group of activeShapeGroups(look.sex).filter(available)){
  const index=Math.max(0,Math.min(group.presets.length-1,Math.floor(rand()*group.presets.length)));
  result=applyShapePreset(result,group.id,group.presets[index].value);
 }
 return result;
}
