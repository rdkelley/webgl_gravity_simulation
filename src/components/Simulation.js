import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

import Stars from './Stars';
import Planets from './Planets';
import '../styles/reset.css';

const SIM_SIZES = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export default class Simulation {
  constructor(_canvas) {
    this.canvas = _canvas;
    this.scene = new THREE.Scene();
    this.camera = this.initCamera();
    this.controls = this.initControls(this.camera);
    this.time = new THREE.Clock();
    this.components = [];
    this.debug = new dat.GUI();

    this.renderer = this.render();

    this.buildWorld();

    this.tick();

    this.debug.add(this.camera.position, 'x', 0, 1000000, 10000);
    this.debug.add(this.camera.position, 'y', 0, 1000000, 10000);
    this.debug.add(this.camera.position, 'z', 0, 1000000, 10000);
    this.debug.add(this.camera, 'fov', -0, 100, 1);
  }

  get elapsedTime() {
    return this.time.getElapsedTime();
  }

  buildWorld() {
    // this.components.push(new Stars(this.scene));
    this.components.push(new Planets(this.scene, this.elapsedTime));
  }

  initCamera() {
    const _camera = new THREE.PerspectiveCamera(
      35,
      SIM_SIZES.width / SIM_SIZES.height,
      400000,
      1500000
    );

    _camera.position.set(550000, 400000, 720000);
    this.scene.add(_camera);

    return _camera;
  }

  initControls(_camera) {
    const _controls = new OrbitControls(this.camera, this.canvas);
    _controls.minDistance = 650000;
    _controls.maxDistance = 1000000;

    _controls.enableDamping = true;

    return _controls;
  }

  render() {
    const _renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
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
