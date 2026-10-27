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
        const keys = motion!.keys;
        const guard = keys[0].pose;
        const toWorld = (pose: typeof guard) => (pose[hand].space === 'world' ? pose[hand].pos : author.toWorld(pose, pose[hand].pos));
        const first = toWorld(guard);
        // préparation courte : avant l'impact, le poing ne s'écarte pas de plus de 12 cm de la garde
        for (const k of keys.filter((k) => k.t > 0 && k.t < motion!.impacts[0])) {
          const p = toWorld(k.pose);
          expect(new Vector3(p.x - first.x, p.y - first.y, p.z - first.z).length()).toBeLessThan(0.12 * author.s);
        }
        // retour en garde
        expect(keys[keys.length - 1].pose[hand]).toEqual(guard[hand]);
        expect(motion!.impacts).toHaveLength(1);
        if (!id.endsWith('corps')) {
          // Shadow 0.42 : coude fléchi à l'impact (crochet), le poing reste en deçà de la longueur du bras tendu
          const impact = keys.reduce((a, b) => (Math.abs(b.t - motion!.impacts[0]) < Math.abs(a.t - motion!.impacts[0]) ? b : a)).pose;
          const sh = author.shoulder(impact, hand === 'handL' ? 'L' : 'R');
          const p = toWorld(impact);
          expect(new Vector3(p.x, p.y, p.z).distanceTo(sh)).toBeLessThan(0.97 * (metrics.upperArm + metrics.foreArm));
        }
      });
    }
  }
});
