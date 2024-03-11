import * as THREE from "three";


function isBorder(vertexIndex, width){
    return (vertexIndex < (width + 1) * 3) ||
        ((vertexIndex % ((width+2) * 3)) === 0) ||
        ((vertexIndex % ((width+2) * 3)) === (width+2)*3 - 3) ||
        (vertexIndex > (width + 1) * (width + 2) * 3 - 3);
}

export default class GeoCell {
    constructor(geoCellInfo, lod) {
        let vertexIndex = 0;
        let point = 0;

        const width = geoCellInfo['width'];
        const raster = geoCellInfo['raster'];
        const texture = geoCellInfo['texture'];

        let size_factor = 1;
        if (lod > 0){
            size_factor = Math.pow(2, lod);
        }

        this.geometry = new THREE.PlaneGeometry(1024/size_factor, 1024/size_factor, width + 1, width + 1);
        this.geometry.rotateX(-Math.PI / 2);
        let vertices = this.geometry.attributes.position.array;

        while (vertexIndex < vertices.length) {
            if (isBorder(vertexIndex, width)) {
                vertices[vertexIndex + 1] = 0;
            } else {
                vertices[vertexIndex + 1] = raster[point]/100;
                point++;
            }
            vertexIndex += 3;
        }

        this.geometry.computeVertexNormals();

        texture.colorSpace = THREE.SRGBColorSpace;

        this.material = new THREE.MeshPhongMaterial({color: 0xb57272, map: texture, shininess: 0.8});

        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }
}
