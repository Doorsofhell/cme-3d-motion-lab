import type {SculptorRegion} from './sculptorRegions';
import {AnatomyIcon} from './AnatomyIcon';
type Props={cible:SculptorRegion};
const COURBES:Record<string,string>={
 eyes:'M3 12q9-10 18 0-9 10-18 0zm9-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
 nose:'M12 3 9 15q-3 4 3 5t5-4l-5-13M9 19q3 3 6 0',
 jaw:'M5 3v9q0 5 7 9 7-4 7-9V3M7 16q5 5 10 0',
 height:'M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4M4 5h2M4 19h2',
 shoulders:'M3 11q5-9 9-3 4-6 9 3M3 11l2 9m16-9-2 9M9 8h6',
 bust:'M5 6q7-4 14 0l2 10q-5 7-9 2-4 5-9-2zM12 8v11',
 muscle:'M4 16q-3-7 3-9 4-2 5 4l4-6q5-2 6 5-1 9-10 10z',
 arms:'M7 3q-4 6-3 11l3 7m10-18q4 6 3 11l-3 7M7 10q5 2 10 0',
 waist:'M6 3q7 5 12 0M6 3q6 8 0 18m12-18q-6 8 0 18M6 21q7-5 12 0',
 roundness:'M12 3q9 1 9 9t-9 9q-9 0-9-9t9-9zM5 12h14',
 hips:'M6 3q6 6 12 0M6 3l-3 10 5 8m10-18 3 10-5 8M8 21q4-3 8 0',
 glutes:'M5 5q7 3 14 0m-14 0q-5 13 4 15 3 0 3-6 0 6 3 6 9-2 4-15M12 9v7',
 thighs:'M6 3q6 3 12 0M6 3l-2 18h6l2-12 2 12h6L18 3',
 calves:'M5 3q-3 11 4 18h3M19 3q3 11-4 18h-3M5 11q3 2 4 0m6 0q1 2 4 0',
 neck:'M9 3v6L5 13v7h14v-7l-4-4V3M9 9q3 3 6 0',
 hands:'M8 20V10M8 13 6 7M11 13V4m3 9V5m3 8V8m-9 7c0 6 9 8 11 2V9',
 feet:'M6 3v10q-5 5-3 7h17q2-4-3-5l-6-3V3'
};
export function SculptorRegionIcon({cible}:Props){
 if(cible.id==='cheveux'||cible.id==='peau'||cible.id==='tenue'||cible.id==='protections')
  return <AnatomyIcon zone={cible.zone} className="sculptorRegionIcon"/>;
 return <svg className="sculptorRegionIcon" aria-hidden="true" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
  <path d={COURBES[cible.id]??COURBES.height}/>
 </svg>;
}
