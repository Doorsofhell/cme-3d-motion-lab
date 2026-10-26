import {describe,expect,it,vi} from 'vitest';
// @ts-ignore — lecture d'assertions métier exécutées localement par Vitest Node.
import {readFileSync} from 'node:fs';
import {Bone,BoxGeometry,BufferAttribute,Group,MeshPhysicalMaterial,MeshStandardMaterial,Skeleton,SkinnedMesh,Texture} from 'three';
import {applyCoachBodyShape,inspectCoachShapes} from './coachGeometry';
import {prepareSportOutfitMaterial} from '../adapters/outfits';
import {studioLightingPreset} from './studioLighting';
import {defaultCoachLook,normalizeCoachLook} from './StudioCoach';
import {resolvedProportions} from './coachProportions';
import {activeShapeGroups} from './visualShapePresets';
import {regionsPourGroupe} from './sculptorRegions';

const fixture=()=>{
 const geo=new BoxGeometry(.5,1.4,.4,3,6,3),p=geo.getAttribute('position');
 const idx=new Uint16Array(p.count*4),weight=new Float32Array(p.count*4);
 for(let i=0;i<p.count;i++){idx[i*4]=p.getY(i)>.23?0:p.getY(i)>-.23?1:2;weight[i*4]=1;}
 geo.setAttribute('skinIndex',new BufferAttribute(idx,4));
 geo.setAttribute('skinWeight',new BufferAttribute(weight,4));
 const bones=[new Bone(),new Bone(),new Bone()];
 ['mixamorigNeck','mixamorigLeftHand','mixamorigLeftFoot'].forEach((name,i)=>bones[i].name=name);
 const mesh=new SkinnedMesh(geo,new MeshStandardMaterial({name:'skin_body'}));
 mesh.bind(new Skeleton(bones));const root=new Group();root.add(mesh);
 return {root,mesh,geo,bones,positions:Array.from(p.array)};
};
const normal={shoulders:1,muscle:1,waist:1,neck:1,hands:1,feet:1};
const source=(path:string)=>readFileSync(new URL('./'+path,import.meta.url),'utf8');
describe('CME-3D 0.7.52 : moteur anatomique et interface épurée',()=>{
 it('identifie les sommets pondérés réellement modifiables de trois nouvelles zones',()=>{
  const caps=inspectCoachShapes(fixture().root);
  expect(caps.neckVertices).toBeGreaterThan(0);
  expect(caps.handVertices).toBeGreaterThan(0);
  expect(caps.footVertices).toBeGreaterThan(0);
  for(const sexe of ['homme','femme'] as const)
   for(const zone of ['neck','hands','feet'])
    expect(activeShapeGroups(sexe).some(g=>g.id===zone)).toBe(true);
  const ids=regionsPourGroupe('buste').concat(regionsPourGroupe('jambes')).map(x=>x.id);
  for(const zone of ['neck','hands','feet'])expect(ids).toContain(zone);
 });
 for(const key of ['neck','hands','feet'] as const)it('déforme le maillage de '+key+' sans changer le rig et évite un deuxième recalcul',()=>{
  const {root,mesh,geo,bones,positions}=fixture();
  const before=bones.map(x=>x.position.clone());
  const skinWeight=Array.from(geo.getAttribute('skinWeight').array);
  const skinIndex=Array.from(geo.getAttribute('skinIndex').array);
  expect(applyCoachBodyShape(root,{...normal,[key]:1.2})).toBeGreaterThan(0);
  expect(Array.from(mesh.geometry.getAttribute('position').array)).not.toEqual(positions);
  expect(Array.from(geo.getAttribute('position').array)).toEqual(positions);
  expect(Array.from(mesh.geometry.getAttribute('skinWeight').array)).toEqual(skinWeight);
  expect(Array.from(mesh.geometry.getAttribute('skinIndex').array)).toEqual(skinIndex);
  expect(bones.every((b,i)=>b.position.equals(before[i]))).toBe(true);
  const normals=vi.spyOn(mesh.geometry,'computeVertexNormals');
  expect(applyCoachBodyShape(root,{...normal,[key]:1.2})).toBe(0);
  expect(normals).not.toHaveBeenCalled();
  applyCoachBodyShape(root,normal);
  expect(normals).toHaveBeenCalledTimes(1);
  expect(Array.from(mesh.geometry.getAttribute('position').array)).toEqual(positions);
 });
 it('importe les anciens profils sans effacer les dimensions homme/femme',()=>{
  const look={...defaultCoachLook};
  delete (look as Partial<typeof look>).neck;
  delete (look as Partial<typeof look>).hands;
  delete (look as Partial<typeof look>).feet;
  const restored=normalizeCoachLook(look);
  expect([restored.neck,restored.hands,restored.feet]).toEqual([1,1,1]);
  const sizes=resolvedProportions(restored);
  expect([sizes.neck,sizes.hands,sizes.feet]).toEqual([1,1,1]);
 });
 it('préserve les matières réelles de discipline et la configuration économique',()=>{
  const map=new Texture(),normalMap=new Texture(),roughnessMap=new Texture(),alphaMap=new Texture();
  const original=new MeshStandardMaterial({name:'short-mma',color:'#4a8bd0',map,normalMap,roughnessMap,alphaMap,transparent:true,opacity:.75,roughness:.82,metalness:.03});
  const premium=prepareSportOutfitMaterial(original,false);
  const lite=prepareSportOutfitMaterial(original,true);
  expect(premium).toBeInstanceOf(MeshPhysicalMaterial);
  for(const item of [premium,lite]){
   const m=item as MeshStandardMaterial;
   expect(m.color.getHexString()).toBe(original.color.getHexString());
   expect(m.map).toBe(map);expect(m.normalMap).toBe(normalMap);
   expect(m.roughnessMap).toBe(roughnessMap);expect(m.alphaMap).toBe(alphaMap);
   expect(m.transparent).toBe(true);expect(m.opacity).toBe(.75);
  }
 });
 it('partage trois sources réelles de lumière entre les rendus et le Studio',()=>{
  for(const mode of ['ultra','fitness','comic'] as const){
   const preset=studioLightingPreset(mode);
   expect(preset.key.intensity).toBeGreaterThan(0);
   expect(preset.fill.intensity).toBeGreaterThan(0);
   expect(preset.rim.position[2]).toBeLessThan(0);
  }
  expect(source('StudioCoach.tsx')).toContain("studioLightingPreset('ultra')");
  expect(source('App.tsx')).toContain('studioLightingPreset(renderStyle)');
 });
 it('affiche un profil sans popup : nom, surnom, taille, poids et discipline phare',()=>{
  const form=source('CoachProfileEditor.tsx'),studio=source('StudioCoach.tsx');
  for(const field of ['Nom du coach','Surnom du combattant','Taille en centimètres','Poids en kilogrammes','Discipline phare'])
   expect(form).toContain(field);
  expect(studio).toContain('<CoachProfileEditor identite={identity}');
  expect(studio).not.toContain("window.prompt('Nom du coach'");
  expect(studio).toContain("name:identity.name.trim().slice(0,60)");
 });
 it('affiche les presets dans un rail vertical hors Canvas sans faux réglages',()=>{
  const palette=source('SculptorFloatingPresets.tsx'),css=source('SculptorFloatingPresets.css'),studio=source('StudioCoach.tsx');
  expect(palette).toContain('Modèle GLB sans déformation compatible.');
  expect(palette).toContain('onClick={()=>onChoisir(cle,form.value)}');
  expect(css).toContain('overflow-y:auto');
  expect(studio).toContain('<SculptorFloatingPresets region={regionActive}');
  expect(studio).toContain('presetDisponible');
  expect(studio).not.toContain('Afficher le diagnostic détaillé');
 });
});
