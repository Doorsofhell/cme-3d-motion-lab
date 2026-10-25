import {describe,it,expect} from 'vitest';
import {Box3,BoxGeometry,Group,Mesh,MeshBasicMaterial,Vector3} from 'three';
import {ANATOMICAL_VIEWS,directionAnatomique} from './AnatomicalReference';
import {calculerDistanceSilhouette,mesurerSilhouetteVisible} from './anatomicalBounds';

function mannequin(type:'homme'|'femme'){
 const root=new Group();
 const mesh=(w:number,h:number,d:number,x:number,y:number,z:number)=>{
  const part=new Mesh(new BoxGeometry(w,h,d),new MeshBasicMaterial());
  part.position.set(x,y,z);root.add(part);return part;
 };
 mesh(type==='homme'?.64:.52,1.1,type==='femme'?.43:.34,0,1.22,0);
 mesh(type==='homme'?.44:.57,.42,type==='femme'?.48:.36,0,.51,-.04);
 mesh(.22,.28,.22,0,1.96,0);
 mesh(.18,.92,.19,-.14,.07,0);
 mesh(.18,.92,.19,.14,.07,0);
 // Volume de poitrine, bassin et fessiers au-delà des pivots du rig
 if(type==='femme')mesh(.48,.22,.22,0,1.46,.22);
 mesh(type==='femme'?.52:.41,.34,.30,0,.47,-.23);
 const invisible=mesh(200,200,200,100,0,100);invisible.visible=false;
 return root;
}

describe('Audit Android anatomique H/F : cadrages 360°',()=>{
 it.each(['homme','femme'] as const)('inclut le maillage visible et écarte les accessoires masqués : %s',sex=>{
  const root=mannequin(sex);
  const measure=mesurerSilhouetteVisible(root);
  expect(measure).not.toBeNull();
  expect(measure!.maillages).toBe(sex==='femme'?7:6);
  expect(measure!.centre.x).toBeCloseTo(0,1);
  expect(measure!.centre.y).toBeGreaterThan(.6);
  expect(measure!.centre.y).toBeLessThan(1.5);
  expect(measure!.rayon).toBeGreaterThan(.95);
  expect(measure!.rayon).toBeLessThan(1.4);
 });
 it('les quatre orientations restent constantes et opposées 2 à 2',()=>{
  const dirs=ANATOMICAL_VIEWS.map(v=>new Vector3(...directionAnatomique(v.id)).normalize());
  expect(ANATOMICAL_VIEWS.length).toBe(4);
  expect(dirs[0].dot(dirs[1])).toBeLessThan(-.99);
  expect(dirs[2].dot(dirs[3])).toBeLessThan(-.99);
  expect(Math.abs(dirs[0].dot(dirs[2]))).toBeLessThan(.02);
 });
 it.each(['homme','femme'] as const)('garde la totalité du corps %s dans les quatre vues mobile',sex=>{
  const root=mannequin(sex);
  const body=mesurerSilhouetteVisible(root)!;
  const bounds=new Box3().setFromObject(root);
  const corners=[
   new Vector3(bounds.min.x,bounds.min.y,bounds.min.z),
   new Vector3(bounds.min.x,bounds.min.y,bounds.max.z),
   new Vector3(bounds.min.x,bounds.max.y,bounds.min.z),
   new Vector3(bounds.min.x,bounds.max.y,bounds.max.z),
   new Vector3(bounds.max.x,bounds.min.y,bounds.min.z),
   new Vector3(bounds.max.x,bounds.min.y,bounds.max.z),
   new Vector3(bounds.max.x,bounds.max.y,bounds.min.z),
   new Vector3(bounds.max.x,bounds.max.y,bounds.max.z)
  ];
  for(const aspect of [.5,.7,1.7]){
   const fov=38*Math.PI/180,distance=calculerDistanceSilhouette(body.rayon,38,aspect);
   for(const view of ANATOMICAL_VIEWS){
    const direction=new Vector3(...directionAnatomique(view.id)).normalize();
    const right=new Vector3().crossVectors(new Vector3(0,1,0),direction).normalize();
    const up=new Vector3().crossVectors(direction,right).normalize();
    for(const pt of corners){
     const diff=pt.clone().sub(body.centre);
     const depth=distance-diff.dot(direction);
     expect(depth).toBeGreaterThan(0);
     const maxY=depth*Math.tan(fov/2);
     const maxX=maxY*aspect;
     expect(Math.abs(diff.dot(up))).toBeLessThanOrEqual(maxY+.01);
     expect(Math.abs(diff.dot(right))).toBeLessThanOrEqual(maxX+.01);
    }
   }
  }
 });
});
