import * as THREE from "three";
import BathCell from "./BathCell";
import {getLodNumber} from "../libs/CellFunctions";
import {RandomLCG} from "../libs/RandomLCG/RandomLCG";

const random = new RandomLCG(752);

function generateRandomDisplacement(max_delta) {
    return random.generateFloatInRange(0, max_delta);

}

export default class LODCell {
    constructor(lat, lon, lod, lodSamples) {
        this.lod = new THREE.LOD();

        let newLod, mesh, newLodNum, lodNum = getLodNumber(lod);

        for( let i = 0; i < lodSamples; i++ ) {
            newLodNum = lodNum - i;
            newLod = (newLodNum >= 0 ? `L${("0" + newLodNum).slice(-2)}` : `LC${("0" + -newLodNum).slice(-2)}`);
            mesh = new BathCell(lat, lon, newLod, true);
            mesh.initializeGeometry()
            this.lod.addLevel( mesh.group, i * 50 );
        }

        this.lod.position.set(generateRandomDisplacement(0.05), 0, generateRandomDisplacement(0.05));
    }
}