// @ts-ignore — Vitest exécute ce contrat dans Node ; types de Node non nécessaires au build PWA.
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {AndroidTelemetry,percentile} from './androidTelemetry';
const read=(name:string)=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
describe('instrumentation Android CME-3D',()=>{
 it('calcule des percentiles sans modifier le tableau source',()=>{
  const source=[60,30,45,20];
  expect(percentile(source,.5)).toBe(37.5);
  expect(percentile(source,0)).toBe(20);
  expect(percentile(source,1)).toBe(60);
  expect(source).toEqual([60,30,45,20]);
  expect(percentile([],.5)).toBeNull();
 });
 it('attend cinq secondes puis produit soixante fenêtres FPS',()=>{
  const meter=new AndroidTelemetry('laboratoire');
  meter.start(0);
  for(let ms=0;ms<=68000;ms+=1000/60)meter.frame(ms);
  const result=meter.statistics();
  expect(result.phase).toBe('complete');
  expect(result.complete).toBe(true);
  expect(result.fpsBuckets).toBe(60);
  expect(result.measuredSeconds).toBe(60);
  expect(result.fpsP50).toBeGreaterThan(50);
  expect(result.fpsP95).toBeGreaterThanOrEqual(result.fpsP50??0);
  expect(result.frameMsP95).toBeLessThan(25);
 });
 it('ne certifie jamais un rapport interrompu et permet de recommencer',()=>{
  const meter=new AndroidTelemetry('studio');
  meter.start(0);meter.frame(100);meter.frame(200);meter.frame(2000);
  expect(meter.statistics().phase).toBe('interrupted');
  expect(meter.statistics().complete).toBe(false);
  meter.start(3000);
  expect(meter.statistics().phase).toBe('warmup');
  meter.interrupt('Application masquée');
  expect(meter.statistics().phase).toBe('interrupted');
  expect(meter.statistics().reason).toContain('masquée');
 });
 it('mesure les temps GLB par clé sans confondre les sélections',()=>{
  const meter=new AndroidTelemetry('studio');
  meter.beginLoad('homme/anatomie','initial',100);
  expect(meter.finishLoad('femme/anatomie',300)).toBeNull();
  expect(meter.finishLoad('homme/anatomie',360)?.durationMs).toBe(260);
  meter.beginLoad('femme/anatomie','switch',1000);
  expect(meter.finishLoad('femme/anatomie',1098)?.durationMs).toBe(98);
  expect(meter.loads[1].kind).toBe('switch');
 });
 it('mesure restauration WebGL et interrompt une mesure active',()=>{
  const meter=new AndroidTelemetry('laboratoire');
  meter.start(0);meter.recordContextLost(900);
  meter.recordContextRestored(1125);
  expect(meter.statistics().phase).toBe('interrupted');
  expect(meter.contexts.map(e=>e.kind)).toEqual(['lost','restored']);
  expect(meter.contexts[1].recoveryMs).toBe(225);
 });
 it('exporte uniquement des observations mesurées et les réserve au client',()=>{
  const meter=new AndroidTelemetry('studio');
  const report=JSON.parse(meter.exportReport({sexe:'femme'},{browser:'Android'}));
  expect(report.schema).toBe('CME3D_ANDROID_TELEMETRY_V1');
  expect(report.statistics.fpsP50).toBeNull();
  expect(report.scene).toBe('studio');
  expect(report.glbTimings).toEqual([]);
 });
 it('connecte les deux scènes au module commun sans toucher au moteur canonique',()=>{
  const lab=read('App.tsx'),studio=read('StudioCoach.tsx'),ui=read('AndroidDiagnostics.tsx');
  expect(lab).toContain('<AndroidFrameProbe telemetry={telemetry}/>');
  expect(studio).toContain('<AndroidFrameProbe telemetry={androidTelemetry}/>');
  expect(lab).toContain('<AndroidDiagnostics telemetry={androidTelemetry}');
  expect(studio).toContain('androidTelemetry.finishLoad');
  expect(studio).not.toContain('<AndroidDiagnostics telemetry={androidTelemetry}');
  expect(lab).toContain('tab===\'technical\'');
  expect(lab).toContain('telemetry.recordContextLost');
  expect(studio).toContain('androidTelemetry.recordContextRestored');
  expect(studio).toContain("beginRigLoad(value as CoachLook['sex'],rigMode,'switch')");
  expect(ui).toContain('Copier le rapport JSON');
  expect(ui).not.toContain('getUserMedia');
 });
});
