import type {CoachLook} from './StudioCoach';
import type {NeutralRigReport} from './NeutralRig';
import type {ShapeGroup} from './visualShapePresets';

/** N'utilise jamais les capacités du GLB précédent pendant un changement de modèle. */
export function currentAtlasCapabilities(report:NeutralRigReport|null,sex:CoachLook['sex'],neutral:boolean){
 if(neutral||!report||report.sex!==sex)return null;
 return report.appearanceSupport;
}
export function canEditAtlasShape(group:ShapeGroup,support:ReturnType<typeof currentAtlasCapabilities>){
 if(!support)return false;
 switch(group.requires){
  case 'torso':return support.shape.torsoVertices>0;
  case 'hip':return support.shape.hipVertices>0;
  case 'thigh':return support.shape.thighVertices>0;
  case 'arm':return support.shape.armVertices>0;
  case 'calf':return support.shape.calfVertices>0;
  case 'neck':return support.shape.neckVertices>0;
  case 'hand':return support.shape.handVertices>0;
  case 'foot':return support.shape.footVertices>0;
  case 'bust':return support.shape.bustVertices>0;
  case 'face':return !!support.shape.faceMorphs[group.id as 'jaw'|'nose'|'eyes']||support.shape.faceVertices>0;
 }
}
