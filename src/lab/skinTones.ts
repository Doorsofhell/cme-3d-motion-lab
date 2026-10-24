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
