// Función que dada una latitud ( entre [-90, 90) )
// En caso de ingresar un valor invalido retona
// TODO: verificar que hace CDB en caso de ser 90
function ratioLongitude(lat) {
    if (lat >= -90 && lat < -89) {
        return 12;
    } else if (lat >= -89 && lat < -80) {
        return 6;
    } else if (lat >= -80 && lat < -75) {
        return 4;
    } else if (lat >= -75 && lat < -70) {
        return 3;
    } else if (lat >= -70 && lat < -50) {
        return 2;
    } else if (lat >= -50 && lat < 50) {
        return 1;
    } else if (lat >= 50 && lat < 70) {
        return 2;
    } else if (lat >= 70 && lat < 75) {
        return 3;
    } else if (lat >= 75 && lat < 80) {
        return 4;
    } else if (lat >= 80 && lat < 89) {
        return 6;
    } else if (lat >= 89 && lat < 90) {
        return 12;
    } else {
        throw new Error(`Invalid latitude ${lat}`);
    }
}

export {ratioLongitude}