function calculateTrueAnomaly(eccentricity, eccentricAnomaly) {
    const trueAnomaly = 2 * Math.atan2(
        Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
        Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
    );

    return trueAnomaly;
}

function getEccentricAnomaly(meanAnomaly, eccentricity, tolerance = 1e-10, maxIter = 100) {
    let eccentricAnomaly;
        
    //Initial guess
    if (eccentricity < 0.8) {
        eccentricAnomaly = meanAnomaly;
    } 
    else {
        eccentricAnomaly = Math.PI;
    }

    // Newton's method iteration
    for (let i = 0; i < maxIter; i++) {
        const keplerResidual = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;

        if (Math.abs(keplerResidual) < tolerance) {
            return eccentricAnomaly;
        }

        const keplerResidualPrime = 1 - eccentricity * Math.cos(eccentricAnomaly);
        eccentricAnomaly -= keplerResidual / keplerResidualPrime;
    }

    return eccentricAnomaly;
}