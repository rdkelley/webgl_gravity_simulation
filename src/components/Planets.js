import * as THREE from 'three';

const GRAV_CONSTANT = 6.6743 * Math.pow(10, -11);
const EARTH_MASS = 5.97219 * Math.pow(10, 24);
const MOON_MASS = 7.34767309 * Math.pow(10, 22);
const EARTH_RADIUS = 6378;

/**
 * Planets simulates n-body gravity by doing the calculation on
 * the CPU. This was treated as warm up to doing the calc in shaders.
 */
export default class Planets {
  constructor(_scene) {
    this.n = 3;

    const position_arr = [0, 0, 0, 384400, 0, 0, 100000, 50000, 0];
    this.positions = new Float32Array(position_arr);
    // this.positions = new Float32Array(this.n * 3);

    const velocity_arr = [0, 250, 0, 15000, 15000, 0, 5000, 5000, 0];
    this.velocities = new Float32Array(velocity_arr);
    // this.velocities = new Float32Array(this.n * 3);

    this.mass_arr = new Float32Array([EARTH_MASS, MOON_MASS, MOON_MASS]);

    this.setAttributes();

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.elapsedTime = 0;

    this.meshes.forEach((mesh) => {
      _scene.add(mesh);
    });

    const axesHelper = new THREE.AxesHelper(200000);
    _scene.add(axesHelper);

    this.setInitPositions();
  }

  updatePositions(elapsedTime) {
    /**
     * Calculate new positions based on gravity
     */
    const n = this.n;

    const delta_time = elapsedTime - this.elapsedTime;
    this.elapsedTime = elapsedTime;

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

        if (position.distanceTo(f_body_position) < EARTH_RADIUS) {
          continue;
        }

        // Calculate distance between points
        const distance = position.distanceTo(f_body_position);

        // Subtract foriegn body vec fromposition.negate() position and normalize to get unit vec
        const neg_position = position.clone().negate();
        const unit_vec = f_body_position.clone().add(neg_position).normalize();

        // Force vector for this foreign body
        const force_vec = unit_vec.multiplyScalar(
          (GRAV_CONSTANT * (this.mass_arr[i] * this.mass_arr[j])) / (distance * distance)
        );

        total_force = total_force.add(force_vec);
      }

      const acc = total_force.clone().divideScalar(this.mass_arr[i]);
      const delta_velocity = acc.clone().multiplyScalar(delta_time);

      const init_velocity = new THREE.Vector3(
        this.velocities[i * 3],
        this.velocities[i * 3 + 1],
        this.velocities[i * 3 + 2]
      );

      if (i === 1) {
        console.log('init_velocity', init_velocity);
        console.log('delta_velocity', delta_velocity);
      }

      const new_velocity = init_velocity.clone().add(delta_velocity);

      if (i === 1) {
        console.log('new_velocity', new_velocity);
      }

      // s = s0 + v_0t + .5at^2
      const delta_disp = init_velocity
        .clone()
        .multiplyScalar(delta_time)
        .add(
          acc
            .clone()
            .multiplyScalar(0.5)
            .multiplyScalar(delta_time * delta_time)
        );

      const new_position = position.clone().add(delta_disp);

      this.meshes[i].position.x = new_position.x;
      this.meshes[i].position.y = new_position.y;
      this.meshes[i].position.z = new_position.z;

      // Update position
      this.positions[i * 3] = new_position.x;
      this.positions[i * 3 + 1] = new_position.y;
      this.positions[i * 3 + 2] = new_position.z;

      // Update velocity
      this.velocities[i * 3] = new_velocity.x;
      this.velocities[i * 3 + 1] = new_velocity.y;
      this.velocities[i * 3 + 2] = new_velocity.z;

      if (i === 1) {
        console.log('this.velocities', this.velocities);
        console.log('---------------');
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
    // for (let i = 0; i < n * 3; i++) {
    //   this.positions[i] = Math.random() * 7;
    // }
  }

  setGeometry() {
    const n = this.n;
    const geometries = [];

    const radius = EARTH_RADIUS;
    const widthSegments = 16;
    const heightSegments = 16;

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
