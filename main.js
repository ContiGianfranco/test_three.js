import * as THREE from 'three';
import {Vector3} from 'three';
import BathCell from "./js/Models/BathCell";
import GUI from "lil-gui";
import {MapControls} from "three/addons/controls/MapControls";
import Stats from "three/addons/libs/stats.module";
import MyMaterials from "./js/libs/Materials";
import LODCell from "./js/Models/LODCell";

Math.radianes = function(grados) {
    return grados * Math.PI / 180;
};

function calculate_pendiente(point_a, point_b) {
    return ((point_a.y - point_b.y) / (point_a.x - point_b.x));
}

function calculate_angulo(point_a, point_b) {
    return Math.atan2(point_a.y - point_b.y, point_a.x - point_b.x);
}

function calcular_valor(m, b) {
    const x = b/(-(1/m)-m);
    const y = -x/m;

    return Math.sqrt(Math.pow(x,2) + Math.pow(y,2))
}

function calculate_b(point, m) {
    const y = -window.appData.lat + point.y;
    const x = -window.appData.lon + point.x;

    console.log(`m: ${m} , y:${y} , x:${x}` );
    return 111 * (y - m * x);
}

function update_clipping_plane () {
    // TODO: caso m = 0 y m = inf
    const m = calculate_pendiente(clipping_point_a, clipping_point_b);
    const b = calculate_b(clipping_point_a, m);

    const omega = calculate_angulo(clipping_point_a, clipping_point_b);

    console.log(`m: ${m} , b:${b}`);
    console.log(window.appData.clippingPlanes[0]);
    const val = calcular_valor(m, b);
    console.log(`omega: ${omega} , b:${val}`);

    window.appData.clippingPlanes[0].constant = calcular_valor(m, b);
    window.appData.clippingPlanes[0].normal = new Vector3(Math.cos(omega), 0, -Math.sin(omega));
}

let camera, controls, scene, renderer, stats;
let clipping_point_a = {x: -62, y:-53}
let clipping_point_b = {x: -58, y:-54}
let clipping_angle = 0;
let planeHelpers, globalPlane, planeStencil;
const clock = new THREE.Clock();

async function init() {

    window.appData = {
        clippingPlanes: [],
        lat: -54,
        lon: -60,
    };

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 10000);
    camera.layers.enable( 0 ); // enabled by default
    camera.layers.enable( 1 );
    camera.position.set(0, 353.5, 0);

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

    window.appData.materials = new MyMaterials();

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

            get 'Point A x' (){
                return clipping_point_a.x;
            },
            set 'Point A x' (x){
                clipping_point_a.x = x;
                update_clipping_plane();
            },
            get 'Point A y' (){
                return clipping_point_a.y;
            },
            set 'Point A y' (y){
                clipping_point_a.y = y;
                update_clipping_plane();
            },
            get 'Point B x' (){
                return clipping_point_b.x;
            },
            set 'Point B x' (x){
                clipping_point_b.x = x;
                update_clipping_plane();
            },
            get 'Point B y' (){
                return clipping_point_b.y;
            },
            set 'Point B y' (y){
                clipping_point_b.y = y;
                update_clipping_plane();
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
    folderClipping.add( propsClipping, 'Point A x' );
    folderClipping.add( propsClipping, 'Point A y' );
    folderClipping.add( propsClipping, 'Point B x' );
    folderClipping.add( propsClipping, 'Point B y' );
    folderClipping.add( propsClipping, 'Plane', - 1024/2, 1024/2 );
    folderClipping.add( propsClipping, 'Angle', -180, 180 );
    folderClipping.add( propsClipping, 'Display Helper' );

    update_clipping_plane();

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

    const planeStencilGeom = new THREE.PlaneGeometry(1000, 111, 1, 1);
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

    const axesHelper = new THREE.AxesHelper( 111 );
    scene.add( axesHelper );

    // set terrain
    let lodBlock = {
        lat: "S54",
        lon: "W062",
        lod: "LC01",
        lodNum: -1,
        uref: "U0",
        rref: "R0"
    }

    let terrain = new LODCell(lodBlock);
    scene.add( terrain.lod );

    // set terrain
    lodBlock = {
        lat: "S54",
        lon: "W060",
        lod: "LC01",
        lodNum: -1,
        uref: "U0",
        rref: "R0"
    }

    terrain = new LODCell(lodBlock);
    scene.add( terrain.lod );

    // set terrain
    lodBlock = {
        lat: "S55",
        lon: "W062",
        lod: "LC01",
        lodNum: -1,
        uref: "U0",
        rref: "R0"
    }

    terrain = new LODCell(lodBlock);
    scene.add( terrain.lod );

    // set terrain
    lodBlock = {
        lat: "S55",
        lon: "W060",
        lod: "LC01",
        lodNum: -1,
        uref: "U0",
        rref: "R0"
    }

    terrain = new LODCell(lodBlock);
    scene.add( terrain.lod );

    window.addEventListener('resize', onWindowResize);
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

