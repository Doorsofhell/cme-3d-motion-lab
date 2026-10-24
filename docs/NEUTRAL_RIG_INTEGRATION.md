# Neutral rig laboratory — first integration

## Implemented
- Two **existing** skinned Mixamo-compatible GLBs are reused as the male and female neutral reference rigs: `mma-kadir/photo.glb` and `mma-amara/photo.glb`.
- `NeutralRig` clones the loaded rig, restores rest pose, applies neutral grey material, and uses the **existing shared** `CoachRig`, `getLibrary`, and `MotionSampler`. It does not write to the motion engine or to Combat Shadow Studio.
- Studio Coach has a persistent 3D mode switch: procedural appearance prototype vs. rigged motion preview.
- Six discipline selectors, a motion ID input, play/pause, skeleton overlay and a runtime rig report.
- Contract tests check two distinct assets and six disciplines.

## Retargeting status — do not overstate
- Both GLBs have their own measured skeleton and rest proportions, so `CoachRig` resolves the same authored motion against each rig. This is a first practical shared-motion retargeting integration.
- The **Studio Coach appearance sliders are not yet transferred** to the skinned rigs; they still control only the procedural appearance preview.
- Tests currently verify contracts and compilation, not physical motion accuracy or equivalent foot contacts between male/female GLBs.
- No newly modeled anatomically neutral GLBs were produced. Existing character meshes were visually neutralized. This is an interim solution.
- Techniques unavailable in a selected discipline show a warning and fall back to the `garde` motion, rather than claiming support.
- Rigging, clipping, pose and performance must be checked on Android before certification.

## Next gates
1. Add golden fixtures comparing sampled poses and foot contacts on both actual GLBs for every discipline.
2. Build a typed `AppearanceAdapter` that safely applies skin/hair/body morphs to real skinned meshes, preserving bone names and rest transforms.
3. Expand from motion ID text input to the compatible technique catalogue, with no unsupported silent fallbacks.
4. Add movement-by-movement automated audit, manual biomechanics review and device FPS measurements.
5. Create truly neutral canonical humanoid GLBs only after joint naming, geometry, licenses and measurements are approved.
