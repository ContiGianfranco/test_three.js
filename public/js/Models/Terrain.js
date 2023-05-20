import * as THREE from "three";

import {Object3d} from "./Object3d";
import {generateHeight} from "../libs/TerrainGeneration";

class Terrain extends Object3d{
    constructor(worldWidth, worldDepth) {
        super();

        let data = generateHeight( worldWidth, worldDepth );

        this.geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
        this.geometry.rotateX( - Math.PI / 2 );

        let vertices = this.geometry.attributes.position.array;

        for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

            vertices[ j + 1 ] = data[ i ] * 10;

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
