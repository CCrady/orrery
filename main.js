import * as THREE from 'three';

const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); const renderer = new THREE.WebGLRenderer(); renderer.setSize( window.innerWidth, window.innerHeight ); document.body.appendChild( renderer.domElement );
scene.fog = new THREE.Fog(0xff0000, 1, 8);

const geometry = new THREE.SphereGeometry( 1, 32, 16 );
const material = new THREE.MeshNormalMaterial( /*{ color: 0x00ff00 }*/ );
material.flatShading = true;
const cube = new THREE.Mesh( geometry, material );
scene.add( cube ); camera.position.z = 5;

const clock = new THREE.Clock();

function animate() {
    cube.rotation.x += 0.01; cube.rotation.y += 0.01;
    cube.position.set(Math.sin(clock.getElapsedTime()), 0.4, 0.3);

    camera.position.y = Math.cos(clock.getElapsedTime());
    camera.lookAt(cube.position.add(new THREE.Vector3( 0, 1, 1 )));

    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );



const params = {


}
