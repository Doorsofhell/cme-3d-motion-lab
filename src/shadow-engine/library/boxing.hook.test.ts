import { describe, expect, it } from 'vitest';
import { Quaternion, Vector3 } from 'three';
import { Author } from '../author';
import type { Metrics } from '../rig';
import { boxingMotions } from './boxing';

const metrics: Metrics = {
  height: 1.8,
  hipsRest: new Vector3(0, 1, 0),
  spineBaseRest: new Vector3(0, 1.24, 0),
  shoulderCenterRest: new Vector3(0, 1.47, 0),
  hipHalf: 0.14,
  shoulderHalf: 0.20,
  thigh: 0.45,
  shin: 0.44,
  upperArm: 0.31,
  foreArm: 0.26,
  eyeY: 1.66,
  ballRestY: 0.03,
  ankleFromBall: new Vector3(0, 0.08, -0.1),
  footYaw: { L: 0, R: 0 },
};

const chestFrame = (hips: Vector3, pelvis: Quaternion, chest: Quaternion) => {
  const q = pelvis.clone().multiply(chest);
  const origin = hips.clone()
    .add(metrics.spineBaseRest.clone().sub(metrics.hipsRest).applyQuaternion(pelvis))
    .add(metrics.shoulderCenterRest.clone().sub(metrics.spineBaseRest).applyQuaternion(q));
  return { origin, q };
};

describe('crochets compacts', () => {
  for (const style of ['boxing', 'muaythai'] as const) {
    for (const [id, hand] of [
      ['crochet-avant', 'handL'],
      ['crochet-arriere', 'handR'],
      ['crochet-avant-corps', 'handL'],
      ['crochet-arriere-corps', 'handR'],
    ] as const) {
      it(style + ' ' + id + ' : préparation courte, retour en garde', () => {
        const author = new Author(metrics, chestFrame, style);
        const motion = boxingMotions(author).find(m => m.id === id);
        expect(motion).toBeDefined();
        const [guard, load, impact, , recovery] = motion!.keys.map(k => k.pose);
        const toWorld = (pose: typeof guard, side: typeof hand) =>
          pose[side].space === 'world' ? pose[side].pos : author.toWorld(pose, pose[side].pos);
        const first = toWorld(guard, hand);
        const wind = toWorld(load, hand);
        const displacement = new Vector3(wind.x - first.x, wind.y - first.y, wind.z - first.z);
        expect(displacement.length()).toBeLessThan(0.12 * author.s);
        expect(impact[hand].space).toBe('world');
        expect(recovery[hand]).toEqual(guard[hand]);
        expect(motion!.impacts).toHaveLength(1);
        if (!id.endsWith('corps')) {
          const sh = author.shoulder(impact, hand === 'handL' ? 'L' : 'R');
          const p = toWorld(impact, hand);
          const radius = new Vector3(p.x, p.y, p.z).distanceTo(sh);
          expect(radius).toBeCloseTo(Math.hypot(metrics.upperArm, metrics.foreArm), 5);
        }
      });
    }
  }
});
