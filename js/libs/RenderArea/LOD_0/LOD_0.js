export default class LOD_0 {
    constructor(id, n, s, w, e) {
        this.north = n;
        this.south = s;
        this.west = w;
        this.east = e;

        this.id = id;
    }

    between(x, min, max) {
        return x >= min && x <= max;
    }

    isInside(x,z){
        return this.between(x, this.south, this.north) && this.between(z, this.west, this.east)
    }

}