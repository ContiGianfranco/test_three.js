import * as THREE from "three";
import BathCell from "./BathCell";
import {ratioLongitude} from "../libs/LatitudRatio";
import {getCellCoordinates} from "../libs/CellFunctions";
import {cell_size} from "../constants/TerreinConstants";
import {RandomLCG} from "../libs/RandomLCG/RandomLCG";

function generateRandom() {
    let num = random.generateFloatInRange(0, 0.05);
    console.log(num);
    return num;
}

const random = new RandomLCG(752);

export default class LODCell {
    constructor(lodBlockInfo) {
        this.lod = new THREE.LOD();

        let lon_ratio = 1, lodBlock, mesh;

        for( let i = 0; i < 3; i++ ) {
            lodBlock = {...lodBlockInfo};
            lodBlock.lodNum -= i;
            lodBlock.lod = (lodBlock.lodNum >= 0 ? `L${("0" + lodBlock.lodNum).slice(-2)}` : `LC${("0" + -lodBlock.lodNum).slice(-2)}`);
            mesh = new BathCell(lodBlock);
            this.lod.addLevel( mesh.group, i * 75 );
        }

        const [cell_lat, cell_lon] = getCellCoordinates(lodBlockInfo);

        try {
            lon_ratio = ratioLongitude(cell_lat);
        } catch (error) {
            console.error(error);
        }

        const lat = cell_size * (-window.appData.lat + cell_lat + 1/2);
        const lon = cell_size * (-window.appData.lon + cell_lon + lon_ratio/2);

        console.log(`Cell location: lat ${lat}, lon ${lon}`)

        this.lod.rotateY(-Math.PI/2)
        this.lod.position.set(lat + generateRandom(), 0, lon  + generateRandom());
    }
}