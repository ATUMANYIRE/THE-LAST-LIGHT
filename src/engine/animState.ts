import * as THREE from 'three';

// Shared animation singleton — written by InteractiveGrid3D, read by CityScene3D.
// Both live inside the R3F canvas so this module-level ref is safe.
export const leadCharPos = new THREE.Vector3();
export const isAnimating = { current: false };
