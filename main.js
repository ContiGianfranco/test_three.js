import * as THREE from 'three';
import {getBlock, getElevation} from "./js/libs/CDBQuery/CDBQuery";
import GeoCell from "./js/Models/GeoCell";
import RenderArea from "./js/libs/RenderArea/RenderArea";
import BathCell from "./js/Models/BathCell";
import GUI from "lil-gui";
import {MapControls} from "three/addons/controls/MapControls";
import Stats from "three/addons/libs/stats.module";


let camera, controls, scene, renderer, stats;
const clock = new THREE.Clock();

const renderArea = new RenderArea()

console.log("Hola")

async function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 10000);
    camera.position.set(353.5, 353.5, 353.5);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0ff);

    renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    document.body.appendChild( stats.dom );

    const globalPlane = new THREE.Plane( new THREE.Vector3( - 1, 0, 0 ), 0.1 );
    const Empty = Object.freeze( [] );
    const globalPlanes = [ globalPlane ];
    renderer.clippingPlanes = Empty;

    const gui = new GUI(),
        folderGlobal = gui.addFolder( 'Global Clipping' ),
        propsGlobal = {

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

            }

        };

    folderGlobal.add( propsGlobal, 'Enabled' );
    folderGlobal.add( propsGlobal, 'Plane', - 500, 500 );


    const light = new THREE.DirectionalLight(0xffffff, 0.7);
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

    /*
    const lodBlock1 = {
        lat: "S33",
        lon: "W070",
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
        lod: "L01",
        lodNum: 1,
        uref: "U1",
        rref: "R0"
    }

    const terrain_5 = await generateTerrain(lodBlock5)
    terrain_5.setPosition(768,0,768)
    scene.add(terrain_5.mesh);*/


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

