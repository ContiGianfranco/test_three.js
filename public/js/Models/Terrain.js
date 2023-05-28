import * as THREE from "three";

import {Object3d} from "./Object3d";
import {DiamondSquareGenerator} from "../libs/diamondSquareAlgorithm";

class Terrain extends Object3d{
    constructor(worldWidth, worldDepth) {
        super();

        let diamondSquareGenerator = new DiamondSquareGenerator(750, 1025);
        let dataMatrix = diamondSquareGenerator.generateData();

        this.geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
        this.geometry.rotateX( - Math.PI / 2 );
        let vertices = this.geometry.attributes.position.array;

        let vertexIndex = 0;
        for(let i = 0; i < 1024; i++){
            for(let j = 0; j < 1024; j++){
                vertices[ vertexIndex + 1 ] = dataMatrix[i][j]
                vertexIndex+=3
            }
        }

        this.geometry.computeVertexNormals();

        const loader = new THREE.TextureLoader();
        const texture = loader.load( '/textures/RocksArid_seamless.jpg' );

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8,8);

        this.material = new THREE.MeshPhongMaterial( { color: 0xb57272, map: texture, shininess: 0.8 } );

        this.mesh = new THREE.Mesh( this.geometry, this.material );
    }
}

export {Terrain}
