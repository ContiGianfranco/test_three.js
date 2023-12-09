import * as THREE from 'three';
import {getBlock, getElevation} from "./js/libs/CDBQuery/CDBQuery";
import GeoCell from "./js/Models/GeoCell";
import RenderArea from "./js/libs/RenderArea/RenderArea";
import BathCell from "./js/Models/BathCell";
import GUI from "lil-gui";
import {MapControls} from "three/addons/controls/MapControls";
import Stats from "three/addons/libs/stats.module";
import {Vector3} from "three";

Math.radianes = function(grados) {
    return grados * Math.PI / 180;
};

let camera, controls, scene, renderer, stats;
let clipping_angle = 0;

const clock = new THREE.Clock();

const renderArea = new RenderArea()

console.log("Hola")

async function init() {

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

    const globalPlane = new THREE.Plane( new THREE.Vector3( Math.sin(Math.radianes(clipping_angle)), 0, Math.cos(Math.radianes(clipping_angle)) ), 0.0 );
    const Empty = Object.freeze( [] );
    const globalPlanes = [ globalPlane ];
    renderer.clippingPlanes = Empty;

    const gui = new GUI();
    const folderGlobal = gui.addFolder( 'Global Clipping' );
    const propsGlobal = {

            get 'Enabled'() {

                return renderer.clippingPlanes !== Empty;

            },
            set 'Enabled'( v ) {

                renderer.clippingPlanes = v ? globalPlanes : Empty;

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
            }

        };

    folderGlobal.add( propsGlobal, 'Enabled' );
    folderGlobal.add( propsGlobal, 'Plane', - 1024/2, 1024/2 );
    folderGlobal.add( propsGlobal, 'Angle', -180, 180 );

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

    const terrain = await generateBathCell(lodBlock)
    scene.add(terrain.mesh);
    scene.add(terrain.waterMesh);

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

