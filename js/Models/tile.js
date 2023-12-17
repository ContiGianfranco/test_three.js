import * as THREE from "three";

export default function generateTile() {
    // GEOMETRY
    const geometry = new THREE.BufferGeometry();

    const indices = [];

    const vertices = [];
    const normals = [];

    const size = 100;
    const segments = 10 + 2;

    const halfSize = size / 2;
    const segmentSize = size / (segments - 2);

    const skirt = true;

    // generate vertices, normals and color data for a simple grid geometry

    for ( let i = 0; i <= segments; i ++ ) {
        let y = ( (i-1) * segmentSize ) - halfSize;
        let z = 0;

        for ( let j = 0; j <= segments; j ++ ) {
            let x = ( (j-1) * segmentSize ) - halfSize;
            z = 0;

            if ( skirt && ( i === 0 || i === segments ) ) {
                z = -20;
                y = i/segments * size - halfSize;
            }

            if ( skirt && ( j === 0 || j === segments ) ) {
                z = -20;
                x = j/segments * size - halfSize;
            }

            vertices.push( x, - y, z );

            normals.push( 0, 0, 1 );

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

    const material = new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide,
        wireframe: true,
    });

    geometry.rotateX(-Math.PI / 2)

    return new THREE.Mesh(geometry, material);
}