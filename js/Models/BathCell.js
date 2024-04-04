import * as THREE from "three";

import MyWorker from '../BathymetricWorker?worker';
import {terrain_scaling} from "../constants/TerreinConstants";
import GeoCell from "./GeoCell";
import {generateDataTextureFromData} from "../libs/CellFunctions";

export default class BathCell extends GeoCell{
    constructor(lat, lon, lod, skirt) {

        super(lat, lon, lod, skirt);

        const materials = window.appData.materials;
        const waterGeometry = this.terrainMesh.geometry.clone();

        this.waterMesh = new THREE.Mesh(waterGeometry, materials.waterMaterial);
        this.waterMesh.layers.set( 1 );

        this.group.add(this.waterMesh);

        this.webwoker = new MyWorker();
        this.webwoker.postMessage({
            'lat': lat,
            'lon': lon,
            'lod': lod});

        this.webwoker.onmessage = this.workerCallback;
    }

    initializeGeometry() {
        this.webwoker = new MyWorker();
        this.webwoker.postMessage(this.lodBlock);

        this.webwoker.onmessage = this.workerCallback;
    }

    updateGeometry(event) {

        const raster = event.data['elevationLayer'];
        const rasterBath = event.data['bathymetricLayer'];

        this.updateTopGeometry(raster, rasterBath);
        this.updateNorthGeometry(raster, rasterBath);
        this.updateSouthGeometry(raster, rasterBath);
        this.updateWestGeometry(raster, rasterBath);
        this.updateEastGeometry(raster, rasterBath);

        this.webwoker = undefined;
    }

    updateTopGeometry(raster, rasterBath){
        let vertexIndex = 0, point = 0, stride = 0;

        const size = this.width * this.width;
        const data = new Uint8Array( 4 * size);

        const terrainGeometry = this.terrainMesh.geometry;
        const waterGeometry = this.waterMesh.geometry;

        const terrainVertices = terrainGeometry.attributes.position.array;
        const waterVertices = waterGeometry.attributes.position.array;

        while (point < size) {
            stride = point * 4;

            data[ stride ] = 55;
            data[ stride + 1] = 55;
            data[ stride + 2] = 255;

            vertexIndex = point*3;
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

        this.waterMesh.material.map = generateDataTextureFromData(data, this.width);
        this.waterMesh.material.needsUpdate = true;

        terrainGeometry.computeVertexNormals();
        waterGeometry.computeVertexNormals();

        terrainGeometry.attributes.position.needsUpdate = true;
        waterGeometry.attributes.position.needsUpdate = true;
    }

    updateNorthGeometry(raster, rasterBath) {
        let vertexIndex = 0, point = 0;

        const northGeometry = this.group.children[2].geometry;
        let northVertices = northGeometry.attributes.position.array;

        while (point < this.width) {
            vertexIndex = point*3

            if (rasterBath[point] > 0) {
                northVertices[vertexIndex + 1] = (raster[point] - rasterBath[point]) * terrain_scaling;
            } else {
                northVertices[vertexIndex + 1] = raster[point] * terrain_scaling;
            }

            point++;
        }

        northGeometry.attributes.position.needsUpdate = true;
    }

    updateSouthGeometry(raster, rasterBath) {
        const size = this.width * this.width;
        let vertexIndex = 0, point = size-1;

        const southGeometry = this.group.children[4].geometry;
        let southVertices = southGeometry.attributes.position.array;


        while (point >= size-this.width) {

            if (rasterBath[point] > 0) {
                southVertices[vertexIndex + 1] = (raster[point] - rasterBath[point]) * terrain_scaling;
            } else {
                southVertices[vertexIndex + 1] = raster[point] * terrain_scaling;
            }

            vertexIndex += 3
            point--;
        }

        southGeometry.attributes.position.needsUpdate = true;
    }

    updateWestGeometry(raster, rasterBath) {
        const size = this.width * this.width;
        let vertexIndex = 0, point = size - this.width;

        const westGeometry = this.group.children[6].geometry;
        let westVertices = westGeometry.attributes.position.array;

        while (point >= 0) {

            if (rasterBath[point] > 0) {
                westVertices[vertexIndex + 1] = (raster[point] - rasterBath[point]) * terrain_scaling;
            } else {
                westVertices[vertexIndex + 1] = raster[point] * terrain_scaling;
            }

            vertexIndex += 3
            point-=this.width;
        }

        westGeometry.attributes.position.needsUpdate = true;
    }

    updateEastGeometry(raster, rasterBath) {
        const size = this.width * this.width;
        let vertexIndex = 0, point = this.width - 1;

        const eastGeometry = this.group.children[8].geometry;
        let eastVertices = eastGeometry.attributes.position.array;

        while (point < size) {

            if (rasterBath[point] > 0) {
                eastVertices[vertexIndex + 1] = (raster[point] - rasterBath[point]) * terrain_scaling;
            } else {
                eastVertices[vertexIndex + 1] = raster[point] * terrain_scaling;
            }

            vertexIndex += 3
            point += this.width;
        }

        eastGeometry.attributes.position.needsUpdate = true;
    }
}
