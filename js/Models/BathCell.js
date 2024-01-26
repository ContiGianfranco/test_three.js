import * as THREE from "three";

import {Object3d} from "./Object3d";
import MyWorker from '../QueryWorker?worker';
import {ratioLongitude} from "../libs/LatitudRatio";

const cells = [];
const borders = []

console.log("ping")

for (let i = 0; i < 10; i++) {
    const cell_size = 111;
    const width = 1024 / Math.pow(2, i);

    const cell = new THREE.PlaneGeometry(
        cell_size, cell_size,
        width - 1, width - 1);
    cell.rotateX(-Math.PI / 2);
    cells.push(cell);

    const border = new THREE.PlaneGeometry(
        cell_size,
        0,
        width - 1,
        1);
    borders.push(border);
}

const minHeight = -50

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
        super();

        const workerCallback = this.updateGeometry.bind(this);
        const lod = lodBlockInfo.lodNum;
        this.group = new THREE.Group();
        const Materials = window.appData.materials;

        // Utilizado para LOD de mas de 0. Por ahora en des uso.
        let size_factor = 1;
        if (lod > 0){
            size_factor = Math.pow(2, lod);
        }

        let ratio = 1;
        try {
            let lat = lodBlockInfo.lat.substring(1);
            if (lodBlockInfo.lat[0] === 'S') {
                lat = -lat;
            }
            ratio = ratioLongitude(lat);
        } catch (error) {
            console.error(error);
        }

        // Create the geometry
        const terrainGeometry = cells[0].clone();
        terrainGeometry.scale(ratio,1,1);

        const waterGeometry = terrainGeometry.clone();

        const floorGeometry = cells[0].clone();
        floorGeometry.translate(0,minHeight,0);
        floorGeometry.scale(ratio,1,1);

        const northPlaneGeometry = borders[0].clone();
        const southPlaneGeometry = borders[0].clone();
        const westPlaneGeometry = borders[0].clone();
        const eastPlaneGeometry = borders[0].clone();

        northPlaneGeometry.scale(ratio, 1, 1)
        southPlaneGeometry.scale(ratio, 1, 1)

        northPlaneGeometry.translate(0 , minHeight, -(111/size_factor) / 2 );
        southPlaneGeometry.rotateY(Math.PI);
        southPlaneGeometry.translate(0 , minHeight, (111/size_factor) / 2 );
        westPlaneGeometry.rotateY(Math.PI/2);
        westPlaneGeometry.translate(-(111/size_factor * ratio) / 2 , minHeight, 0);
        eastPlaneGeometry.rotateY(-Math.PI/2);
        eastPlaneGeometry.translate((111/size_factor * ratio) / 2 , minHeight, 0);

        const texture = generateTexture(new Uint8Array( 4 * 1024*1024), 1024);

        const waterMesh = new THREE.Mesh(waterGeometry, Materials.waterMaterial);
        waterMesh.layers.set( 1 );

        const terrainMesh = new THREE.Mesh(terrainGeometry, Materials.baseMat);
        const terrainBackMesh = new THREE.Mesh(terrainGeometry,Materials.backMaterial);
        terrainMesh.layers.set( 0 );
        terrainMesh.renderOrder = 1;

        const northPlaneIn = new THREE.Mesh( northPlaneGeometry, Materials.floorMaterial );
        const northPlaneOut = new THREE.Mesh( northPlaneGeometry, Materials.terrainMaterial );

        const southPlaneIn = new THREE.Mesh( southPlaneGeometry, Materials.floorMaterial );
        const southPlaneOut = new THREE.Mesh( southPlaneGeometry, Materials.terrainMaterial );

        const westPlaneIn = new THREE.Mesh( westPlaneGeometry, Materials.floorMaterial );
        const westPlaneOut = new THREE.Mesh( westPlaneGeometry, Materials.terrainMaterial );

        const eastPlaneIn = new THREE.Mesh( eastPlaneGeometry, Materials.floorMaterial );
        const eastPlaneOut = new THREE.Mesh( eastPlaneGeometry, Materials.terrainMaterial );

        const floor = new THREE.Mesh( floorGeometry, Materials.floorMaterial );

        this.group.add(terrainMesh);
        this.group.add(waterMesh);
        this.group.add(northPlaneIn);
        this.group.add(northPlaneOut);
        this.group.add(southPlaneIn);
        this.group.add(southPlaneOut);
        this.group.add(westPlaneIn);
        this.group.add(westPlaneOut);
        this.group.add(eastPlaneIn);
        this.group.add(eastPlaneOut);
        this.group.add(floor);
        this.group.add(terrainBackMesh);

        this.webwoker = new MyWorker();
        this.webwoker.postMessage({'lodBlockInfo': lodBlockInfo});
        this.webwoker.onmessage = workerCallback;

        let lat = 111 * (window.appData.lat + -lodBlockInfo.lat.substring(1) + ratio/2)
        let lon = 111 * (window.appData.lon + -lodBlockInfo.lon.substring(1) + 1/2)

        console.log(`lat ${lat}, lon ${lon}`)

        this.group.position.set(lon, 0, lat);
    }

    updateGeometry(event) {

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

            waterVertices[vertexIndex + 1] = raster[point] * terrain_scaling;

            if (rasterBath[point] > 0) {
                terrainVertices[vertexIndex + 1] = (raster[point] - rasterBath[point]) * terrain_scaling;
                data[ stride + 3 ] = 255 * 3/4;
            } else {
                terrainVertices[vertexIndex + 1] = raster[point] * terrain_scaling;
                data[ stride + 3 ] = 0;
            }

            point++;
        }

        const northGeometry = this.group.children[2].geometry;
        let northVertices = northGeometry.attributes.position.array;

        vertexIndex = 0;
        point = 0;

        while (point < width) {
            vertexIndex = point*3

            if (rasterBath[point] > 0) {
                northVertices[vertexIndex + 1] = (raster[point] - rasterBath[point]) * terrain_scaling;
            } else {
                northVertices[vertexIndex + 1] = raster[point] * terrain_scaling;
            }

            point++;
        }

        const southGeometry = this.group.children[4].geometry;
        let southVertices = southGeometry.attributes.position.array;

        point = size-1;
        vertexIndex = 0;

        while (point >= size-width) {

            if (rasterBath[point] > 0) {
                southVertices[vertexIndex + 1] = (raster[point] - rasterBath[point]) * terrain_scaling;
            } else {
                southVertices[vertexIndex + 1] = raster[point] * terrain_scaling;
            }

            vertexIndex += 3
            point--;
        }

        const westGeometry = this.group.children[6].geometry;
        let westVertices = westGeometry.attributes.position.array;

        point = size-1024;
        vertexIndex = 0;

        while (point >= 0) {

            if (rasterBath[point] > 0) {
                westVertices[vertexIndex + 1] = (raster[point] - rasterBath[point]) * terrain_scaling;
            } else {
                westVertices[vertexIndex + 1] = raster[point] * terrain_scaling;
            }

            vertexIndex += 3
            point-=1024;
        }

        const eastGeometry = this.group.children[8].geometry;
        let eastVertices = eastGeometry.attributes.position.array;

        vertexIndex = 0;
        point = 1023;

        while (point < size) {

            if (rasterBath[point] > 0) {
                eastVertices[vertexIndex + 1] = (raster[point] - rasterBath[point]) * terrain_scaling;
            } else {
                eastVertices[vertexIndex + 1] = raster[point] * terrain_scaling;
            }

            vertexIndex += 3
            point+=1024;
        }

        this.group.children[1].material.map = generateTexture(data, width);
        this.group.children[1].material.needsUpdate = true;

        terrainGeometry.computeVertexNormals();
        waterGeometry.computeVertexNormals();

        terrainGeometry.attributes.position.needsUpdate = true;
        waterGeometry.attributes.position.needsUpdate = true;

        northGeometry.attributes.position.needsUpdate = true;
        southGeometry.attributes.position.needsUpdate = true;
        westGeometry.attributes.position.needsUpdate = true;
        eastGeometry.attributes.position.needsUpdate = true;

        this.webwoker = undefined;
    }
}
