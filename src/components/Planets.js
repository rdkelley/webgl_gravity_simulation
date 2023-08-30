import * as THREE from 'three';
import VecLine from './VecLine';

const GRAV_CONSTANT = 6.6743 * Math.pow(10, -20); // km
// const EARTH_MASS = 5.97219 * Math.pow(10, 24); // kg
const EARTH_MASS = 5.97219 * Math.pow(10, 25); // kg
const MOON_MASS = 7.34767309 * Math.pow(10, 22); //kg
const EARTH_RADIUS = 6378; //km
const EARTH_MOON_DIST = 384400; //km

const SIM_RATE = 10000;

/**
 * Planets simulates gravity by doing the calculation on
 * the CPU. This was treated as warm up to doing the calc in shaders.
 */
export default class Planets {
  constructor(_scene) {
    this.n = 100;
    this.scene = _scene;

    // const position_arr = [0, 0, 0, EARTH_MOON_DIST, 0, 0, 100000, 50000, 0];
    this.positions = new Float32Array(this.n * 3);
    this.velocities = new Float32Array(this.n * 3);

    this.masses = new Float32Array(this.n);
    this.masses[0] = EARTH_MASS;

    this.radii = new Float32Array(this.n);
    this.radii[0] = EARTH_RADIUS;
    // this.positions = new Float32Array(this.n * 3);

    for (let i = 1; i < this.n; i++) {
      const mass = Math.random() * 2 * MOON_MASS;
      console.log(mass);
      this.masses[i] = mass;
      this.radii[i] = mass / (4.2266 * Math.pow(10, 19));
    }

    for (let i = 3; i < this.n * 3; i++) {
      if (i % 3 === 0) {
        this.positions[i] =
          Math.random() *
          1.5 *
          EARTH_MOON_DIST *
          (Math.random() < 0.5 ? -1 : 1);
      } else if ((i - 1) % 3 === 0) {
        this.positions[i] = 0;
      } else {
        this.positions[i] =
          Math.random() *
          2 *
          EARTH_MOON_DIST *
          (Math.random() < 0.5 ? -1 : 1);
      }
    }

    for (let i = 3; i < this.n * 3; i++) {
      this.velocities[i] = Math.random() * 2;
    }

    this.setAttributes();

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.elapsedTime = 0.0;

    this.meshes.forEach((mesh) => {
      this.scene.add(mesh);
    });

    const axesHelper = new THREE.AxesHelper(200000);
    this.scene.add(axesHelper);

    this.setInitPositions();
  }

  updatePositions(elapsedTime) {
    /**
     * Calculate new positions based on gravity
     */
    const n = this.n;

    const delta_time = (elapsedTime - this.elapsedTime) * SIM_RATE;
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

        if (
          position.distanceTo(f_body_position) <=
          this.radii[i] + this.radii[j]
        ) {
          continue;
        }

        // Calculate distance between points
        const distance = position.distanceTo(f_body_position);

        // Subtract foriegn body vec fromposition.negate() position and normalize to get unit vec
        const neg_position = position.clone().negate();
        const unit_vec = f_body_position.clone().add(neg_position).normalize();

        // Force vector for this foreign body
        const force_vec = unit_vec.multiplyScalar(
          (GRAV_CONSTANT * (this.masses[i] * this.masses[j])) /
            (distance * distance)
        );

        total_force = total_force.add(force_vec);
      }

      const acc = total_force.clone().divideScalar(this.masses[i]);
      const delta_velocity = acc.clone().multiplyScalar(delta_time);

      const init_velocity = new THREE.Vector3(
        this.velocities[i * 3],
        this.velocities[i * 3 + 1],
        this.velocities[i * 3 + 2]
      );

      // console.log(init_velocity);
      const new_velocity = init_velocity.clone().add(delta_velocity);

      // if (i === 0) {
      //   console.log(new_velocity);
      // }

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

      // console.log(new_velocity);
      // Update velocity
      this.velocities[i * 3] = new_velocity.x;
      this.velocities[i * 3 + 1] = new_velocity.y;
      this.velocities[i * 3 + 2] = new_velocity.z;
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

    const widthSegments = 16;
    const heightSegments = 16;

    for (let i = 0; i < n; i++) {
      geometries.push(
        new THREE.SphereGeometry(
          i === 0 ? this.radii[0] : this.radii[1],
          widthSegments,
          heightSegments
        )
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
