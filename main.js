import * as THREE from 'three';
import { keplerParams, findCoords } from '/propagator.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.SphereGeometry( 1, 32, 16 );
const material = new THREE.MeshNormalMaterial();
material.flatShading = true;
const planet = new THREE.Mesh( geometry, material );
scene.add( planet );
camera.position.z = 5;
camera.lookAt(new THREE.Vector3(0, 0, 0));

const clock = new THREE.Clock();


function animate() {
    let predictedCoords = findCoords(
        keplerParams.mars,
        clock.getElapsedTime() / 300,
        0.0000001,
    );
    //predictedCoords.divideScalar(100);

    planet.position.set(predictedCoords.x, predictedCoords.y, predictedCoords.z);
    //camera.lookAt(planet.position);

    renderer.render( scene, camera );
    console.log(predictedCoords);
}
renderer.setAnimationLoop( animate );

