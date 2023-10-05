import LOD_0 from "./LOD_0/LOD_0";

export default class RenderArea {
    constructor() {
        this.geoCellsMatrixs = [];

        this.geoCellsMatrixs.push([null]);
        const center = new LOD_0(0);
        this.geoCellsMatrixs.push([null, center]);
    }

    update(x,z){
        const result = this.geoCellsMatrixs [1][1].isInside(x,z);
        console.log(`x: ${x}, z: ${z}, isInside: ${result}`);
    }

}