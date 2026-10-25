import navigation from './modules/navigation.json';
import body from './modules/body.json';
import face from './modules/face.json';
import skin from './modules/skin.json';
import movements from './modules/movements.json';
import technical from './modules/technical.json';
import gallery from './modules/gallery.json';

export const moduleConfigs={navigation,body,face,skin,movements,technical,gallery} as const;
export type ConfigModuleId=keyof typeof moduleConfigs;
export type ParameterType='slider_float'|'boolean'|'color_hex'|'enum';
export type ConfigParameter={id:string;label:string;type?:ParameterType;range?:readonly [number,number];driver?:string;sexes?:readonly string[]};
export function getConfigModule<T extends ConfigModuleId>(name:T):typeof moduleConfigs[T]{
 return moduleConfigs[name];
}
export function validateModuleConfigs():string[]{
 const errors:string[]=[];
 for(const [key,module] of Object.entries(moduleConfigs)){
  if(module.id!==key)errors.push(key+': id mismatch');
  if(!Number.isInteger(module.version)||module.version<1)errors.push(key+': invalid version');
  if('groups' in module){
   const groups=module.groups as ConfigParameter[];
   if(new Set(groups.map(g=>g.id)).size!==groups.length)errors.push(key+': duplicate group');
   for(const group of groups){
    if(group.range&&(!(group.range[0]<group.range[1])||group.range.some(x=>!Number.isFinite(x))))errors.push(key+'/'+group.id+': invalid range');
   }
  }
 }
 return errors;
}
/** Module schemas describe available capabilities, not unsupported 3D effects. */
