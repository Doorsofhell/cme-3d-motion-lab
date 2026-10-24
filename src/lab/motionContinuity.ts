/** Central-difference acceleration estimate for authored motion keyframes. */
export function acceleration(a:number,b:number,c:number,dt0:number,dt1:number):number {
 if(![a,b,c,dt0,dt1].every(value=>Number.isFinite(value))||dt0<=0||dt1<=0)return Infinity;
 return Math.abs((c-b)/dt1-(b-a)/dt0)/((dt0+dt1)/2);
}
