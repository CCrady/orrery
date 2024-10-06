import * as THREE from 'three';
import { sunParams, planetsParams, findCoords } from '/propagator.js';
import { OrreryControls } from '/controls.jsx';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const textureLoader = new THREE.TextureLoader();
const makePlanet = (diameter, texturePath) => {
    // TODO: play with this function to strike a balance between large enough to see and small
    // enough that the sun doesn't occlude mercury
    let radius = 0.03 * Math.log( 4 + diameter / planetsParams.mercury.misc.diameter );
    // 32 and 16 magic numbers are arbitrary and determine tri count for the mesh. Can be adjusted
    // as needed
    let geometry = new THREE.SphereGeometry( radius, 32, 16 );
    let texture = textureLoader.load(texturePath);
    texture.colorSpace = THREE.SRGBColorSpace;
    let material = new THREE.MeshBasicMaterial({ map: texture });
    return new THREE.Mesh( geometry, material );
};
var planets = {}
for (let property in planetsParams) {
    let planet = makePlanet( planetsParams[property].misc.diameter, `/${property}.jpeg` );
    planets[property] = planet;
    scene.add(planet);
} // planets is now populated
const sun = makePlanet( sunParams.diameter, '/sun.jpeg' );
scene.add(sun);
camera.position.set(0, 1, 10);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const controls = new OrreryControls( camera, renderer.domElement, sun );

const clock = new THREE.Clock();


function animate() {
    for (let property in planetsParams) {
        let predictedCoords = findCoords(
            planetsParams[property],
            clock.getElapsedTime() / 500,
            0.0000001,
        );
        planets[property].position.copy(predictedCoords);
    }
    controls.update();
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );

// BEGIN PASTE
// from https://threejs.org/docs/index.html?q=scene#api/en/core/Raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
function onPointerMove( event ) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
function updateTarget() {
    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera( pointer, camera );
    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children );
    if ( intersects.length > 0 ) {
        controls.target = intersects[0].object;
    } else {
        controls.target = sun;
    }
}
window.addEventListener( 'pointermove', onPointerMove );
window.addEventListener( 'keypress', updateTarget );
// END PASTE
