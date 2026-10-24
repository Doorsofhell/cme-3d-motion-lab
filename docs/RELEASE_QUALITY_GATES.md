# CME-3D — Roadmap and release acceptance gates

Adopted 2026-10-24. Scope: CME-3D only. Combat Shadow Studio must not be modified.
No camera capture, motion capture, video upload or video analysis.

## Definition of Done (six mandatory gates)

| Gate | Automated implementation | Human/device evidence | Blocking rule |
| --- | --- | --- | --- |
| G1 TypeScript and unit tests | `npm ci && npm run typecheck && npm test && npm run build` on each PR and main | CI run URL and commit SHA | Failure blocks merge and release |
| G2 No regressions in previously accepted movements | Versioned golden pose/trajectory fixtures for representative motions and rigs; numerical tolerances, stable contact points, impact timing and duration | Review intentional changes to baselines | Any unapproved golden-fixture delta blocks release |
| G3 Discipline-specific trajectories and transitions | Catalog audit for boxe, kickboxing, muaythai, mma, bjj, judo; validate discipline membership, keyframe timing, chainAt, impacts, planted-foot drift, floor penetration, finite rotations and transition continuity | Technique-level acceptance by discipline, with exceptions documented | Critical motion findings block release; warning thresholds explicitly approved |
| G4 Android >=30 FPS in balanced quality | In-app frame-time sampler with warmup, >=60-second representative scenario, p50/p95 FPS and frame drops; log device model, browser, resolution, DPR and coach/style | Real reference Android device, all six discipline sample scenarios | Below 30 FPS sustained on reference device blocks release; simulator results do not count |
| G5 Ultra / Fitness / Comics clearly distinct | Three deterministic same-camera/same-coach/same-pose snapshots; shader/material and outline assertions; detect missing images | Side-by-side visual review on desktop and Android, approve each style | Missing visual sign-off blocks release |
| G6 GitHub Pages deployed and displayed version verified | After main deploy succeeds, check Pages HTTP response and app build version against package.json / buildInfo.ts; attach run URL, SHA, deployment URL | Open deployed URL and verify visible version and critical navigation | Deploy failure or version mismatch blocks release |

**Policy:** A successful CI build alone does not certify human biomechanics, Android FPS or visual quality. All six gates must be recorded with evidence before describing a release as fully qualified.

## Delivery stages and dependencies

1. **P0 — Stabilize:** Resolve PR #42 (failed test), review and merge PR #43 (motion metadata) and #44 (discipline-safe sequences) after CI; rerun CI on main.
2. **P0 — Build the biomechanics reference:** Map 86 shared techniques and 43 experimental sequences to the six disciplines; add pose/trajectory baselines, support-foot and balance diagnostics; keep experimental status until reviewed.
3. **P1 — Motion engine:** Fix measured foot sliding, hip/torso sequencing, timing discontinuities and IK/ground contact; add regression fixtures before changing motion data.
4. **P1 — Visual modes:** Deliver distinct Ultra/Fitness/modern Comics styles, preserving rig integrity and skin/garment rendering; same-pose visual comparisons.
5. **P1 — Android:** Select and document reference device; instrument frame times and WebGL memory/context loss; verify balanced >=30 FPS sustained with realistic scenes.
6. **P2 — Release automation:** Integrate required CI checks, baseline diff reports, Android evidence, visual sign-off and GitHub Pages version verification into a release checklist.

## Proposed evidence artifact per release

`release-qa/<version>/manifest.json` records version, source SHA, CI URL, motion fixture report, six discipline results, Android device and frame metrics, three-style snapshot review, deployment URL, observed version and approver. Do not commit private device identifiers.

## Practical next implementation PRs

- `ci/quality-gates`: require typecheck/test/build and prevent failed PR merge.
- `test/motion-golden-fixtures`: deterministic poses at preparation, impact and return, with tolerance and approved baseline workflow.
- `feat/android-frame-metrics`: in-app FPS capture without any camera or video.
- `test/style-snapshots`: reproducible three-mode comparison.
- `ci/pages-version-smoke`: verify published build/version after Pages deployment.

## Explicit exclusions

Do not silently alter Combat Shadow Studio. No video or camera-based workflows. Do not claim visual or biomechanical validation from static tests alone.

## Mise à jour vérifiée du 24/10/2026 — qualité de la version 0.7.18
Les références aux PR #42/#43/#44 et à « 86 gestes » dans les étapes initiales constituent un **historique**, et non la priorité de chantier à appliquer sans nouvel audit.

- **G1** : couvert par les workflows GitHub de pull request (TypeScript, Vitest, scripts de validation des modèles, build), à vérifier sur le SHA de la PR.
- **G2/G3** : couverture partielle de contrats et scripts. Aucune validation biomécanique des 306 gestes de l'Atlas ni des 43 combinaisons n'est enregistrée dans le fichier `COUVERTURE.json`.
- **G4** : non certifié ; la désactivation du rendu WebGL hors écran est une optimisation théorique, pas un FPS mesuré sur smartphone.
- **G5** : différences de matériaux testées, sans approbation visuelle reproductible des trois styles sur Android.
- **G6** : valider la réussite du workflow de déploiement lié au SHA fusionné ; confirmation HTTP, version réellement affichée et contrôle physique doivent être distingués.

Une PR peut être fusionnée après G1 vert en indiquant honnêtement G2–G6 partiels. Ne pas désigner la livraison comme totalement certifiée tant que les autres portes ne sont pas documentées.
