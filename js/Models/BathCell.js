import * as THREE from "three";

import {Object3d} from "./Object3d";

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
    constructor(geoCellInfo, lod) {
        let vertexIndex = 0, point = 0;

        const width = geoCellInfo['width'];
        const raster = geoCellInfo['raster'];
        const rasterBath = geoCellInfo['rasterBath'];

        super();

        this.group = new THREE.Group();

        let size_factor = 1;
        if (lod > 0){
            size_factor = Math.pow(2, lod);
        }

        // Create the geometry
        const terrainGeometry = new THREE.PlaneGeometry(1024/size_factor, 1024/size_factor, width - 1, width - 1);
        terrainGeometry.rotateX(-Math.PI / 2);
        const waterGeometry = terrainGeometry.clone();

        let terrainVertices = terrainGeometry.attributes.position.array;
        let waterVertices = waterGeometry.attributes.position.array;

        const size = width*width
        const data = new Uint8Array( 4 * size);

        while (point < size) {
            vertexIndex = point*3
            const stride = point * 4;

            data[ stride ] = 55;
            data[ stride + 1 ] = 55;
            data[ stride + 2 ] = 255;

            if (rasterBath[point] > 0) {
                terrainVertices[vertexIndex + 1] = (raster[point] - rasterBath[point])*2;
                waterVertices[vertexIndex + 1] = raster[point]*2;
                data[ stride + 3 ] = 255;
            } else {
                terrainVertices[vertexIndex + 1] = raster[point]*2;
                waterVertices[vertexIndex + 1] = raster[point]*2;
                data[ stride + 3 ] = 0;
            }

            point++;
        }

        terrainGeometry.computeVertexNormals();
        waterGeometry.computeVertexNormals();

        const texture = generateTexture(data, width);

        let wireframe = false;

        const waterMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: texture,
            shininess: 0.3,
            clippingPlanes: window.appData.clippingPlanes,
            transparent: true,
            side: THREE.DoubleSide,
            wireframe: wireframe,
        });

        wireframe = false;

        const terrainMaterial = new THREE.MeshPhongMaterial( {
            color: 0xb57272,
            shininess: 0.8,
            clippingPlanes: window.appData.clippingPlanes,
            side: THREE.DoubleSide,
            wireframe: wireframe,
        } );

        const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
        waterMesh.layers.set( 1 );

        const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrainMesh.layers.set( 0 );

        this.group.add(terrainMesh);
        this.group.add(waterMesh);
    }
}
