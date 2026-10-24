export type NeutralHumanoidId='neutral-male'|'neutral-female';
export type LabDiscipline='boxe'|'kickboxing'|'mma'|'muaythai'|'bjj'|'judo';
export type MotionValidationState='experimental'|'automated_checks'|'biomechanics_review'|'validated';

export interface NeutralHumanoidProfile{
 readonly id:NeutralHumanoidId;
 readonly label:string;
 readonly canonicalSkeleton:'cme-humanoid-v1';
 readonly appearance:'neutral';
 readonly status:'profile_only'|'rig_available'|'qualified';
}

/** Canonical lab targets. No GLB is assumed to exist until a compatible rig is supplied. */
export const NEUTRAL_HUMANOIDS:readonly NeutralHumanoidProfile[]=[
 {id:'neutral-male',label:'Humanoïde masculin neutre',canonicalSkeleton:'cme-humanoid-v1',appearance:'neutral',status:'profile_only'},
 {id:'neutral-female',label:'Humanoïde féminin neutre',canonicalSkeleton:'cme-humanoid-v1',appearance:'neutral',status:'profile_only'}
];

export type MotionValidationKey={
 readonly humanoid:NeutralHumanoidId;
 readonly discipline:LabDiscipline;
 readonly motionId:string;
 readonly engineRevision:string;
};

export function neutralValidationKey(key:MotionValidationKey):string{
 return [key.humanoid,key.discipline,key.motionId,key.engineRevision].join(':');
}
