import * as THREE from "three";

import {Object3d} from "./Object3d";


export default class GeoCell extends Object3d{
    constructor(width, raster) {
        super();

        this.geometry = new THREE.PlaneGeometry(2280, 2280, width - 1, width - 1);
        this.geometry.rotateX(-Math.PI / 2);
        let vertices = this.geometry.attributes.position.array;

        let vertexIndex = 0;
        for (let point in raster){
            vertices[vertexIndex + 1] = raster[point]/50
            vertexIndex += 3
        }

        this.geometry.computeVertexNormals();

        const loader = new THREE.TextureLoader();
        const texture = loader.load('./assets/img/RocksArid_seamless.jpg');

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);

        this.material = new THREE.MeshPhongMaterial({color: 0xb57272, map: texture, shininess: 0.8});

        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }
}
