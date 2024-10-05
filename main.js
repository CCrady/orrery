import * as THREE from 'three';
import { keplerParams, findCoords } from '/propagator.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.SphereGeometry( 0.5, 32, 16 );
const material = new THREE.MeshNormalMaterial();
material.flatShading = true;

let planets = {}
for (let property in keplerParams) {
    let planet = new THREE.Mesh( geometry, material );
    planets[property] = planet;
    scene.add(planet);
}
camera.position.z = 10;
camera.lookAt(new THREE.Vector3(0, 0, 0));

const clock = new THREE.Clock();


function animate() {
    for (let property in keplerParams) {
        let predictedCoords = findCoords(
            keplerParams[property],
            clock.getElapsedTime() / 300,
            0.0000001,
        );
        planets[property].position.set(predictedCoords.x, predictedCoords.y, predictedCoords.z);
    }
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );

