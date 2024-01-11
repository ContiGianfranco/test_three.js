import * as THREE from 'three';
import {Vector3} from 'three';
import {getBlock} from "./js/libs/CDBQuery/CDBQuery";
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
let planeHelpers, globalPlane, planeStencil;
const clock = new THREE.Clock();
const renderArea = new RenderArea();

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

    renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    document.body.appendChild( stats.dom );

    globalPlane = new THREE.Plane( new THREE.Vector3( Math.sin(Math.radianes(clipping_angle)), 0, Math.cos(Math.radianes(clipping_angle)) ), 0.0 );
    window.appData.clippingPlanes = [globalPlane];

    planeHelpers = new THREE.PlaneHelper( globalPlane, 111, 0xff00ff );
    planeHelpers.visible = false;
    planeHelpers.depthWrite = false;
    planeHelpers.renderOrder = 9;
    scene.add( planeHelpers );

    // set gui
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

    // set lighting
    const light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.layers.enable( 0 );
    light.layers.enable( 1 );
    light.position.set(100, 800, -800);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( ambientLight );

    // Set controls
    controls = new MapControls( camera, renderer.domElement );

    controls.enableDamping = true; // an animation loop is required when either damping or autorotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = -100;
    controls.maxDistance = 1000;

    controls.maxPolarAngle = Math.PI / 2;

    const planeStencilGeom = new THREE.PlaneGeometry(111, 111, 1, 1);
    const planeStencilMat = new THREE.MeshBasicMaterial( {
        color: 0xb57272,
        metalness: 0.1,
        roughness: 0.75,

        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: THREE.EqualStencilFunc,
        stencilFail: THREE.ReplaceStencilOp,
        stencilZFail: THREE.ReplaceStencilOp,
        stencilZPass: THREE.ReplaceStencilOp,
    } );
    planeStencil = new THREE.Mesh( planeStencilGeom, planeStencilMat );
    planeStencil.renderOrder = 2;
    scene.add(planeStencil)

    // set terrain
    let lodBlock = {
        lat: "S54",
        lon: "W062",
        lod: "L00",
        lodNum: 0,
        uref: "U0",
        rref: "R0"
    }

    let terrain = new BathCell(lodBlock);
    scene.add( terrain.group );

    // set terrain
    lodBlock = {
        lat: "S54",
        lon: "W060",
        lod: "L00",
        lodNum: 0,
        uref: "U0",
        rref: "R0"
    }

    terrain = new BathCell(lodBlock);
    terrain.setPosition(111, 0, 0)
    scene.add( terrain.group );

    window.addEventListener('resize', onWindowResize);
}

async function generateTerrain(lodBlockInfo) {

    const geoCellInfo = await getBlock(lodBlockInfo)

    return new GeoCell(geoCellInfo, lodBlockInfo.lodNum);
}

function animate() {
    requestAnimationFrame( animate );

    globalPlane.coplanarPoint( planeStencil.position );
    planeStencil.lookAt(
        planeStencil.position.x - globalPlane.normal.x,
        planeStencil.position.y - globalPlane.normal.y,
        planeStencil.position.z - globalPlane.normal.z,
    );

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

