/** Realistic skin-tone presets: user-visible sRGB, from fair to deep.
 * A palette is not proof of photorealistic rendering on a given GLB texture.
 */
export const SKIN_TONES=[
 {name:'Porcelaine',hex:'#efcdb5'},
 {name:'Clair',hex:'#dfb097'},
 {name:'Doré',hex:'#ce9877'},
 {name:'Médium',hex:'#b97a56'},
 {name:'Olive',hex:'#a97855'},
 {name:'Bronzé',hex:'#986347'},
 {name:'Brun',hex:'#754933'},
 {name:'Foncé',hex:'#553729'}
] as const;

/** Matching saved profiles from earlier releases must retain their chosen colour. */
export const NATIVE_SKIN_REFERENCE='#b97a56';

/** Palette volontairement illustrée, conçue pour des silhouettes anime/toon :
 * elle modifie la couleur, pas la topologie ni le modèle d’éclairage.
 */
export const ANIME_SKIN_TONES=[
 {name:'Ivoire stylisé',hex:'#F5DAC6'},
 {name:'Pêche',hex:'#EDB999'},
 {name:'Doré stylisé',hex:'#DDA477'},
 {name:'Caramel',hex:'#B67B5A'},
 {name:'Cuivré',hex:'#99583D'},
 {name:'Brun anime',hex:'#73452F'},
 {name:'Profond',hex:'#4B2B24'},
 {name:'Froid stylisé',hex:'#BAA4A6'}
] as const;
