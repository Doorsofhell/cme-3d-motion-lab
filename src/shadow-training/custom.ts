import type {DisciplineId} from './domain/types';
/** Compatibilité de planification ; les coachs et animations restent du côté CME-3D. */
export type CustomCombo={id:string;name:string;discipline:DisciplineId;sequence:string[]};
