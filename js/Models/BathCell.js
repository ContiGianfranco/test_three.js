import * as THREE from "three";

import {Object3d} from "./Object3d";
import MyWorker from '../QueryWorker?worker';

function generateTexture(data, width) {
    const texture = new THREE.DataTexture( data, width, width);
    texture.needsUpdate = true;
    texture.magFilter = THREE.LinearFilter;
    texture.flipY = true;
    texture.generateMipmaps = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

export default class BathCell extends Object3d{
    constructor(lodBlockInfo) {
        const lod = lodBlockInfo.lodNum;
        const width = 1024;

        super();

        const workerCallback = this.updateGeometry.bind(this);

        this.group = new THREE.Group();

        let size_factor = 1;
        if (lod > 0){
            size_factor = Math.pow(2, lod);
        }

        // Create the geometry

        const terrainGeometry = new THREE.PlaneGeometry(
            111/size_factor,
            111/size_factor,
            width - 1,
            width - 1);
        terrainGeometry.rotateX(-Math.PI / 2);

        const waterGeometry = terrainGeometry.clone();

        const texture = generateTexture(new Uint8Array( 4 * width*width), width);
        let wireframe = false;

        const waterMaterial = new THREE.MeshPhongMaterial({
            color: 0xa0a0ff,
            shininess: 0.3,
            map: texture,
            clippingPlanes: window.appData.clippingPlanes,
            transparent: true,
            //side: THREE.DoubleSide,
            wireframe: wireframe,
        });

        wireframe = false;

        const terrainMaterial = new THREE.MeshPhongMaterial( {
            color: 0xb57272,
            shininess: 0.8,
            clippingPlanes: window.appData.clippingPlanes,
            //side: THREE.DoubleSide,
            wireframe: wireframe,
        } );

        const baseMat = new THREE.MeshPhongMaterial({
            color: 0xb57272,
            stencilWrite: true,
            stencilFunc: THREE.AlwaysStencilFunc,
            side: THREE.FrontSide,
            clippingPlanes: window.appData.clippingPlanes,
            stencilFail: THREE.DecrementWrapStencilOp,
            stencilZFail: THREE.DecrementWrapStencilOp,
            stencilZPass: THREE.DecrementWrapStencilOp,
        });

        const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
        waterMesh.layers.set( 1 );

        const terrainMesh = new THREE.Mesh(terrainGeometry, baseMat);
        terrainMesh.layers.set( 0 );
        terrainMesh.renderOrder = 1;

        this.group.add(terrainMesh);
        this.group.add(waterMesh);

        this.webwoker = new MyWorker();
        this.webwoker.postMessage({'lodBlockInfo': lodBlockInfo});
        this.webwoker.onmessage = workerCallback;
    }

    updateGeometry(event) {

        console.log(event.data);


        let vertexIndex = 0, point = 0;

        const width = event.data['width'];
        const raster = event.data['raster'];
        const rasterBath = event.data['rasterBath'];

        const terrainGeometry = this.group.children[0].geometry;
        const waterGeometry = this.group.children[1].geometry;

        let terrainVertices = terrainGeometry.attributes.position.array;
        let waterVertices = waterGeometry.attributes.position.array;

        const size = width*width
        const data = new Uint8Array( 4 * size);

        const terrain_scaling = 0.01

        while (point < size) {
            vertexIndex = point*3
            const stride = point * 4;

            data[ stride ] = 55;
            data[ stride + 1 ] = 55;
            data[ stride + 2 ] = 255;

            if (rasterBath[point] > 0) {
                terrainVertices[vertexIndex + 1] = (raster[point] - rasterBath[point]) * terrain_scaling;
                waterVertices[vertexIndex + 1] = raster[point] * terrain_scaling;
                data[ stride + 3 ] = 255 * 3/4;
            } else {
                terrainVertices[vertexIndex + 1] = raster[point] * terrain_scaling;
                waterVertices[vertexIndex + 1] = raster[point] * terrain_scaling;
                data[ stride + 3 ] = 0;
            }

            point++;
        }

        this.group.children[1].material.map = generateTexture(data, width);
        this.group.children[1].material.needsUpdate = true;

        terrainGeometry.computeVertexNormals();
        waterGeometry.computeVertexNormals();

        terrainGeometry.attributes.position.needsUpdate = true;
        waterGeometry.attributes.position.needsUpdate = true;

        this.webwoker = undefined;
    }
}
