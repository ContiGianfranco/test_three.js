import * as THREE from "three";


export default class MyMaterials {
    constructor(){

        this.floorMaterial = new THREE.MeshBasicMaterial(
            {
                color: 0xffffff,
                stencilWrite: true,
                stencilFunc: THREE.AlwaysStencilFunc,
                colorWrite: false,
                clippingPlanes: window.appData.clippingPlanes,
                side: THREE.FrontSide,
                stencilFail: THREE.IncrementWrapStencilOp,
                stencilZFail: THREE.IncrementWrapStencilOp,
                stencilZPass: THREE.IncrementWrapStencilOp,
            });

        this.waterMaterial = new THREE.MeshPhongMaterial({
            color: 0xa0a0ff,
            shininess: 0.3,
            clippingPlanes: window.appData.clippingPlanes,
            transparent: true,
        });

        this.terrainMaterial = new THREE.MeshPhongMaterial( {
            color: 0xb57272,
            side: THREE.BackSide,
            stencilWrite: true,
            stencilFunc: THREE.AlwaysStencilFunc,
            clippingPlanes: window.appData.clippingPlanes,
            stencilFail: THREE.DecrementWrapStencilOp,
            stencilZFail: THREE.DecrementWrapStencilOp,
            stencilZPass: THREE.DecrementWrapStencilOp,
        } );

        this.baseMat = new THREE.MeshPhongMaterial({
            color: 0xb57272,
            stencilWrite: true,
            stencilFunc: THREE.AlwaysStencilFunc,
            side: THREE.FrontSide,
            clippingPlanes: window.appData.clippingPlanes,
            stencilFail: THREE.DecrementWrapStencilOp,
            stencilZFail: THREE.DecrementWrapStencilOp,
            stencilZPass: THREE.DecrementWrapStencilOp,
        });

        this.backMaterial = new THREE.MeshBasicMaterial(
            {
                color: 0xffffff,
                stencilWrite: true,
                stencilFunc: THREE.AlwaysStencilFunc,
                colorWrite: false,
                clippingPlanes: window.appData.clippingPlanes,
                side: THREE.BackSide,
                stencilFail: THREE.IncrementWrapStencilOp,
                stencilZFail: THREE.IncrementWrapStencilOp,
                stencilZPass: THREE.IncrementWrapStencilOp,
            });

    }
}