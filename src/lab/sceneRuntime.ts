/** Politique de ressources graphique CME : une seule scène animée visible. */
export function shouldRenderLabFrames(tab:string,pageVisible:boolean):boolean{
 return tab==='lab'&&pageVisible;
}
/** Préchargement du sexe alternatif après disponibilité du modèle actif. */
export function alternateRigAsset(sex:'homme'|'femme'):'mma-kadir'|'mma-amara'{
 return sex==='homme'?'mma-amara':'mma-kadir';
}
