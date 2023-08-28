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

    this.renderer = this.render();

    this.buildWorld();

    this.tick();
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
      0.1,
      100
    );

    _camera.position.set(20,10,20);
    this.scene.add(_camera);

    return _camera;
  }

  initControls(_camera) {
    const _controls = new OrbitControls(this.camera, this.canvas);
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
