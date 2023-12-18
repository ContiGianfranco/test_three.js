import * as THREE from "three";

export default function generateTile() {
    // GEOMETRY
    const geometry = new THREE.BufferGeometry();

    const indices = [];

    const vertices = [];
    const normals = [];

    const size = 1024;
    const segments = 1024 + 2;

    const halfSize = size / 2;
    const segmentSize = size / (segments - 2);

    const skirt = true;

    // generate vertices, normals and color data for a simple grid geometry

    for ( let i = 0; i <= segments; i ++ ) {

        let x,
            y = ( (i-1) * segmentSize ) - halfSize,
            z = 0,
            xNorm = 0,
            yNorm = 0,
            zNorm = 1,
            percentage = 0;

        if ( skirt && ( i === 0 || i === segments ) ) {

            z = -20;
            percentage = i/segments;
            y = percentage * size - halfSize;
            yNorm = -2 * percentage + 1;
            zNorm = 0;
        }

        for ( let j = 0; j <= segments; j ++ ) {

            xNorm = 0;
            x = ( (j-1) * segmentSize ) - halfSize;

            if ( skirt && ( j === 0 || j === segments ) ) {

                percentage = j/segments;
                x = percentage * size - halfSize;
                vertices.push( x, - y, -20 );
                xNorm = 2 * percentage - 1;

            } else {

                vertices.push( x, - y, z );

            }

            normals.push( xNorm, yNorm, 1 );

        }

    }

    for ( let j = 0; j <= segments; j ++ ) {

    }

    // generate indices (data for element array buffer)

    for ( let i = 0; i < segments; i ++ ) {

        for ( let j = 0; j < segments; j ++ ) {

            const a = i * ( segments + 1 ) + ( j + 1 );
            const b = i * ( segments + 1 ) + j;
            const c = ( i + 1 ) * ( segments + 1 ) + j;
            const d = ( i + 1 ) * ( segments + 1 ) + ( j + 1 );

            // generate two faces (triangles) per iteration

            indices.push( a, b, d ); // face one
            indices.push( b, c, d ); // face two

        }

    }

    //

    geometry.setIndex( indices );
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );

    let material = new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide,
    });

    material = new THREE.MeshPhongMaterial( {
        color: 0xb57272,
        shininess: 0.8,
        clippingPlanes: window.appData.clippingPlanes,
        wireframe: false,
    } );

    geometry.rotateX(-Math.PI / 2)


    return new THREE.Mesh(geometry, material);
}