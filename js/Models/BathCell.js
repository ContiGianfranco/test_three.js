import * as THREE from "three";

import {Object3d} from "./Object3d";
import scene from "three/addons/offscreen/scene";

export default class BathCell extends Object3d{
    constructor(geoCellInfo, lod) {
        let vertexIndex = 0;
        let i = 0;
        let point = 0;

        const width = geoCellInfo['width'];
        const raster = geoCellInfo['raster'];
        const rasterBath = geoCellInfo['rasterBath'];

        super();

        let size_factor = 1;
        if (lod > 0){
            size_factor = Math.pow(2, lod);
        }

        this.geometry = new THREE.PlaneGeometry(1024/size_factor, 1024/size_factor, width - 1, width - 1);
        this.geometry.rotateX(-Math.PI / 2);
        let vertices = this.geometry.attributes.position.array;

        this.waterGeommetry = new THREE.PlaneGeometry(1024/size_factor, 1024/size_factor, width - 1, width - 1);
        this.waterGeommetry.rotateX(-Math.PI / 2);
        let waterVertices = this.waterGeommetry.attributes.position.array;

        const size = width*width
        const data = new Uint8Array( 4 * size);


        while (i < size) {
            vertexIndex = i*3
            const stride = i * 4;

            data[ stride ] = 55;
            data[ stride + 1 ] = 55;
            data[ stride + 2 ] = 255;

            if (rasterBath[point] > 0) {
                vertices[vertexIndex + 1] = (raster[point] - rasterBath[point])*2;
                waterVertices[vertexIndex + 1] = raster[point]*2;
                data[ stride + 3 ] = 255;
            } else {
                vertices[vertexIndex + 1] = raster[point]*2;
                waterVertices[vertexIndex + 1] = raster[point]*2;
                data[ stride + 3 ] = 0;
            }

            point++;
            i++;
        }

        this.geometry.computeVertexNormals();
        this.waterGeommetry.computeVertexNormals();

        console.log(data)

        const texture = new THREE.DataTexture( data, width, width);
        texture.needsUpdate = true;

        texture.magFilter = THREE.LinearFilter;
        texture.flipY = true;
        texture.generateMipmaps = true;
        texture.colorSpace = THREE.SRGBColorSpace;

        this.waterMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: texture,
            shininess: 0.3,
            clippingPlanes: window.appData.clippingPlanes,
        });

        console.log(window.appData.clippingPlanes)

        this.waterMaterial.transparent = true;
        //this.waterMaterial.side = THREE.DoubleSide;
        //this.waterMaterial.wireframe = true;
        this.waterMesh = new THREE.Mesh(this.waterGeommetry, this.waterMaterial);
        this.waterMesh.layers.set( 1 );

        this.material = new THREE.MeshPhongMaterial( { color: 0xb57272, shininess: 0.8, clippingPlanes: window.appData.clippingPlanes, } );
        //this.material.side = THREE.DoubleSide;
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.layers.set( 0 );
    }
}
