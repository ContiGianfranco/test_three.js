import * as THREE from "three";

function getCellCoordinates(lat, lon) {

    const lodLat = lat.substring(1);
    const lodLon = lon.substring(1);

    const cell_lat = (lat[0] === 'S') ? -lodLat : +lodLat;
    const cell_lon = (lon[0] === 'W') ? -lodLon : +lodLon;

    return [cell_lat, cell_lon];
}

function getLodNumber(lod) {
    if (lod.includes("LC")) {
        return -parseInt(lod.substring(2));
    } else {
        return parseInt(lod.substring(1));
    }
}

function generateDataTextureFromJEPG2000(jp2000) {

    const tiles = jp2000["tiles"];
    console.log(tiles)
    let counter = 0;

    const size = jp2000.width * jp2000.height;
    const data = new Uint8Array( 4 * size );
    let stride = 0;

    for ( let i = 0; i < size; i ++ ) {
        stride = i * 4;
        data[ stride ] = tiles[ counter ];
        data[ stride + 1 ] = tiles[ counter + 1 ];
        data[ stride + 2 ] = tiles[ counter + 2];
        data[ stride + 3 ] = 255;
        counter += 3
    }

    console.log(data);

    let texture = new THREE.DataTexture( data, jp2000.width, jp2000.height);
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    texture.flipY = true;
    texture.generateMipmaps = true;

    return texture;
}

function generateDataTextureFromData(data, width) {
    const texture = new THREE.DataTexture( data, width, width);
    texture.needsUpdate = true;
    texture.magFilter = THREE.LinearFilter;
    texture.flipY = true;
    texture.generateMipmaps = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

export {getCellCoordinates, getLodNumber, generateDataTextureFromJEPG2000, generateDataTextureFromData};