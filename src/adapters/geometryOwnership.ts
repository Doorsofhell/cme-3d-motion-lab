import type {BufferGeometry} from 'three';

/** Source GLB userData may be shared by BufferGeometry.clone().
 * Never mark a cached GLTF geometry as per-instance-owned.
 */
export function cloneOwnedGeometry<T extends BufferGeometry>(source:T):T{
 const copy=source.clone() as T;
 copy.userData={...source.userData,cmeOwned:true};
 return copy;
}
