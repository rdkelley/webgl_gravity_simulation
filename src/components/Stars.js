import * as THREE from 'three';

export default class Stars {
  constructor(_scene) {
    this.N_BODIES = 3;
    this.setGeometry();
    this.setMaterial();
    this.setPoints();

    _scene.add(this.points);
  }

  setGeometry() {
    const n = this.N_BODIES;

    this.geometry = new THREE.BufferGeometry();

    // Create Float32Array to hold x,y,z coords
    const positions = new Float32Array(n * 3);

    // Populate positions
    for (let i = 0; i < n * 3; i++) {
      positions[i] = Math.random();
    }

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
  }

  setMaterial() {
    this.material = new THREE.PointsMaterial();
    this.material.size = 0.02;
    this.material.sizeAttenuation = true;
  }

  setPoints() {
    this.points = new THREE.Points(this.geometry, this.material);
  }
}
