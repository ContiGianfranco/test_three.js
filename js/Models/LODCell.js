import * as THREE from "three";
import BathCell from "./BathCell";

export default class LODCell {
    constructor(lodBlockInfo) {
        this.lod = new THREE.LOD();

        let lodBlock;
        let mesh;

        for( let i = 0; i < 3; i++ ) {
            lodBlock = {...lodBlockInfo};
            lodBlock.lodNum -= i;
            lodBlock.lod = (lodBlock.lodNum >= 0 ? `L${("0" + lodBlock.lodNum).slice(-2)}` : `LC${("0" + -lodBlock.lodNum).slice(-2)}`);
            mesh = new BathCell(lodBlock);
            this.lod.addLevel( mesh.group, i * 75 );
        }
    }
}