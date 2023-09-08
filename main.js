import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import {getBlock} from "./js/libs/CDBQuery/CDBQuery";
import GeoCell from "./js/Models/GeoCell";
import {ELEVATION_LAYER} from "./js/constants/CdbLodBloackConstants";

let camera, controls, scene, renderer;
const clock = new THREE.Clock();

async function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 10000);
    camera.position.set(100, 800, -800);
    camera.lookAt(-100, 100, -400);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffe0e0);

    renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(100,800, -800);
    scene.add(light);

    // Set controls
    controls = new FirstPersonControls(camera, renderer.domElement);
    controls.lookSpeed = 0.15;
    controls.movementSpeed = 300;
    controls.verticalMin = 1.0;
    controls.verticalMax = 3.0;

    const terrain = await generateTerrain()
    scene.add(terrain.mesh);

    window.addEventListener('resize', onWindowResize);
}

async function generateTerrain() {

    const lodBlockInfo = {
        lat: "N33",
        lon: "E067",
        layer: ELEVATION_LAYER,
        lod: "L00",
        uref: "U0",
        rref: "R7"
    }

    const image = await getBlock(lodBlockInfo)
    const rasters = await image.readRasters();
    const {width, [0]: raster} = rasters;

    return new GeoCell(width, raster);
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

await init();
animate();
