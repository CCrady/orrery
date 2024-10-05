import * as THREE from 'three';

const keplerParams = {
    mercury: {
        t0: {
            a: 0.38709927,
            e: 0.20563593,
            I: 7.00497902,
            L: 252.25032350,
            longPeri: 77.45779628,
            longNode: 48.33076593,
        },
        rate: {
            a: 0.00000037,
            e: 0.00001906,
            I: -0.00594749,
            L: 149472.67411175,
            longPeri: 0.16047689,
            longNode: -0.12534081,
        },
    },
    venus: {
        t0: {
            a: 0.72333566,
            e: 0.00677672,
            I: 3.39467605,
            L: 181.97909950,
            longPeri: 131.60246718,
            longNode: 76.67984255,
        },
        rate: {
            a: 0.00000390,
            e: -0.00004107,
            I: -0.00078890,
            L: 58517.81538729,
            longPeri: 0.00268329,
            longNode: -0.27769418,
        },
    },
    earthmoon: {
        t0: {
            a: 1.00000261,
            e: 0.01671123,
            I: -0.00001531,
            L: 100.46457166,
            longPeri: 102.93768193,
            longNode: 0.0,
        },
        rate: {
            a: 0.00000562,
            e: -0.00004392,
            I: -0.01294668,
            L: 35999.37244981,
            longPeri: 0.32327364,
            longNode: 0.0,
        },
    },
    mars: {
        t0: {
            a: 1.52371034,
            e: 0.09339410,
            I: 1.84969142,
            L: -4.55343205,
            longPeri: -23.94362959,
            longNode: 49.55953891,
        },
        rate: {
            a: 0.00001847,
            e: 0.00007882,
            I: -0.00813131,
            L: 19140.30268499,
            longPeri: 0.44441088,
            longNode: -0.29257343,
        },
    },
    jupiter: {
        t0: {
            a: 5.20288700,
            e: 0.04838624,
            I: 1.30439695,
            L: 34.39644051,
            longPeri: 14.72847983,
            longNode: 100.47390909,
        },
        rate: {
            a: -0.00011607,
            e: -0.00013253,
            I: -0.00183714,
            L: 3034.74612775,
            longPeri: 0.21252668,
            longNode: 0.20469106,
        },
    },
    saturn: {
        t0: {
            a: 9.53667594,
            e: 0.05386179,
            I: 2.48599187,
            L: 49.95424423,
            longPeri: 92.59887831,
            longNode: 113.66242448,
        },
        rate: {
            a: -0.00125060,
            e: -0.00050991,
            I: 0.00193609,
            L: 1222.49362201,
            longPeri: -0.41897216,
            longNode: -0.28867794,
        },
    },
    uranus: {
        t0: {
            a: 19.18916464,
            e: 0.04725744,
            I: 0.77263783,
            L: 313.23810451,
            longPeri: 170.95427630,
            longNode: 74.01692503,
        },
        rate: {
            a: -0.00196176,
            e: -0.00004397,
            I: -0.00242939,
            L: 428.48202785,
            longPeri: 0.40805281,
            longNode: 0.04240589,
        },
    },
    neptune: {
        t0: {
            a: 30.06992276,
            e: 0.00859048,
            I: 1.77004347,
            L: -55.12002969,
            longPeri: 44.96476227,
            longNode: 131.78422574,
        },
        rate: {
            a: 0.00026291,
            e: 0.00005105,
            I: 0.00035372,
            L: 218.45945325,
            longPeri: -0.32241464,
            longNode: -0.00508664,
        },
    },
};

// planetParams is one of the sub-objects of params, time is in centuries since the J2000 epoch
// tol defines the precision of the estimation, in maximum possible degrees of error
// return value is the coordinates of the planet at the given time in the J2000 coordinate system
// see https://ssd.jpl.nasa.gov/planets/approx_pos.html
// NOTE: this currently uses the 1800AD-2050AD method and therefore is not accurate for times
// outside of that range
function findCoords(planetParams, time, tol) {
    let curr = {};
    for (let property in planetParams.t0) {
        curr[property] = planetParams.t0[property] + time * planetParams.rate[property];
    } // curr now contains the current values of a, e, I, etc.

    let argPeri = curr.longPeri - curr.longNode;
    let M = (curr.L - curr.longPeri) % 360;
    if (M > 180) M -= 360;
    // iterate Newton's method to approximate the solution to Kepler's equation
    const eStar = 180 / Math.PI * Math.E;
    let E = M + eStar * Math.sin(M);
    do {
        let dM = M - (E - eStar * Math.sin(E));
        let dE = dM / (1 - Math.E * Math.cos(E));
        E += dE;
    } while (Math.abs(dE) > tol);
    // E is now within tol degrees of the right answer

    const yCoeff = Math.sqrt(1 - Math.E * Math.E);
    let xPrime = curr.a * (Math.cos(E) - Math.E);
    let yPrime = curr.a * yCoeff * Math.sin(E);
    let cosPeri = Math.cos(argPeri);
    let cosNode = Math.cos(curr.longNode);
    let cosI = Math.cos(curr.I);
    let sinPeri = Math.sin(argPeri);
    let sinNode = Math.sin(curr.longNode);
    let sinI = Math.sin(curr.I);

    let xEcl = (cosPeri * cosNode - sinPeri * sinNode * cosI) * xPrime
        + (- sinPeri * cosNode - cosPeri * sinNode * cosI) * yPrime;
    let yEcl = (cosPeri * sinNode + sinPeri * cosNode * cosI) * xPrime
        + (- sinPeri * sinNode + cosPeri * cosNode * cosI) * yPrime;
    let zEcl = (sinPeri * sinI) * xPrime + (cosPeri * sinI) * yPrime;
    return new THREE.Vector3(xEcl, yEcl, zEcl);
}

