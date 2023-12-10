import * as THREE from 'three';
import {Vector3} from 'three';
import {getBlock, getElevation} from "./js/libs/CDBQuery/CDBQuery";
import GeoCell from "./js/Models/GeoCell";
import RenderArea from "./js/libs/RenderArea/RenderArea";
import BathCell from "./js/Models/BathCell";
import GUI from "lil-gui";
import {MapControls} from "three/addons/controls/MapControls";
import Stats from "three/addons/libs/stats.module";

Math.radianes = function(grados) {
    return grados * Math.PI / 180;
};

let camera, controls, scene, renderer, stats;
let clipping_angle = 0;
let planeHelpers, globalPlane;

const clock = new THREE.Clock();

const renderArea = new RenderArea()


async function init() {

    window.appData = {
        clippingPlanes: [],
    };

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 10000);
    camera.layers.enable( 0 ); // enabled by default
    camera.layers.enable( 1 );
    camera.position.set(353.5, 353.5, 353.5);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0ff);

    renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    document.body.appendChild( stats.dom );

    globalPlane = new THREE.Plane( new THREE.Vector3( Math.sin(Math.radianes(clipping_angle)), 0, Math.cos(Math.radianes(clipping_angle)) ), 0.0 );
    window.appData.clippingPlanes = [globalPlane];

    planeHelpers = new THREE.PlaneHelper( globalPlane, 1024, 0xff00ff );
    planeHelpers.visible = false;
    planeHelpers.depthWrite = false;
    planeHelpers.renderOrder = 9;
    scene.add( planeHelpers );

    const gui = new GUI();
    const folderClipping = gui.addFolder( 'Clipping' );
    const propsClipping = {

            get 'Enabled'() {

                return renderer.localClippingEnabled;

            },
            set 'Enabled'( v ) {

                renderer.localClippingEnabled = v;

            },

            get 'Plane'() {
                return globalPlane.constant;
            },
            set 'Plane'( v ) {
                globalPlane.constant = v;
            },

            get 'Angle'(){
                return clipping_angle;
            },
            set 'Angle'( v ) {
                clipping_angle = v
                globalPlane.normal = new Vector3(Math.sin(Math.radianes(clipping_angle)), 0, Math.cos(Math.radianes(clipping_angle)));
            },

            get 'Display Helper'() {

                return planeHelpers.visible;

            },
            set 'Display Helper'( v ) {

                planeHelpers.visible = v;

            },

        };

    folderClipping.add( propsClipping, 'Enabled' );
    folderClipping.add( propsClipping, 'Plane', - 1024/2, 1024/2 );
    folderClipping.add( propsClipping, 'Angle', -180, 180 );
    folderClipping.add( propsClipping, 'Display Helper' );

    const layers = {
        'toggle water': function () {
            camera.layers.toggle( 1 );
        },
    };

    gui.add( layers, 'toggle water' );

    const light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.layers.enable( 0 );
    light.layers.enable( 1 );
    light.position.set(100, 800, -800);
    scene.add(light);

    // Set controls
    controls = new MapControls( camera, renderer.domElement );

    controls.enableDamping = true; // an animation loop is required when either damping or autorotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 100;
    controls.maxDistance = 1000;

    controls.maxPolarAngle = Math.PI / 2;

    const lodBlock = {
        lat: "N62",
        lon: "W162",
        lod: "L00",
        lodNum: 0,
        uref: "U0",
        rref: "R0"
    }

    let terrain = await generateBathCell(lodBlock)
    scene.add(terrain.mesh)
    scene.add(terrain.waterMesh)

    window.addEventListener('resize', onWindowResize);
}

async function generateBathCell(lodBlockInfo) {

    const geoCellInfo = await getElevation(lodBlockInfo)

    return new BathCell(geoCellInfo, lodBlockInfo.lodNum);
}

async function generateTerrain(lodBlockInfo) {

    const geoCellInfo = await getBlock(lodBlockInfo)

    return new GeoCell(geoCellInfo, lodBlockInfo.lodNum);
}

function animate() {
    requestAnimationFrame( animate );

    render();
}

function render() {
    controls.update( clock.getDelta() );
    renderArea.update(camera.position.x, camera.position.z)

    stats.begin();
    renderer.render( scene, camera );
    stats.end();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    controls.handleResize();

}

init().then(animate);

