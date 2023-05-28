import {ImprovedNoise} from "three/addons/math/ImprovedNoise";

function generateWater( width, height ) {
    const size = width * height;
    const data = new Uint8Array( size );
    const perlin = new ImprovedNoise();
    const z = 0;

    let quality = 2;

    for ( let j = 0; j < 1; j ++ ) {

        for ( let i = 0; i < size; i ++ ) {

            const x = i % width, y = ~ ~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

        }

        quality *= 1;

    }

    return data;
}

function generateHeight( width, height ) {

    const size = width * height;
    const data = new Uint8Array( size );
    const perlin = new ImprovedNoise();
    const z = 0;

    let quality = 1;

    for ( let j = 0; j < 4; j ++ ) {

        for ( let i = 0; i < size; i ++ ) {

            const x = i % width, y = ~ ~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

        }

        quality *= 3;

    }

    return data;

}

export {generateWater, generateHeight}