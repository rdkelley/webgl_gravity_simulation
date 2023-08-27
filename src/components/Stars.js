import * as THREE from 'three';

export default class Stars {
  constructor(_scene) {
    this.setGeometry();
    this.setMaterial();
    this.setMesh();

    _scene.add(this.mesh);
  }

  setGeometry() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  setMaterial() {
    this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
}
