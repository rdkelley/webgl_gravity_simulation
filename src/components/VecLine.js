import * as THREE from 'three';

export default class VecLine {
  constructor(_scene, points) {
    this.points = points;

    this.setGeometry();
    this.setMaterial();
    this.setLine();

    console.log(this.line);

    _scene.add(this.line);
  }

  setGeometry() {
    this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);
  }

  setMaterial() {
    this.material = new THREE.LineBasicMaterial({
      color: 0x0000ff,
    });
  }

  setLine() {
    this.line = new THREE.Line(this.geometry, this.material);
  }

  updateVector() {}

  updateOnTick(elapsedTime) {
    this.updateVector(elapsedTime);
  }
}
