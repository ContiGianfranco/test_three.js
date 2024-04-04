import {
    generateBathymetricLayerDstUrl,
    generateElevationLayerDstUrl,
    generateTerrainImageryDstUrl
} from "../constants/UrlsFunctions";
import {fromUrl} from "geotiff";
import axios from "axios";
import {Buffer} from "buffer";
import {JpxImage} from "jpeg2000";

export default class CDBQuery {
    static async getElevationLayerDst(lat, lon, lod) {

        const lodBlock = {
            lat: lat,
            lon: lon,
            lod: lod,
            uref: "U0",
            rref: "R0"
        }

        const url = generateElevationLayerDstUrl(lodBlock);

        return await this.getGeoTIFFRaster(url);

    }

    static async getBathymetricLayerDst(lat, lon, lod) {

        const lodBlock = {
            lat: lat,
            lon: lon,
            lod: lod,
            uref: "U0",
            rref: "R0"
        }

        const url = generateBathymetricLayerDstUrl(lodBlock);

        return await this.getGeoTIFFRaster(url);

    }

    static async getTerrainImageryDst(lat, lon, lod) {
        const lodBlock = {
            lat: lat,
            lon: lon,
            lod: lod,
            uref: "U0",
            rref: "R0"
        }

        const url = generateTerrainImageryDstUrl(lodBlock);

        return await this.getJpeg2000(url);
    }

    static async getGeoTIFFRaster(url) {
        const geoTiff = await fromUrl(url);
        const geoTiffImage = await geoTiff.getImage();
        const rasterOptions = await geoTiffImage.readRasters();

        return rasterOptions[0];
    }

    static async getJpeg2000(url) {
        const response = await axios.get(url,  { responseType: 'arraybuffer' });
        const codeStream = Buffer.from(response.data, 'hex');

        const jpx = new JpxImage();
        jpx.parse(codeStream);

        const tiles = jpx.tiles[0].items;

        return {
            'tiles': tiles,
            'width': jpx.width,
            'height': jpx.height
        };
    }
}

export {CDBQuery}