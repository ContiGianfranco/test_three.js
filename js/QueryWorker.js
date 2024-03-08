import {
    BATHYMETRIC_LAYER_DST,
    ELEVATION_LAYER,
    ELEVATION_LAYER_DST,
    TILES_URL
} from "./constants/CdbLodBloackConstants";
import {fromUrl} from "geotiff";

function generateUrls(lodBlockInfo) {

    const elevationPath = `${TILES_URL}/${lodBlockInfo.lat}/${lodBlockInfo.lon}/${ELEVATION_LAYER}`;
    const loadPath = (lodBlockInfo.lod.includes("LC") ? '/LC' : `/${lodBlockInfo.lod}`);
    const urefPath = (lodBlockInfo.lod.includes("LC") ? '' : `/${lodBlockInfo.uref}`);

    const elevationLayerFileName = `/${lodBlockInfo.lat}${lodBlockInfo.lon}_${ELEVATION_LAYER_DST}_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.tif`;
    const bathymetricLayerFileName = `/${lodBlockInfo.lat}${lodBlockInfo.lon}_${BATHYMETRIC_LAYER_DST}_${lodBlockInfo.lod}_${lodBlockInfo.uref}_${lodBlockInfo.rref}.tif`;

    const urlElevationLayer = `${elevationPath}${loadPath}${urefPath}${elevationLayerFileName}`;
    const urlBathymetricLayer = `${elevationPath}${loadPath}${urefPath}${bathymetricLayerFileName}`;

    console.log(`urlElevationLayer: ${urlElevationLayer} urlBathymetricLayer:${urlBathymetricLayer}`);

    return [urlElevationLayer, urlBathymetricLayer];
}

async function getElevationRasters(lodBlockInfo) {

    const [urlElevationLayer, urlBathymetricLayer] = generateUrls(lodBlockInfo);

    // Get the elevation layer from CDB
    const elevationTiff = await fromUrl(urlElevationLayer);
    let geoTiffImage = await elevationTiff.getImage();
    let rasters = await geoTiffImage.readRasters();
    const {width, [0]: raster} = rasters;

    // Get the bathymetric layer from CDB
    const bathymetricTiff = await fromUrl(urlBathymetricLayer);
    geoTiffImage = await bathymetricTiff.getImage();
    rasters = await geoTiffImage.readRasters();
    const {[0]: rasterBath} = rasters;

    console.log(`width: ${width} raster len:${raster.length} rasterBath len:${rasterBath.length}`)

    return {
        'width': width,
        'raster': raster,
        'rasterBath': rasterBath,
    };

}

function geometryWorker() {
    self.onmessage = function (e) {
        const {lodBlockInfo} = e.data;
        getElevationRasters(lodBlockInfo).then((geoCellInfo) => {
            self.postMessage(geoCellInfo);
        });
    }
}

geometryWorker()

export {getElevationRasters}
