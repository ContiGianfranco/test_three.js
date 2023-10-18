import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import {getBlock} from "./js/libs/CDBQuery/CDBQuery";
import GeoCell from "./js/Models/GeoCell";
import {ELEVATION_LAYER} from "./js/constants/CdbLodBloackConstants";
import RenderArea from "./js/libs/RenderArea/RenderArea";

let camera, controls, scene, renderer;
const clock = new THREE.Clock();

const renderArea = new RenderArea()

async function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 10000);
    camera.position.set(0, 200, -0);
    camera.lookAt(-100, 100, -400);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffe0e0);

    renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(100, 800, -800);
    scene.add(light);

    // Set controls
    controls = new FirstPersonControls(camera, renderer.domElement);
    controls.lookSpeed = 0.15;
    controls.movementSpeed = 300;
    controls.verticalMin = 1.0;
    controls.verticalMax = 3.0;


    const lodBlock1 = {
        lat: "S33",
        lon: "W070",
        layer: ELEVATION_LAYER,
        lod: "L00",
        lodNum: 0,
        uref: "U0",
        rref: "R0"
    }

    const terrain_1 = await generateTerrain(lodBlock1)
    scene.add(terrain_1.mesh);


    const lodBlock2 = {
        lat: "S33",
        lon: "W069",
        layer: ELEVATION_LAYER,
        lod: "L02",
        lodNum: 2,
        uref: "U0",
        rref: "R0"
    }

    const terrain_2 = await generateTerrain(lodBlock2)
    terrain_2.setPosition(640,0,384)
    scene.add(terrain_2.mesh);

    const lodBlock3 = {
        lat: "S33",
        lon: "W069",
        layer: ELEVATION_LAYER,
        lod: "L02",
        lodNum: 2,
        uref: "U0",
        rref: "R1"
    }

    const terrain_3 = await generateTerrain(lodBlock3)
    terrain_3.setPosition(640+256,0,384)
    scene.add(terrain_3.mesh);


    const lodBlock4 = {
        lat: "S34",
        lon: "W070",
        layer: ELEVATION_LAYER,
        lod: "LC02",
        lodNum: -2,
        uref: "U0",
        rref: "R0"
    }

    const terrain_4 = await generateTerrain(lodBlock4)
    terrain_4.setPosition(0,0,1024)
    scene.add(terrain_4.mesh);

    const lodBlock5 = {
        lat: "S34",
        lon: "W069",
        layer: ELEVATION_LAYER,
        lod: "L01",
        lodNum: 1,
        uref: "U1",
        rref: "R0"
    }

    const terrain_5 = await generateTerrain(lodBlock5)
    terrain_5.setPosition(768,0,768)
    scene.add(terrain_5.mesh);

    window.addEventListener('resize', onWindowResize);
}

async function generateTerrain(lodBlockInfo) {

    const image = await getBlock(lodBlockInfo)
    const rasters = await image.readRasters();
    const {width, [0]: raster} = rasters;

    console.log(width)

    return new GeoCell(width, raster, lodBlockInfo.lodNum);
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    controls.update( clock.getDelta() );
    renderArea.update(camera.position.x, camera.position.z)
    renderer.render( scene, camera );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    controls.handleResize();

}

init().then(animate);

