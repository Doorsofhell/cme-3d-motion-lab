import type {ShapeKey} from './visualShapePresets';
/** Croquis anatomique vectoriel : la forme du dessin suit la valeur réelle du preset. */
export function MorphThumbnail({part,value}:{part:ShapeKey;value:number}){
 const delta=value-1;
 const face=['jaw','nose','eyes'].includes(part);
 const shoulders=part==='shoulders'?23+delta*38:23+(part==='muscle'?delta*19:0);
 const waist=part==='waist'?14+delta*26:14+(part==='roundness'?delta*17:0);
 const hips=part==='hips'?19+delta*32:19+(part==='roundness'?delta*23:0);
 const bust=part==='bust'?4+delta*16:4;
 const thighs=part==='thighs'?9+delta*21:9;
 const muscle=part==='muscle'?delta*18:0;
 if(face){
  const jaw=part==='jaw'?12+delta*35:12;
  const eyeWidth=part==='eyes'?7+delta*12:7;
  const noseWidth=part==='nose'?4+delta*10:4;
  return <svg className="coachMorphIllustration" viewBox="0 0 90 110" role="img" aria-label="Croquis de forme faciale">
   <path d={`M45 8 C21 7 17 27 18 54 C20 79 ${45-jaw} 96 45 100 C${45+jaw} 96 70 78 72 54 C74 28 69 9 45 8Z`} fill="#e0cfc2" stroke="#6c625c" strokeWidth="2"/>
   <path d="M27 36 Q34 33 41 37 M49 37 Q56 33 63 36" fill="none" stroke="#6c625c" strokeWidth="2"/>
   <ellipse cx="34" cy="44" rx={eyeWidth} ry="3.7" fill="#fff" stroke="#544940" strokeWidth="1.5"/>
   <ellipse cx="56" cy="44" rx={eyeWidth} ry="3.7" fill="#fff" stroke="#544940" strokeWidth="1.5"/>
   <circle cx="34" cy="44" r="2" fill="#4b382d"/><circle cx="56" cy="44" r="2" fill="#4b382d"/>
   <path d={`M45 44 L${45-noseWidth} 65 Q45 70 ${45+noseWidth} 65`} stroke="#795f52" fill="none" strokeWidth="2"/>
   <path d="M35 79 Q45 83 55 79" stroke="#925e63" strokeWidth="2" fill="none"/>
  </svg>;
 }
 const leftShoulder=45-shoulders,rightShoulder=45+shoulders;
 return <svg className="coachMorphIllustration" viewBox="0 0 90 110" role="img" aria-label="Croquis anatomique de la forme corporelle">
  <circle cx="45" cy="13" r="8.5" fill="#dfc6b2" stroke="#6c625c" strokeWidth="1.5"/>
  <path d={`M36 23 L${leftShoulder} 28 Q${leftShoulder-5} 31 ${leftShoulder-7} 43 L${leftShoulder-4} 65 L${leftShoulder+2} 65 L${leftShoulder+4} 42 L${45-waist} 60 Q${45-waist-2} 70 ${45-hips} 74 L${45-hips+4} 91 L${45-hips+thighs} 103 L42 103 L45 78 L48 103 L${45+hips-thighs} 103 L${45+hips-4} 91 L${45+hips} 74 Q${45+waist+2} 70 ${45+waist} 60 L${rightShoulder-4} 42 L${rightShoulder-2} 65 L${rightShoulder+4} 65 L${rightShoulder+7} 43 Q${rightShoulder+5} 31 ${rightShoulder} 28 L54 23Z`}
   fill="#cfaaa0" stroke="#6c625c" strokeWidth="1.6" strokeLinejoin="round"/>
  <path d={`M${45-waist} 60 Q45 ${65+bust} ${45+waist} 60 M${leftShoulder+8} 35 Q45 ${40+muscle+bust} ${rightShoulder-8} 35`} fill="none" stroke="#9f756c" strokeWidth="1.3"/>
  <path d="M45 54 L45 72" stroke="#a78277" strokeWidth="1" strokeDasharray="3 3"/>
 </svg>;
}
