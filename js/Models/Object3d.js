class Object3d {
    constructor() {
        this.group = null;
    }

    setPosition(x,y,z){
        this.group.position.set(x,y,z);
    }

}

export {Object3d}