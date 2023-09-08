import {fromUrl} from "geotiff";

async function getBlock(lodBlockInfo) {

    const url = `https://contigianfranco.github.io/webCDB/CDB/Titles/${lodBlockInfo.lat}/${lodBlockInfo.lon}/${lodBlockInfo.layer}/${lodBlockInfo.lod}/${lodBlockInfo.uref}/${lodBlockInfo.lat}${lodBlockInfo.lon}_D001_S001_T001_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.tif`

    const tiff = await fromUrl(url);
    return await tiff.getImage();

}

export {getBlock}