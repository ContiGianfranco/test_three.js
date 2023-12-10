class Object3d {
    constructor() {
        this.geometry = null;
        this.material = null;
        this.mesh = null;
        this.waterMesh = null
    }

    setPosition(x,y,z){
        this.mesh.position.set(x,y,z);
        if (this.waterMesh !== null){
            this.waterMesh.position.set(x,y,z);
        }
    }

}

export {Object3d}