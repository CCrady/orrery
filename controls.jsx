import {
    Controls,
    MOUSE,
    TOUCH,
    Vector3,
    Spherical,
    Clock,
} from 'three';


export class OrreryControls extends Controls {
    offset = new Spherical( 1, 1, 0 );
    rotateSpeed = 0.005;
    dollySpeed = 1.0003;
    easingSpeed = 0.5;
    easingFunction = (t) => {
        return 1 - Math.pow(1 - t, 3);
    };
    // we don't allow panning, so that there's always an object which is the target
    mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: null };
    touches = { ONE: TOUCH.ROTATE, TWO: null };
    constructor( object, domElement = null, target, params = {} ) {
        super( object, domElement );

        Object.assign(this, params);

        this._target = target;
        this._oldPosition = new Vector3();
        this._clock = new Clock();

        this._onMouseMove = onMouseMove.bind(this);
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
        // make sure we can only zoom in so far, to avoid clipping
        this.offset.radius = Math.max(
            this.offset.radius,
            this.target.geometry.parameters.radius + this.object.near,
        );

        // hacky way of getting the camera to point in the right direction
        // in theory it should be possible to directly set the camera's rotation to the inverse of
        // the offset's orientation, but I couldn't figure out the right conversions
        let invLerpFactor = 1 - this.easingFunction(
            Math.min( 1, this._clock.getElapsedTime() / this.easingSpeed )
        );
        let fromPosition = this._oldPosition.clone();
        let toPosition = new Vector3()
            .setFromSpherical(this.offset)
            .add(this.target.position);
        let invDeltaPosition = fromPosition.clone().sub(toPosition).multiplyScalar(invLerpFactor);
        let tweenPosition = toPosition.clone().add(invDeltaPosition);
        let lookPosition = this.target.position.clone().add(invDeltaPosition);

        this.object.position.copy(tweenPosition);
        this.object.lookAt(lookPosition);
    }

    set target(target) {
        this._oldPosition = this.object.position.clone();
        this._target = target;
        this._clock.start();
    }

    get target() {
        return this._target;
    }
}

function onMouseMove(event) {
    if (event.buttons & 1) {
        this.offset.phi   -= event.movementY * this.rotateSpeed;
        this.offset.theta -= event.movementX * this.rotateSpeed;
        this.offset.makeSafe();
    }
}

function onMouseWheel(event) {
    event.preventDefault();
    this.offset.radius *= Math.pow(this.dollySpeed, event.deltaY);
}
