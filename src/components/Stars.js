import * as THREE from 'three';
import StarVertexShader from '../shaders/Star/vertex.glsl';
import StarFragmentShader from '../shaders/Star/fragment.glsl';

export default class Stars {
  constructor(_scene) {
    this.N_BODIES = 500;
    this.setGeometry();
    this.setMaterial();
    this.setPoints();

    _scene.add(this.points);
  }

  setGeometry() {
    const n = this.N_BODIES;

    this.geometry = new THREE.BufferGeometry();

    this.positions = new Float32Array(n * 3);

    // Populate positions
    for (let i = 0; i < n * 3; i++) {
      this.positions[i] = Math.random();
    }

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.positions, 3)
    );
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      depthWrite: false,
      vertexColors: true,
      vertexShader: StarVertexShader,
      fragmentShader: StarFragmentShader,
      uniforms: {
        udeltaTime: { value: 0 },
        uNumParticles: { value: this.N_BODIES },
      },
    });
  }

  setPoints() {
    this.points = new THREE.Points(this.geometry, this.material);
  }

  updateMaterial(elapsedTime) {
    this.material.uniforms.udeltaTime.value = elapsedTime;
  }
}
