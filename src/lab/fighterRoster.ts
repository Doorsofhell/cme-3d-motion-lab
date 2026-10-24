/** Independent fighter production registry. A character is selectable only when its real assets are shipped. */
export type FighterStatus='available'|'in-production';
export type FighterProfile={id:string;name:string;status:FighterStatus;gender:'female'|'male';description:string;styles:readonly string[];assetRoot:string};
export const fighterRoster:FighterProfile[]=[
 {id:'mma-amara',name:'Amara',status:'available',gender:'female',description:'Combattante d’origine, conservée sans modification.',styles:['ultra','fitness','comic'],assetRoot:'fighters/mma-amara'},
 {id:'mma-kadir',name:'Kadir',status:'available',gender:'male',description:'Combattant d’origine, conservé sans modification.',styles:['ultra','fitness','comic'],assetRoot:'fighters/mma-kadir'},
 {id:'mma-naira',name:'Naïra',status:'in-production',gender:'female',description:'Nouvelle combattante fitness, puissante et féminine. Nouveau maillage original et rig compatible nécessaires avant activation.',styles:['ultra','fitness','comic'],assetRoot:'fighters/mma-naira'}
];
export function isAvailableFighter(id:string):id is 'mma-amara'|'mma-kadir'{return fighterRoster.some(f=>f.id===id&&f.status==='available');}
