/** Politique de ressources graphique CME : une seule scène animée visible. */
export function shouldRenderLabFrames(tab:string,pageVisible:boolean):boolean{
 return tab==='lab'&&pageVisible;
}
/** Préchargement du sexe alternatif après disponibilité du modèle actif. */
export function alternateRigAsset(sex:'homme'|'femme'):'mma-kadir'|'mma-amara'{
 return sex==='homme'?'mma-amara':'mma-kadir';
}

/**
 * N'émet une alerte de chargement que lorsque le Laboratoire est réellement
 * actif et qu'aucun rig prêt ou échec explicite n'a été observé.
 * Le Canvas du Laboratoire reste monté sous l'onglet Studio Coach.
 */
export function shouldMonitorLabLoading(active:boolean,ready:boolean,error:string|null):boolean{
 return active&&!ready&&!error;
}
