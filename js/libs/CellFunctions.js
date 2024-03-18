function getCellCoordinates(lodBlockInfo) {

    const lodLat = lodBlockInfo.lat.substring(1);
    const lodLon = lodBlockInfo.lon.substring(1);

    const cell_lat = (lodBlockInfo.lat[0] === 'S') ? -lodLat : +lodLat;
    const cell_lon = (lodBlockInfo.lon[0] === 'W') ? -lodLon : +lodLon;

    return [cell_lat, cell_lon];
}

export {getCellCoordinates};