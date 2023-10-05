export default class LOD_0 {
    constructor(id) {
        this.north = 500;
        this.south = -500;
        this.west = -500;
        this.east = 500;

        this.id = id;
    }

    between(x, min, max) {
        return x >= min && x <= max;
    }

    isInside(x,z){
        return this.between(x, this.south, this.north) && this.between(z, this.west, this.east)
    }

}