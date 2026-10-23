import {describe,it,expect,vi} from 'vitest';
import {watchWebGLContext} from './webglRecovery';
describe('WebGL events pendant le test',()=>{
 it('demande la restauration sans créer de nouvelle scène GPU',()=>{
  const canvas=new EventTarget(),lost=vi.fn(),restored=vi.fn();
  watchWebGLContext(canvas,{onLost:lost,onRestored:restored});
  const e=new Event('webglcontextlost',{cancelable:true});
  canvas.dispatchEvent(e);
  expect(e.defaultPrevented).toBe(true);
  expect(lost).toHaveBeenCalledOnce();
  canvas.dispatchEvent(new Event('webglcontextrestored'));
  expect(restored).toHaveBeenCalledOnce();
 });
 it('ignore la perte du contexte lors de la destruction du canvas',()=>{
  const canvas=new EventTarget(),lost=vi.fn(),restored=vi.fn();
  watchWebGLContext(canvas,{onLost:lost,onRestored:restored})();
  canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));
  canvas.dispatchEvent(new Event('webglcontextrestored'));
  expect(lost).not.toHaveBeenCalled();
  expect(restored).not.toHaveBeenCalled();
 });
 it('ne traite pas une erreur générique comme une erreur WebGL',()=>{
  const canvas=new EventTarget(),lost=vi.fn(),restored=vi.fn();
  watchWebGLContext(canvas,{onLost:lost,onRestored:restored});
  canvas.dispatchEvent(new Event('error'));
  expect(lost).not.toHaveBeenCalled();
  expect(restored).not.toHaveBeenCalled();
 });
});
