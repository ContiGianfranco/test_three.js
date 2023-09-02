import {fromUrl} from "geotiff";

async function getBlock() {

    const tiff = await fromUrl("https://contigianfranco.github.io/webCDB/CDB/Titles/N333/E067/001_Elevation/L00/U0/N33E067_D001_S001_T001_L00_U4_R7.tif");
    return await tiff.getImage();

}

export {getBlock}