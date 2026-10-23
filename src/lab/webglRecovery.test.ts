import {describe,it,expect,vi} from 'vitest';
import {watchWebGLContext} from './webglRecovery';

describe('récupération du contexte WebGL',()=>{
 it('autorise la restauration automatique après une perte de contexte',()=>{
  const canvas=new EventTarget(),onLost=vi.fn(),onRestored=vi.fn();
  watchWebGLContext(canvas,{onLost,onRestored});
  const lost=new Event('webglcontextlost',{cancelable:true});
  canvas.dispatchEvent(lost);
  expect(lost.defaultPrevented).toBe(true);
  expect(onLost).toHaveBeenCalledOnce();
  expect(onRestored).not.toHaveBeenCalled();
  canvas.dispatchEvent(new Event('webglcontextrestored'));
  expect(onRestored).toHaveBeenCalledOnce();
 });
 it('détache les deux écouteurs lors du démontage du canvas',()=>{
  const canvas=new EventTarget(),onLost=vi.fn(),onRestored=vi.fn();
  const cleanup=watchWebGLContext(canvas,{onLost,onRestored});
  cleanup();
  canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));
  canvas.dispatchEvent(new Event('webglcontextrestored'));
  expect(onLost).not.toHaveBeenCalled();
  expect(onRestored).not.toHaveBeenCalled();
 });
 it('n’intercepte pas les autres erreurs du canvas',()=>{
  const canvas=new EventTarget(),onLost=vi.fn(),onRestored=vi.fn();
  watchWebGLContext(canvas,{onLost,onRestored});
  canvas.dispatchEvent(new Event('error'));
  expect(onLost).not.toHaveBeenCalled();
  expect(onRestored).not.toHaveBeenCalled();
 });
});
