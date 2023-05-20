class Object3d {
    constructor() {
        this.geometry = null;
        this.material = null;
        this.mesh = null;
    }

    setPosition(x,y,z){
        this.mesh.position.set(x,y,z);
    }

}

export {Object3d}