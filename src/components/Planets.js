import * as THREE from 'three';

/**
 * Planets simulates n-body gravity by doing the calculation on
 * the CPU. This was treated as warm up to doing the calc in shaders.
 */
export default class Planets {
  constructor(_scene) {
    this.n = 2;

    this.setAttributes();

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.elapsedTime = 0;

    this.meshes.forEach((mesh) => {
      _scene.add(mesh);
    });

    const axesHelper = new THREE.AxesHelper(3);
    _scene.add(axesHelper);

    this.setInitPositions();
  }

  setInitPositions() {
    const n = this.n;

    for (let i = 0; i < n; i++) {
      this.meshes[i].position.set(
        this.positions[i * 3],
        this.positions[i * 3 + 1],
        this.positions[i * 3 + 2]
      );
    }
  }

  setAttributes() {
    const n = this.n;

    // Positions
    this.positions = new Float32Array(n * 3);
    // Populate positions
    for (let i = 0; i < n * 3; i++) {
      this.positions[i] = Math.random() * 7;
    }
  }

  setGeometry() {
    const n = this.n;
    const geometries = [];

    const radius = 0.25;
    const widthSegments = 32;
    const heightSegments = 32;

    for (let i = 0; i < n; i++) {
      geometries.push(
        new THREE.SphereGeometry(radius, widthSegments, heightSegments)
      );
    }

    this.geometries = geometries;
  }

  setMaterial() {
    const n = this.n;
    const materials = [];

    for (let i = 0; i < n; i++) {
      materials.push(new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    }

    this.materials = materials;
  }

  setMesh() {
    const meshes = [];

    this.geometries.forEach((geometry, i) => {
      meshes.push(new THREE.Mesh(geometry, this.materials[i]));
    });

    this.meshes = meshes;
  }

  updateOnTick(elapsedTime) {
    this.elapsedTime = elapsedTime;
  }
}
