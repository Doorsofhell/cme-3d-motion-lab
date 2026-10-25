import type {SVGProps} from 'react';
type Zone='corps'|'silhouette'|'visage'|'peau'|'cheveux'|'tenue'|'protections';
/** Drawn anatomy pictograms, not font glyphs, consistent in light/dark modes. */
export function AnatomyIcon({zone,...props}:{zone:Zone}&SVGProps<SVGSVGElement>){
 const common={fill:'none',stroke:'currentColor',strokeLinecap:'round' as const,strokeLinejoin:'round' as const,strokeWidth:1.8};
 return <svg {...props} viewBox="0 0 48 48" role="img" aria-label={'Zone '+zone} {...common}>
  {zone==='visage'?<><path d="M13 13Q16 5 24 5T35 14V26Q34 36 24 41Q14 36 13 26Z"/><path d="M17 22q4-3 7 0m0 0q4-3 7 0M24 20v8l-3 2 3 2 3-2m-8 5q5 3 10 0"/><path d="M13 13q8-7 22 0"/></>:
  zone==='cheveux'?<><path d="M13 24Q9 8 24 6Q39 8 35 24v10Q30 42 24 43Q18 42 13 34Z"/><path d="M12 20Q12 5 21 12Q26 3 34 13M15 13q3 10 10 6M31 9q-2 13-7 12M36 20q-5 3-8 1"/></>:
  zone==='peau'?<><path d="M19 7Q24 2 29 7l3 9 7 6-1 15H10L9 22l7-6Z"/><path d="M12 29Q24 21 36 29M18 35l2-1m5-2 2 1m-13-8 1 1"/><circle cx="29" cy="24" r="2.5"/></>:
  zone==='tenue'?<><path d="M16 6l-10 9 6 10 6-4v21h12V21l6 4 6-10-10-9-4 6h-8Z"/><path d="M20 11q4 7 8 0M18 27h12M21 32h6"/></>:
  zone==='protections'?<><path d="M12 11q10-9 23 0v10q-1 12-11 19Q13 33 12 21Z"/><path d="M18 24l4 4 9-11M9 19h3m24 0h3"/></>:
  zone==='silhouette'?<><circle cx="24" cy="7" r="4"/><path d="M19 14Q10 17 15 26l5 5-3 12m12-29q9 3 4 12l-5 5 3 12M20 14q4 4 8 0m-8 17q4 6 8 0M20 18q-6 6 0 13m8-13q6 6 0 13M24 31v12"/></>:
  <><circle cx="24" cy="7" r="4"/><path d="M18 13L7 19l3 11 6-3 4-7v12l-3 11m13-30 11 6-3 11-6-3-4-7v12l3 11M18 13q6 5 12 0M20 32h8M24 22v17"/></>}
 </svg>;
}
