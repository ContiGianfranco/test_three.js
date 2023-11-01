import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import {getBlock} from "./js/libs/CDBQuery/CDBQuery";
import GeoCell from "./js/Models/GeoCell";
import {ELEVATION_LAYER} from "./js/constants/CdbLodBloackConstants";
import RenderArea from "./js/libs/RenderArea/RenderArea";
import axios from "axios";
import {Buffer} from "buffer";
import {JpxImage} from "jpeg2000";
import {texture} from "three/nodes";


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

    const response = await axios.get("https://contigianfranco.github.io/webCDB/CDB/Titles/S33/W070/004_Imagery/LC/U0/S33W070_D004_S001_T001_LC02_U0_R0.jp2",  { responseType: 'arraybuffer' })
    const codestream = Buffer.from(response.data, 'hex')

    const jpx = new JpxImage()
    jpx.parse(codestream)
    console.log(jpx)

    const tiles = jpx.tiles[0].items;
    let counter = 0;

    const size = jpx.width * jpx.height;
    const data = new Uint8Array( 4 * size );

    for ( let i = 0; i < size; i ++ ) {

        const stride = i * 4;
        data[ stride ] = tiles[ counter ];
        data[ stride + 1 ] = tiles[ counter + 1 ];
        data[ stride + 2 ] = tiles[ counter + 2];
        data[ stride + 3 ] = 255;
        counter += 3
    }

    console.log(data)

    let texture = new THREE.DataTexture( data, jpx.width, jpx.height);
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    texture.generateMipmaps = true;

    const lodBlock1 = {
        lat: "S33",
        lon: "W070",
        layer: ELEVATION_LAYER,
        lod: "L00",
        lodNum: 0,
        uref: "U0",
        rref: "R0"
    }

    const terrain_1 = await generateTerrain(lodBlock1, texture)
    scene.add(terrain_1.mesh);

/*
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
*/
    window.addEventListener('resize', onWindowResize);
}

async function generateTerrain(lodBlockInfo, texture) {

    const image = await getBlock(lodBlockInfo)
    const rasters = await image.readRasters();
    const {width, [0]: raster} = rasters;

    console.log(width)

    return new GeoCell(width, raster, lodBlockInfo.lodNum, texture);
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

