import * as THREE from "three";

import {Object3d} from "./Object3d";
import {generateWater} from "../libs/TerrainGeneration";

class Water extends Object3d{
    constructor(worldWidth, worldDepth) {
        super();

        let data = generateWater(worldWidth, worldDepth);

        this.geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
        this.geometry.rotateX( - Math.PI / 2 );
        let vertices = this.geometry.attributes.position.array;

        for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

            vertices[ j + 1 ] = data[ i ] * 10;

        }

        this.geometry.computeVertexNormals();

        this.material = new THREE.MeshPhongMaterial( { color: 0x88b1eb } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );
    }
}

export {Water}
