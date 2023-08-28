import * as THREE from 'three';

const GRAV_CONSTANT = 6.6743 * Math.pow(10, -11);

/**
 * Planets simulates n-body gravity by doing the calculation on
 * the CPU. This was treated as warm up to doing the calc in shaders.
 */
export default class Planets {
  constructor(_scene) {
    this.n = 2;

    this.positions = new Float32Array(this.n * 3);
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

    // const a = new THREE.Vector3(0, 0, 0);
    // const b = new THREE.Vector3(1, 0, 0);
    // console.log(a.distanceTo(b));
  }

  updatePositions(elapsedTime) {
    /**
     * Calculate new positions based on gravity
     */
    const n = this.n;
    const masses = 25000;

    for (let i = 0; i < n; i++) {
      let total_force = new THREE.Vector3(0, 0, 0);

      // Represent current body position as vec3
      const position = new THREE.Vector3(
        this.positions[i * 3],
        this.positions[i * 3 + 1],
        this.positions[i * 3 + 2]
      );

      // Loop over all other bodies
      for (let j = 0; j < n; j++) {
        if (i === j) continue;

        // Represent foriegn body position as vec3
        const f_body_position = new THREE.Vector3(
          this.positions[j * 3],
          this.positions[j * 3 + 1],
          this.positions[j * 3 + 2]
        );

        // Calculate distance between points
        const distance = position.distanceTo(f_body_position);

        // Subtract foriegn body vec from position and normalize to get unit vec
        const unit_vec = position.add(f_body_position.negate()).normalize();

        // Calc acceleration due to gravity for this body
        const acc_due_to_body =
          (GRAV_CONSTANT * masses * masses) / (distance * distance);

        // Force vector for this foreign body
        const force_vec = unit_vec.multiplyScalar(acc_due_to_body);

        total_force = total_force.add(force_vec);

        console.log(total_force);
      }
    }
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
    this.updatePositions(elapsedTime);
  }
}
