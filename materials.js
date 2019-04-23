const vertexshader = [
    "attribute float scale;",
    "void main() {",
    "   vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
    "   gl_PointSize = scale * ( 300.0 / - mvPosition.z );",
    "   gl_Position = projectionMatrix * mvPosition;",
    "}"
].join('\n')


    
const fragmentshader=[
    "uniform vec3 color;",
    "void main() {",
    "   if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;",
    "   gl_FragColor = vec4( color, 1.0 );",
    "}"
].join("\n")


class MaterialLibrary{
}

function  uniform_vertex(color=0xfffff){
    var material = new THREE.ShaderMaterial( {
        uniforms: {
            color: { value: new THREE.Color( color ) },
        },
        vertexShader: vertexshader,
        fragmentShader: fragmentshader
    } );
    return material
}

MaterialLibrary.uniform = uniform_vertex