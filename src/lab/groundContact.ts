import type {Motion} from '../shadow-engine/motion';
import type {FootPose} from '../shadow-engine/pose';

/** Normalize tiny floor-penetration errors without changing horizontal foot placement. */
export function correctGroundContact(motion:Motion):Motion {
 const foot=(f:FootPose):FootPose=>{
  if(f.mode!=='ground'||!Number.isFinite(f.ball.y)||f.ball.y>=0||f.ball.y<-.04)return f;
  return {...f,ball:{...f.ball,y:0}};
 };
 return {...motion,keys:motion.keys.map(k=>({...k,pose:{...k.pose,footL:foot(k.pose.footL),footR:foot(k.pose.footR)}}))};
}
