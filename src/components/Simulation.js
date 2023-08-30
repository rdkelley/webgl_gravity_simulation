import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

import Stars from './Stars';
import Planets from './Planets';
import Raycaster from './Raycaster';
import '../styles/reset.css';
import '../styles/style.css';

const SIM_SIZES = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export default class Simulation {
  constructor(_canvas) {
    this.canvas = _canvas;

    this.scene = new THREE.Scene();
    this.time = new THREE.Clock();
    this.debug = new dat.GUI();

    this.camera = this.initCamera();
    this.controls = this.initControls(this.camera);
    this.components = [];

    this.renderer = this.render();

    this.buildWorld();

    this.tick();

    this.setSceneAttributes();

    console.log(new Raycaster());
  }

  get elapsedTime() {
    return this.time.getElapsedTime();
  }

  setSceneAttributes() {
    const axesHelper = new THREE.AxesHelper(200000);

    this.scene.add(axesHelper);

    const geometry = new THREE.PlaneGeometry(200000, 200000);
    const material = new THREE.MeshBasicMaterial({
      color: "#4267b8",
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    this.scene.add(plane);
  }

  buildWorld() {
    this.scene.background = new THREE.Color('#22262e');

    this.components.push(new Planets(this.scene, this.elapsedTime));
  }

  initCamera() {
    const _camera = new THREE.PerspectiveCamera(
      35,
      SIM_SIZES.width / SIM_SIZES.height,
      400000,
      10000000
    );

    _camera.position.set(550000, 400000, 720000);
    this.scene.add(_camera);

    return _camera;
  }

  initControls(_camera) {
    const _controls = new OrbitControls(this.camera, this.canvas);
    _controls.minDistance = 600000;
    _controls.maxDistance = 1500000;

    _controls.enableDamping = true;

    return _controls;
  }

  render() {
    const _renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });

    _renderer.setSize(SIM_SIZES.width, SIM_SIZES.height);

    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    return _renderer;
  }

  tick() {
    this.controls.update();

    this.components.forEach((component) => {
      component.updateOnTick(this.elapsedTime);
    });

    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }
}
