import * as THREE from 'three';

const GRAV_CONSTANT = 6.6743 * Math.pow(10, -20); // km
const EARTH_MASS = 5.97219 * Math.pow(10, 24); // kg
const MOON_MASS = 7.34767309 * Math.pow(10, 22); //kg
const EARTH_RADIUS = 6378; //km
const EARTH_MOON_DIST = 384400; //km

const SIM_RATE = 10000;

export default class Planets {
  constructor(_scene, setCameraTarget) {
    this.n = 200;
    this.scene = _scene;
    this.setCameraTarget = setCameraTarget;

    // Create arrays for data storage; * 3 for any vec3 data
    this.positions = new Float32Array(this.n * 3);
    this.velocities = new Float32Array(this.n * 3);
    this.masses = new Float32Array(this.n);

    // Set 0 index to contain earth-like params
    this.masses[0] = EARTH_MASS;

    this.radii = new Float32Array(this.n);
    this.radii[0] = EARTH_RADIUS;

    this.setInitialValues();

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.elapsedTime = 0.0;

    this.meshes.forEach((mesh, i) => {
      this.scene.add(mesh);
    });

    this.initPositions();
  }

  get type() {
    return 'planets';
  }

  initPositions = () => {
    for (let i = 0; i < this.n; i++) {
      this.meshes[i].position.set(
        this.positions[i * 3],
        this.positions[i * 3 + 1],
        this.positions[i * 3 + 2]
      );
    }
  };

  setInitialValues = () => {
    /**
     * Populate random positions. xyz randomness modified
     * to create disc-like shape of bodies around central body
     */
    for (let i = 3; i < this.n * 3; i += 3) {
      this.positions[i] =
        Math.random() * 1.5 * EARTH_MOON_DIST * (Math.random() < 0.5 ? -1 : 1);
      this.positions[i + 1] = Math.random() * 2 * 10000;
      this.positions[i + 2] =
        Math.random() * 1.5 * EARTH_MOON_DIST * (Math.random() < 0.5 ? -1 : 1);
    }

    /**
     * Populate mass & radii. Radii is simplistically
     * based on mass (mass/radius ratio based on moon)
     */
    for (let i = 1; i < this.n; i++) {
      let mass = Math.random() * 1.75 * MOON_MASS;
      let radius = mass / (4.2266 * Math.pow(10, 19));

      if (Math.random() < 0.005) {
        mass = Math.random() * 1.75 * EARTH_MASS;
        radius = EARTH_RADIUS;
      }

      this.masses[i] = mass;
      this.radii[i] = radius;
    }

    // Velocities
    for (let i = 3; i < this.n * 3; i += 3) {
      const position = new THREE.Vector3(
        this.positions[i],
        this.positions[i + 1],
        this.positions[i + 2]
      );

      const dir = position.clone();
      const movement_dir = dir
        .normalize()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), 1.5708);

      const randomized_vel_vec = movement_dir.multiplyScalar(Math.random() * 3);

      this.velocities[i] = randomized_vel_vec.x;
      this.velocities[i + 1] = randomized_vel_vec.y;
      this.velocities[i + 2] = randomized_vel_vec.z;
    }
  };

  updatePositions = (elapsedTime) => {
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

      // Update camera if i is center mass
      if (i === 0) {
        this.setCameraTarget(position);
      }

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

        // Subtract foriegn body vec from position.negate() position and normalize to get unit vec
        const neg_position = position.clone().negate();
        const unit_vec = f_body_position.clone().add(neg_position).normalize();

        // Force vector for this foreign body
        const force_vec = unit_vec.multiplyScalar(
          (GRAV_CONSTANT * (this.masses[i] * this.masses[j])) /
            (distance * distance)
        );

        total_force = total_force.clone().add(force_vec);
      }

      const acc = total_force.divideScalar(this.masses[i]);
      const delta_velocity = acc.clone().multiplyScalar(delta_time);

      const init_velocity = new THREE.Vector3(
        this.velocities[i * 3],
        this.velocities[i * 3 + 1],
        this.velocities[i * 3 + 2]
      );

      const new_velocity = init_velocity.clone().add(delta_velocity);

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
    }
  };

  setGeometry = () => {
    const n = this.n;
    const geometries = [];

    const widthSegments = 16;
    const heightSegments = 16;

    for (let i = 0; i < n; i++) {
      geometries.push(
        new THREE.SphereGeometry(
          i === 0 ? this.radii[0] : this.radii[i],
          widthSegments,
          heightSegments
        )
      );
    }

    this.geometries = geometries;
  };

  setMaterial = () => {
    const n = this.n;
    const materials = [];

    materials[0] = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    for (let i = 1; i < n; i++) {
      materials.push(new THREE.MeshBasicMaterial({ color: '#ff3c3c' }));
    }

    this.materials = materials;
  };

  incMassOfCentralObj = () => {
    this.masses[0] = this.masses[0] * 10;
  };

  decMassOfCentralObj = () => {
    this.masses[0] = this.masses[0] / 10;
  };

  setMesh = () => {
    const meshes = [];

    this.geometries.forEach((geometry, i) => {
      const mesh = new THREE.Mesh(geometry, this.materials[i]);

      /**
       * Add axes and planes to follow center object
       */
      if (i === 0) {
        mesh.add(new THREE.AxesHelper(250000));

        const geometry = new THREE.PlaneGeometry(500000, 500000);

        const material = new THREE.MeshBasicMaterial({
          color: '#4267b8',
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide,
        });

        const plane_z = new THREE.Mesh(geometry, material).rotateX(1.5708);
        const plane_x = new THREE.Mesh(geometry, material);

        mesh.add(plane_z);
        mesh.add(plane_x);
      }

      meshes.push(mesh);
    });

    this.meshes = meshes;
  };

  updateOnTick = (elapsedTime) => {
    this.updatePositions(elapsedTime);
  };
}
