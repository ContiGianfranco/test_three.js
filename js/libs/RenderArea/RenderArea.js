import LOD_0 from "./LOD_0/LOD_0";

export default class RenderArea {
    constructor(scene) {
        this.geoCellsMatrixs = [[],[],[]];

        this.scene = scene

        this.north = 500;
        this.south = -500;
        this.west = -500;
        this.east = 500;

        this.id_count = 0;

        let tempN = 1500;
        let tempS = 500;
        let tempW = -1500;
        let tempE = -500;

        for (let i = 0; i <= 2; i++) {
            for (let j = 0; j <= 2; j++){
                const cell = new LOD_0(this.id_count, tempN, tempS, tempW, tempE);
                this.geoCellsMatrixs[i].push(cell);
                this.id_count += 1;
                tempW += +1000;
                tempE += +1000;
            }
            tempW = -1500;
            tempE = -500;
            tempN += -1000;
            tempS += -1000;
        }
    }

    getNewCenter(x,z) {
        let centerX = 1;
        let centerZ = 1;

        if (this.north < x ) {
            centerX += -1;
        } else if (this.south > x){
            centerX += 1;
        }

        if (this.west > z ) {
            centerZ += -1;
        } else if (this.east < z){
            centerZ += 1;
        }

        return {
            "Row": centerX,
            "Colum": centerZ
        }
    }

    between(x, min, max) {
        return x >= min && x <= max;
    }

    update(x,z){
        if (!this.geoCellsMatrixs [1][1].isInside(x,z)) {
            console.log(`x: ${x}, z: ${z}, Not Inside Center`);


            const tmp = Array(3).fill().map(()=>Array(3).fill())

            const newCenter = this.getNewCenter(x,z);
            console.log(`ROW: ${newCenter["Row"]}, COL: ${newCenter["Colum"]}`);


            const rowDelta = newCenter["Row"] - 1;
            const columDelta = newCenter["Colum"] - 1;
            let row, col;

            for (let i = 0; i <= 2; i++) {
                row = i+rowDelta;
                for (let j = 0; j <= 2; j++){
                    col = j+columDelta
                    if (!this.between(row, 0, 2) || !this.between(col, 0, 2)){
                        const cell = new LOD_0(this.id_count, this.north+(-i+1)*1000+(-rowDelta)*1000, this.south+(-i+1)*1000+(-rowDelta)*1000,this.west+(j-1)*1000+(columDelta)*1000, this.east+(j-1)*1000+(columDelta)*1000);
                        this.id_count += 1;
                        tmp[i][j] = cell;
                    } else {
                        tmp[i][j] = this.geoCellsMatrixs[row][col];
                    }
                }
            }
            this.geoCellsMatrixs = tmp;
            this.north +=(-rowDelta)*1000;
            this.south +=(-rowDelta)*1000;
            this.west +=(columDelta)*1000;
            this.east +=(columDelta)*1000;

            console.log(this.geoCellsMatrixs);
            console.log(`N: ${this.north}, S: ${this.south}, W: ${this.west}, E: ${this.east}`);
        }
    }

}