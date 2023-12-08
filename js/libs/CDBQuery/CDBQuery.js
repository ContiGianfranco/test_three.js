import {fromUrl} from "geotiff";
import {ELEVATION_LAYER, IMAGE_LAYER} from "../../constants/CdbLodBloackConstants";

import axios from "axios";
import {Buffer} from "buffer";
import {JpxImage} from "jpeg2000";
import * as THREE from "three";

async function getBlock(lodBlockInfo) {

    let urlTiff, urlJp2;

    if (lodBlockInfo.lod.includes("LC")) {
        urlTiff = `https://contigianfranco.github.io/webCDB/CDB/Titles/${lodBlockInfo.lat}/${lodBlockInfo.lon}/${ELEVATION_LAYER}/LC/${lodBlockInfo.uref}/${lodBlockInfo.lat}${lodBlockInfo.lon}_D001_S001_T001_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.tif`;
        urlJp2 = `https://contigianfranco.github.io/webCDB/CDB/Titles/${lodBlockInfo.lat}/${lodBlockInfo.lon}/${IMAGE_LAYER}/LC/${lodBlockInfo.uref}/${lodBlockInfo.lat}${lodBlockInfo.lon}_D004_S001_T001_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.jp2`;
    } else {
        urlTiff = `https://contigianfranco.github.io/webCDB/CDB/Titles/${lodBlockInfo.lat}/${lodBlockInfo.lon}/${ELEVATION_LAYER}/${lodBlockInfo.lod}/${lodBlockInfo.uref}/${lodBlockInfo.lat}${lodBlockInfo.lon}_D001_S001_T001_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.tif`;
        urlJp2 = `https://contigianfranco.github.io/webCDB/CDB/Titles/${lodBlockInfo.lat}/${lodBlockInfo.lon}/${IMAGE_LAYER}/${lodBlockInfo.lod}/${lodBlockInfo.uref}/${lodBlockInfo.lat}${lodBlockInfo.lon}_D004_S001_T001_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.jp2`;
    }

    console.log(urlTiff)
    console.log(urlJp2)

    const tiff = await fromUrl(urlTiff);
    const image = await tiff.getImage();
    const rasters = await image.readRasters();
    const {width, [0]: raster} = rasters;

    console.log(width)

    const response = await axios.get(urlJp2,  { responseType: 'arraybuffer' })
    const codestream = Buffer.from(response.data, 'hex')

    const jpx = new JpxImage()
    jpx.parse(codestream)

    const tiles = jpx.tiles[0].items;
    let counter = 0;

    const size = jpx.width * jpx.height;
    const data = new Uint8Array( 4 * size );

    for ( let i = 0; i < size; i ++ ) {

        const stride = i * 4;
        data[ stride ] = tiles[ counter ];
        data[ stride + 1 ] = tiles[ counter + 1 ];
        data[ stride + 2 ] = tiles[ counter + 2];
        data[ stride + 3 ] = 255;
        counter += 3
    }

    console.log(data)

    let texture = new THREE.DataTexture( data, jpx.width, jpx.height);
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    texture.flipY = true;
    texture.generateMipmaps = true;

    return {
        'width': width,
        'raster': raster,
        'texture': texture,
    };

}

async function getElevation(lodBlockInfo) {

    let urlTiff, urlBath;

    if (lodBlockInfo.lod.includes("LC")) {
        urlTiff = `https://contigianfranco.github.io/webCDB/CDB/Titles/${lodBlockInfo.lat}/${lodBlockInfo.lon}/${ELEVATION_LAYER}/LC/${lodBlockInfo.uref}/${lodBlockInfo.lat}${lodBlockInfo.lon}_D001_S001_T001_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.tif`;
        urlBath = `https://contigianfranco.github.io/webCDB/CDB/Titles/${lodBlockInfo.lat}/${lodBlockInfo.lon}/${ELEVATION_LAYER}/LC/${lodBlockInfo.uref}/${lodBlockInfo.lat}${lodBlockInfo.lon}_D001_S100_T001_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.tif`;
    } else {
        urlTiff = `https://contigianfranco.github.io/webCDB/CDB/Titles/${lodBlockInfo.lat}/${lodBlockInfo.lon}/${ELEVATION_LAYER}/${lodBlockInfo.lod}/${lodBlockInfo.uref}/${lodBlockInfo.lat}${lodBlockInfo.lon}_D001_S001_T001_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.tif`;
        urlBath = `https://contigianfranco.github.io/webCDB/CDB/Titles/${lodBlockInfo.lat}/${lodBlockInfo.lon}/${ELEVATION_LAYER}/${lodBlockInfo.lod}/${lodBlockInfo.uref}/${lodBlockInfo.lat}${lodBlockInfo.lon}_D001_S100_T001_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.tif`;
    }

    console.log(urlTiff)

    const tiff = await fromUrl(urlTiff);
    const image = await tiff.getImage();
    let rasters = await image.readRasters();
    const {width, [0]: raster} = rasters;

    const bath = await fromUrl(urlBath);
    const bathImg = await bath.getImage();
    rasters = await bathImg.readRasters();
    const { [0]: rasterBath} = rasters;

    console.log(width)

    return {
        'width': width,
        'raster': raster,
        'rasterBath': rasterBath,
    };

}

export {getBlock, getElevation}