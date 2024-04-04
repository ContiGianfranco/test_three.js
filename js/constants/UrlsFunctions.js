import {
    BATHYMETRIC_LAYER_DST,
    ELEVATION_LAYER,
    ELEVATION_LAYER_DST,
    IMAGE_LAYER, TERRAIN_IMAGERY_DRAPED_DST,
    TILES_URL
} from "./CdbLodBloackConstants";

function generateElevationLayerDstUrl(lodBlockInfo) {
    const elevationPath = `${TILES_URL}/${lodBlockInfo.lat}/${lodBlockInfo.lon}/${ELEVATION_LAYER}`;
    const loadPath = (lodBlockInfo.lod.includes("LC") ? '/LC' : `/${lodBlockInfo.lod}`);
    const urefPath = `/${lodBlockInfo.uref}`;

    const elevationLayerFileName = `/${lodBlockInfo.lat}${lodBlockInfo.lon}_${ELEVATION_LAYER_DST}_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.tif`;

    const urlElevationLayer = `${elevationPath}${loadPath}${urefPath}${elevationLayerFileName}`;

    console.log(`urlElevationLayer: ${urlElevationLayer}`);

    return urlElevationLayer;
}

function generateBathymetricLayerDstUrl(lodBlockInfo) {
    const elevationPath = `${TILES_URL}/${lodBlockInfo.lat}/${lodBlockInfo.lon}/${ELEVATION_LAYER}`;
    const loadPath = (lodBlockInfo.lod.includes("LC") ? '/LC' : `/${lodBlockInfo.lod}`);
    const urefPath = `/${lodBlockInfo.uref}`;

    const bathymetricLayerFileName = `/${lodBlockInfo.lat}${lodBlockInfo.lon}_${BATHYMETRIC_LAYER_DST}_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.tif`;

    const urlBathymetricLayer = `${elevationPath}${loadPath}${urefPath}${bathymetricLayerFileName}`;

    console.log(`urlBathymetricLayer:${urlBathymetricLayer}`);

    return urlBathymetricLayer;
}

function generateTerrainImageryDstUrl(lodBlockInfo) {
    const elevationPath = `${TILES_URL}/${lodBlockInfo.lat}/${lodBlockInfo.lon}/${IMAGE_LAYER}`;
    const loadPath = (lodBlockInfo.lod.includes("LC") ? '/LC' : `/${lodBlockInfo.lod}`);
    const urefPath = `/${lodBlockInfo.uref}`;

    const bathymetricLayerFileName = `/${lodBlockInfo.lat}${lodBlockInfo.lon}_${TERRAIN_IMAGERY_DRAPED_DST}_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.jp2`;

    const urlBathymetricLayer = `${elevationPath}${loadPath}${urefPath}${bathymetricLayerFileName}`;

    console.log(`urlTerrainImageryLayer:${urlBathymetricLayer}`);

    return urlBathymetricLayer;
}

export {generateBathymetricLayerDstUrl, generateElevationLayerDstUrl, generateTerrainImageryDstUrl};