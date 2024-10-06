import {
    Controls,
    MOUSE,
    TOUCH,
    Vector3,
    Spherical,
} from 'three';


const rotateSpeed = 0.005;
const dollySpeed = 1.0003;

export class OrreryControls extends Controls {
    target;
    offset;
    state;
    constructor( object, domElement = null, target ) {
        super( object, domElement );

        this.target = target;
        this.offset = new Spherical( 1, 1, 0 );
        // we don't allow panning, so that there's always an object which is the target
        this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: null };
        this.touches = { ONE: TOUCH.ROTATE, TWO: null };

        this._onMouseMove = onMouseMove.bind(this);
        //this._onMouseUp = onMouseUp.bind(this);
        //this._onMouseDown = onMouseDown.bind(this);
        this._onMouseWheel = onMouseWheel.bind(this);

        if (this.domElement) this.connect();
        this.update();
    }

    connect() {
        this.domElement.addEventListener( 'mousemove', this._onMouseMove );
        this.domElement.addEventListener( 'wheel', this._onMouseWheel );
        // TODO: is this necessary? copy-pasted from https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js
        //this.domElement.style.touchAction = 'none'; // disable touch scroll
    }

    disconnect() {
        this.domElement.removeEventListener( 'mousemove', this._onMouseMove );
        this.domElement.removeEventListener( 'wheel', this._onMouseWheel );
        // TODO: is this necessary? copy-pasted from https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js
        //this.domElement.style.touchAction = 'auto';
    }

    dispose() {
        this.disconnect();
    }

    update() {
        let cameraPosition = new Vector3()
            .setFromSpherical(this.offset)
            .add(this.target.position);
        this.object.position.copy(cameraPosition);
        this.object.lookAt(this.target.position);
        //console.log(cameraPosition);
    }
}

function onMouseMove(event) {
    if (event.buttons & 1) {
        this.offset.phi   -= event.movementY * rotateSpeed;
        this.offset.theta -= event.movementX * rotateSpeed;
        this.offset.makeSafe();
    }
}

function onMouseWheel(event) {
    event.preventDefault();
    this.offset.radius *= Math.pow(dollySpeed, event.deltaY);
}
