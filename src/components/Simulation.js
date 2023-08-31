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
    this.controls = this.initControls();
    this.components = [];

    this.renderer = this.render();

    this.buildWorld();

    this.tick();

    this.setEvtHandlers();
  }

  get elapsedTime() {
    return this.time.getElapsedTime();
  }

  setSceneAttributes = () => {};

  buildWorld = () => {
    this.scene.background = new THREE.Color('#22262e');

    this.components.push(new Planets(this.scene, this.setCameraTarget));

    this.setSceneAttributes();
  };

  handleResize = () => {
    SIM_SIZES.width = window.innerWidth;
    SIM_SIZES.height = window.innerHeight;

    this.camera.aspect = SIM_SIZES.width / SIM_SIZES.height;
    this.camera.updateProjectionMatrix();

    console.log(SIM_SIZES.width, SIM_SIZES.height);

    this.renderer.setSize(SIM_SIZES.width, SIM_SIZES.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  setEvtHandlers = () => {
    const reset = document.querySelector('#reset-button');
    const incGravity = document.querySelector('#inc-mass');
    const decGravity = document.querySelector('#dec-mass');

    reset.addEventListener('click', () => this.resetScene());

    window.addEventListener('resize', () => this.handleResize());

    incGravity.addEventListener('click', () => {
      this.components.forEach((c) => {
        if (c.type === 'planets') {
          c.incMassOfCentralObj();
        }
      });
    });

    decGravity.addEventListener('click', () => {
      this.components.forEach((c) => {
        if (c.type === 'planets') {
          c.decMassOfCentralObj();
        }
      });
    });
  };

  initCamera = () => {
    const _camera = new THREE.PerspectiveCamera(
      35,
      SIM_SIZES.width / SIM_SIZES.height,
      200000,
      10000000
    );

    _camera.position.set(550000, 400000, 720000);
    this.scene.add(_camera);

    return _camera;
  };

  initControls = () => {
    const _controls = new OrbitControls(this.camera, this.canvas);
    _controls.minDistance = 600000;
    _controls.maxDistance = 1500000;
    _controls.enableDamping = true;

    return _controls;
  };

  resetClock = () => {
    this.time = new THREE.Clock();
  };

  setCameraTarget = (target) => {
    this.controls.target = target;
  };

  resetScene = () => {
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    this.components = [];
    this.resetClock();
    this.buildWorld();
  };

  render = () => {
    const _renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });

    _renderer.setSize(SIM_SIZES.width, SIM_SIZES.height);

    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    return _renderer;
  };

  tick = () => {
    this.controls.update();

    this.components.forEach((component) => {
      component.updateOnTick(this.elapsedTime);
    });

    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(() => {
      this.tick();
    });
  };
}
