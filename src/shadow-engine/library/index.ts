import { Author, StanceOffsets, StanceStyle } from '../author';
import {auditCatalog} from '../../lab/biomechanicsAudit';
import {correctGroundContact} from '../../lab/groundContact';
import { Motion, mirrorMotion } from '../motion';
import type { CoachRig } from '../rig';
import { balanceKeys } from '../balance';
import { boxingMotions } from './boxing';
import { legMotions } from './legs';
import { mmaMotions } from './mma';
import { grapplingMotions } from './grappling';
import { upperMotions } from './upper';

export type MotionLibrary = Map<string, Motion>;

const cache = new WeakMap<CoachRig, Map<string, MotionLibrary>>();

/** All motions of a stance style for one coach (orthodox ids, plus "ids@gaucher" mirrored on demand). */
export function getLibrary(rig: CoachRig, style: StanceStyle, profile?: { id: string; offsets: StanceOffsets }): MotionLibrary {
  let perRig = cache.get(rig);
  if (!perRig) cache.set(rig, (perRig = new Map()));
  const key = profile ? `${style}:${profile.id}` : style;
  let lib = perRig.get(key);
  if (!lib) {
    const a = new Author(rig.metrics, rig.chestFrame.bind(rig), style, profile?.offsets);
    lib = new Map();
    for (const authored of buildAll(a)) {
      const m=correctGroundContact(authored);
      // joint safety on every key pose: no elbow folded beyond its natural range
      for (const k of m.keys) a.openElbows(k.pose);
      if (m.balance) balanceKeys(rig, m);
      lib.set(m.id, m);
    }
    // Run diagnostics across every authored movement for this rig and stance.
    // Do not silently rewrite techniques: findings require biomechanical review.
    if(import.meta.env.DEV){
      const findings=auditCatalog(lib.values());
      if(findings.length)console.warn('[CME biomechanics audit]',findings.length,'findings',findings.slice(0,20));
    }
    perRig.set(key, lib);
  }
  return lib;
}

export function getMotion(lib: MotionLibrary, id: string, southpaw: boolean): Motion | undefined {
  if (!southpaw) return lib.get(id);
  const key = `${id}@gaucher`;
  let m = lib.get(key);
  if (!m) {
    const base = lib.get(id);
    if (!base) return undefined;
    m = { ...mirrorMotion(base), id: key };
    lib.set(key, m);
  }
  return m;
}

function buildAll(a: Author): Motion[] {
  return [...boxingMotions(a), ...legMotions(a), ...upperMotions(a), ...mmaMotions(a), ...grapplingMotions(a)];
}
