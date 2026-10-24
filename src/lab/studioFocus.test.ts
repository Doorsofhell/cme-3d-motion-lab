import {describe,it,expect} from 'vitest';
import {Bone,Group} from 'three';
import {distancePourZone,focusForSection,focusForSetting,mesurerZoneStudio} from './studioFocus';

function mannequin(){
 const root=new Group();root.position.set(12,0,-7);
 const hips=new Bone();hips.name='mixamorigHips';hips.position.set(0,.95,0);root.add(hips);
 const spine=new Bone();spine.name='mixamorigSpine';spine.position.set(0,.23,0);hips.add(spine);
 const chest=new Bone();chest.name='mixamorigSpine2';chest.position.set(0,.33,0);spine.add(chest);
 const neck=new Bone();neck.name='mixamorigNeck';neck.position.set(0,.26,0);chest.add(neck);
 const head=new Bone();head.name='mixamorigHead';head.position.set(0,.19,0);neck.add(head);
 for(const side of ['Left','Right']){
  const arm=new Bone();arm.name='mixamorig'+side+'Arm';arm.position.set(side==='Left'?.35:-.35,0,0);chest.add(arm);
  const hand=new Bone();hand.name='mixamorig'+side+'Hand';hand.position.set(side==='Left'?.4:-.4,-.45,0);arm.add(hand);
  const leg=new Bone();leg.name='mixamorig'+side+'UpLeg';leg.position.set(side==='Left'?.14:-.14,-.08,0);hips.add(leg);
  const shin=new Bone();shin.name='mixamorig'+side+'Leg';shin.position.set(0,-.42,0);leg.add(shin);
  const foot=new Bone();foot.name='mixamorig'+side+'Foot';foot.position.set(0,-.43,.08);shin.add(foot);
 }
 return root;
}
describe('P0 — cadrage contextuel Studio Coach',()=>{
 it('associe les catégories aux zones anatomiques attendues',()=>{
  expect(focusForSection('corps')).toBe('corps');
  expect(focusForSection('visage')).toBe('visage');
  expect(focusForSection('cheveux')).toBe('cheveux');
  expect(focusForSection('peau')).toBe('peau');
  expect(focusForSection('protections')).toBe('mains');
 });
 it('cible chaque réglage sans inventer de nouvelles commandes morphologiques',()=>{
  expect(focusForSetting('shoulders','corps')).toBe('buste');
  expect(focusForSetting('waist','corps')).toBe('abdomen');
  expect(focusForSetting('eyeColor','visage')).toBe('visage');
  expect(focusForSetting('gloveColor','protections')).toBe('mains');
  expect(focusForSetting('shinColor','protections')).toBe('tibias');
  expect(focusForSetting('hips','corps')).toBe('hanches');
  expect(focusForSetting('chest','corps')).toBe('buste');
  expect(focusForSetting('thighs','corps')).toBe('jambes');
  expect(focusForSetting('somethingUnknown','tenue')).toBe('corps');
 });
 it('mesure la tête, les mains et les jambes dans le système mondial du vrai rig',()=>{
  const root=mannequin();
  const face=mesurerZoneStudio(root,'visage');
  const full=mesurerZoneStudio(root,'corps');
  const hands=mesurerZoneStudio(root,'mains');
  const shins=mesurerZoneStudio(root,'tibias');
  expect(face.repli).toBe(false);
  expect(face.centre.x).toBeCloseTo(12);
  expect(face.centre.y).toBeGreaterThan(full.centre.y);
  expect(hands.centre.x).toBeCloseTo(12);
  expect(hands.centre.y).toBeGreaterThan(shins.centre.y);
  expect(full.os).toBeGreaterThan(face.os);
 });
 it('utilise un repli sûr quand les os spécialisés sont absents',()=>{
  const root=new Group();
  const hips=new Bone();hips.name='Hips';hips.position.y=1;root.add(hips);
  const head=new Bone();head.name='Head';head.position.y=.6;hips.add(head);
  const arms=mesurerZoneStudio(root,'mains');
  expect(arms.repli).toBe(true);
  expect(arms.centre.y).toBeCloseTo(1.3);
  const empty=mesurerZoneStudio(new Group(),'visage');
  expect(empty.repli).toBe(true);
  expect(empty.os).toBe(0);
 });
 it('respecte le champ de vision étroit des mobiles en portrait',()=>{
  const portrait=distancePourZone(.3,38,.48,'visage');
  const paysage=distancePourZone(.3,38,1.8,'visage');
  expect(portrait).toBeGreaterThan(paysage);
  expect(portrait).toBeGreaterThan(0);
 });
});
