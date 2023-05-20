import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import {Terrain} from "./js/Models/Terrain";
import {Water} from "./js/Models/Water";

let camera, controls, scene, renderer;
const worldWidth = 256, worldDepth = 256;
const clock = new THREE.Clock();

function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 100, 10000 );
    camera.position.set( 100, 800, - 800 );
    camera.lookAt( - 100, 810, - 800 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffe0e0 );

    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const light = new THREE.DirectionalLight( 0xffffff, 0.7 );
    light.position.x = 100;
    light.position.y = 800;
    light.position.z = -800;
    scene.add( light );

    let terrain = new Terrain(worldWidth, worldDepth);

    scene.add( terrain.mesh );

    let water = new Water(worldWidth, worldDepth)
    water.setPosition(0,250,0)

    scene.add( water.mesh );

    controls = new FirstPersonControls( camera, renderer.domElement );
    controls.movementSpeed = 500;
    controls.lookSpeed = 0.2;

    window.addEventListener( 'resize', onWindowResize );
}

function animate() {

    requestAnimationFrame( animate );

    render();
}

function render() {

    controls.update( clock.getDelta() );
    renderer.render( scene, camera );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    controls.handleResize();

}

init();

animate();