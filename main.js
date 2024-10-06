import * as THREE from 'three';
import { sunParams, planetsParams, findCoords } from '/propagator.js';
import { OrreryControls } from '/controls.jsx';


// Set up DOM controls

const speedInput = document.getElementById('speedInput');
const speedOutput = document.getElementById('speedOutput');
speedOutput.innerHTML = speedInput.value;
speedInput.oninput = function() {
    speedOutput.innerHTML = this.value;
}


// Set up threejs scene

const _LAYERS = {
    ALL: 0,
    PLANETS: 1,
    COLLIDERS: 2,
};

// current time displayed, in centuries since the J2000 epoch
var tCentury = 0;

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
    let planetGeometry = new THREE.SphereGeometry( radius, 32, 16 );
    let planetTexture = textureLoader.load(texturePath);
    planetTexture.colorSpace = THREE.SRGBColorSpace;
    let planetMaterial = new THREE.MeshBasicMaterial({ map: planetTexture });
    let planet = new THREE.Mesh( planetGeometry, planetMaterial );
    planet.layers.enable(_LAYERS.PLANETS);

    let colliderGeometry = new THREE.SphereGeometry( radius * 2.5, 8, 4 );
    let collider = new THREE.Mesh( colliderGeometry );
    collider.layers.enable(_LAYERS.COLLIDERS);

    return [planet, collider];
};
var planets = {}
for (let property in planetsParams) {
    let [planet, collider] = makePlanet(
        planetsParams[property].misc.diameter,
        `/${property}.jpeg`
    );
    planet.add(collider);
    planets[property] = planet;
    scene.add(planet);
} // planets is now populated
const [sun, _] = makePlanet( sunParams.diameter, '/sun.jpeg' );
sun.layers.enable(_LAYERS.COLLIDERS);
scene.add(sun);
camera.layers.disable(_LAYERS.ALL);
camera.layers.enable(_LAYERS.PLANETS);
camera.position.set(0, 1, 10);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const controls = new OrreryControls( camera, renderer.domElement, sun );

const clock = new THREE.Clock();


function animate() {
    // divide by 1200 to convert delta in seconds to delta in centuries
    tCentury += clock.getDelta() * speedInput.value / 1200 ;
    for (let property in planetsParams) {
        let predictedCoords = findCoords(
            planetsParams[property],
            tCentury,
            0.0000001,
        );
        planets[property].position.copy(predictedCoords);
    }
    controls.update();
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );

// modified from https://threejs.org/docs/index.html?q=scene#api/en/core/Raycaster
const raycaster = new THREE.Raycaster();
raycaster.layers.set(_LAYERS.COLLIDERS);
// whether the pointer has moved since it was initially presses down
var pointerHasMoved = false;
renderer.domElement.addEventListener( 'pointerdown', () => { pointerHasMoved = false; } );
renderer.domElement.addEventListener( 'pointermove', () => { pointerHasMoved = true; } );
function updateTarget(event) {
    if (pointerHasMoved || event.buttons) return;
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    let pointer = new THREE.Vector2(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        - ( event.clientY / window.innerHeight ) * 2 + 1
    );
    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera( pointer, camera );
    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children );
    let target = sun;
    for (let intersection of intersects) {
        target = intersection.object;
        // if we hit a planet's collider then we need to get its parent planet
        if (target !== sun) {
            target = target.parent;
        }
        // if we're focused on a planet right now and the raycast hit it, the user probably actually
        // wanted to move to another planet
        if (target !== sun && target !== controls.target) {
            break;
        }
    }
    controls.target = target;
}
renderer.domElement.addEventListener( 'pointerup', updateTarget );

