import CDBQuery from "./CDBQuery/CDBQuery";

function makeQuery() {
    self.onmessage = async function (e) {
        const {lat, lon, lod} = e.data;
        const elevationLayer = await CDBQuery.getElevationLayerDst(lat, lon, lod);
        const bathymetricLayer = await CDBQuery.getBathymetricLayerDst(lat, lon, lod);

        self.postMessage({
            'elevationLayer': elevationLayer,
            'bathymetricLayer': bathymetricLayer,
        });
    }
}

await makeQuery()