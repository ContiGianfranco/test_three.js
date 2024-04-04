import * as THREE from "three";
import MyWorker from '../SatelitWorker?worker';
import {getCellCoordinates, getLodNumber, generateDataTextureFromJEPG2000} from "../libs/CellFunctions";
import {ratioLongitude} from "../libs/LatitudRatio";
import {cell_size, terrain_scaling, minHeight} from "../constants/TerreinConstants";

const cells = [];
const borders = [];

// Standard geometry for geoCells
for (let i = 0; i < 10; i++) {
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

export default class GeoCell {
    constructor(lat, lon, lod, skirt) {
        this.group = new THREE.Group();
        this.width = 1024;
        this.skirt = skirt;
        this.lodBlock = {
            'lat': lat,
            'lon': lon,
            'lod': lod
        };

        const materials = window.appData.materials;
        this.workerCallback = this.updateGeometry.bind(this);
        const lodNumber = getLodNumber(lod);
        const [cell_lat, cell_lon] = getCellCoordinates(lat, lon);

        let cell_index = 0;
        let lon_ratio = 1;

        if (lodNumber < 0){
            cell_index = -lodNumber;
            this.width = Math.pow(2, 10-cell_index);
        }

        try {
            lon_ratio = ratioLongitude(cell_lat);
        } catch (error) {
            console.error(error);
        }

        // Create the geometry
        const terrainGeometry = cells[cell_index].clone();
        terrainGeometry.scale(lon_ratio,1,1);

        const terrainMaterial = materials.baseMat.clone();
        terrainMaterial.clippingPlanes = window.appData.clippingPlanes;
        this.terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);

        this.group.add(this.terrainMesh);

        if (skirt) {
            this.createSkirt(lon_ratio, cell_index);
        }

        const xPosition = cell_size * (-window.appData.lat + cell_lat + 1/2);
        const zPosition = cell_size * (-window.appData.lon + cell_lon + lon_ratio/2);

        console.log(`Cell location: lat ${xPosition}, lon ${zPosition}`)

        this.group.rotateY(-Math.PI/2)
        this.group.position.set(xPosition, 0, zPosition);
    }

    initializeGeometry() {
        this.webwoker = new MyWorker();
        this.webwoker.postMessage(this.lodBlock);

        this.webwoker.onmessage = this.workerCallback;
    }

    createSkirt(lon_ratio, cell_index){
        const materials = window.appData.materials;

        const floorGeometry = cells[9].clone();
        floorGeometry.translate(0,minHeight,0);
        floorGeometry.scale(lon_ratio,1,1);

        const northPlaneGeometry = borders[cell_index].clone();
        const southPlaneGeometry = borders[cell_index].clone();
        const westPlaneGeometry = borders[cell_index].clone();
        const eastPlaneGeometry = borders[cell_index].clone();

        northPlaneGeometry.scale(lon_ratio, 1, 1)
        southPlaneGeometry.scale(lon_ratio, 1, 1)

        northPlaneGeometry.translate(0 , minHeight, -(cell_size) / 2 );
        southPlaneGeometry.rotateY(Math.PI);
        southPlaneGeometry.translate(0 , minHeight, (cell_size) / 2 );
        westPlaneGeometry.rotateY(Math.PI/2);
        westPlaneGeometry.translate(-(cell_size * lon_ratio) / 2 , minHeight, 0);
        eastPlaneGeometry.rotateY(-Math.PI/2);
        eastPlaneGeometry.translate((cell_size * lon_ratio) / 2 , minHeight, 0);

        const terrainBackMesh = new THREE.Mesh(this.terrainMesh.geometry,materials.backMaterial);
        this.terrainMesh.renderOrder = 1;

        this.northPlane = new THREE.Mesh( northPlaneGeometry, materials.terrainMaterial );
        const northPlaneInside = new THREE.Mesh( northPlaneGeometry, materials.floorMaterial );

        this.southPlane = new THREE.Mesh( southPlaneGeometry, materials.terrainMaterial );
        const southPlaneInside = new THREE.Mesh( southPlaneGeometry, materials.floorMaterial );

        this.westPlane = new THREE.Mesh( westPlaneGeometry, materials.terrainMaterial );
        const westPlaneInside = new THREE.Mesh( westPlaneGeometry, materials.floorMaterial );

        this.eastPlane = new THREE.Mesh( eastPlaneGeometry, materials.terrainMaterial );
        const eastPlaneInside = new THREE.Mesh( eastPlaneGeometry, materials.floorMaterial );

        const floor = new THREE.Mesh( floorGeometry, materials.floorMaterial );

        this.group.add(this.northPlane);
        this.group.add(northPlaneInside);
        this.group.add(this.southPlane);
        this.group.add(southPlaneInside);
        this.group.add(this.westPlane);
        this.group.add(westPlaneInside);
        this.group.add(this.eastPlane);
        this.group.add(eastPlaneInside);
        this.group.add(floor);
        this.group.add(terrainBackMesh);
    }

    updateGeometry(event) {

        const raster = event.data['elevationLayer'];
        const texture = event.data['terrainImageLayer'];

        this.updateTopGeometry(raster, texture);

        if(this.skirt){
            this.updateNorthGeometry(raster);
            this.updateSouthGeometry(raster);
            this.updateWestGeometry(raster);
            this.updateEastGeometry(raster);
        }

        this.webwoker = undefined;
    }

    updateTopGeometry(raster, texture){
        let vertexIndex = 0, point = 0;

        const size = this.width * this.width;

        const terrainGeometry = this.terrainMesh.geometry;

        const terrainVertices = terrainGeometry.attributes.position.array;

        while (point < size) {
            vertexIndex = point*3;

            terrainVertices[vertexIndex + 1] = raster[point] * terrain_scaling;
            point++;
        }

        const satelitTexture= generateDataTextureFromJEPG2000(texture);

        satelitTexture.colorSpace = THREE.SRGBColorSpace;

        console.log(satelitTexture)

        this.terrainMesh.material.map = satelitTexture;
        this.terrainMesh.material.needsUpdate = true;

        terrainGeometry.computeVertexNormals();
        terrainGeometry.attributes.position.needsUpdate = true;
    }

    updateNorthGeometry(raster) {
        let vertexIndex = 0, point = 0;

        const northGeometry = this.northPlane.geometry;
        let northVertices = northGeometry.attributes.position.array;

        while (point < this.width) {
            vertexIndex = point*3

            northVertices[vertexIndex + 1] = raster[point] * terrain_scaling;

            point++;
        }

        northGeometry.attributes.position.needsUpdate = true;
    }

    updateSouthGeometry(raster) {
        const size = this.width * this.width;
        let vertexIndex = 0, point = size-1;

        const southGeometry = this.southPlane.geometry;
        let southVertices = southGeometry.attributes.position.array;


        while (point >= size-this.width) {

            southVertices[vertexIndex + 1] = raster[point] * terrain_scaling;

            vertexIndex += 3
            point--;
        }

        southGeometry.attributes.position.needsUpdate = true;
    }

    updateWestGeometry(raster) {
        const size = this.width * this.width;
        let vertexIndex = 0, point = size - this.width;

        const westGeometry = this.westPlane.geometry;
        let westVertices = westGeometry.attributes.position.array;

        while (point >= 0) {

            westVertices[vertexIndex + 1] = raster[point] * terrain_scaling;

            vertexIndex += 3
            point-=this.width;
        }

        westGeometry.attributes.position.needsUpdate = true;
    }

    updateEastGeometry(raster) {
        const size = this.width * this.width;
        let vertexIndex = 0, point = this.width - 1;

        const eastGeometry = this.eastPlane.geometry;
        let eastVertices = eastGeometry.attributes.position.array;

        while (point < size) {

            eastVertices[vertexIndex + 1] = raster[point] * terrain_scaling;

            vertexIndex += 3
            point += this.width;
        }

        eastGeometry.attributes.position.needsUpdate = true;
    }
}
