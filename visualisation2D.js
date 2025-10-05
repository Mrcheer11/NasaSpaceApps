export class visualisation2D {
    perhelionEarth = 0.983290; //AU
    aEarth = 1.00000; //AU
    bEarth = 0.998987; //AU
    windowCentreX = 200
    windowCentreY = 200
    sunX = this.windowCentreX - (this.aEarth * 100 - this.perhelionEarth * 100);
    sunY = this.windowCentreY;

    drawEarthOrbit(space) {
        space.beginPath();
        space.ellipse(
            this.windowCentreX,
            this.windowCentreY,
            this.aEarth * 100,
            this.bEarth * 100,
            Math.PI/2,
            0,
            2 * Math.PI
        )
        space.stroke();
    }

    drawNeoOrbit(space, aNeo, eNeo, perhelionNeo, inclinationNeo) {

        inclinationNeo = -Math.PI / 180 * inclinationNeo;

        space.beginPath();
        space.ellipse(
            this.sunX + (aNeo - perhelionNeo) * Math.cos(inclinationNeo) * 100,
            this.sunY + (aNeo - perhelionNeo) * Math.sin(inclinationNeo) * 100,
            aNeo * 100,
            aNeo * Math.sqrt(1 - eNeo ** 2) * 100,
            inclinationNeo,
            0,
            2 * Math.PI
        )
        space.stroke();
    }

    drawSun(space) {
        space.beginPath();
        space.arc(this.sunX, this.sunY, 5, 0, 2 * Math.PI);
        space.fillStyle = "orange";
        space.fill();
        space.stroke();
    }

    drawMoidLine(space, inclinationNeo, length) {
        inclinationNeo = Math.PI / 180 * inclinationNeo;
        var moidLineGradient = Math.PI/2 - inclinationNeo

        space.beginPath();
        space.setLineDash([4, 2]);
        space.strokeStyle = "grey";

        space.moveTo(this.sunX, this.sunY)
        space.lineTo(
            this.sunX + length/2 * Math.cos(moidLineGradient),
            this.sunY + length/2 * Math.sin(moidLineGradient)
        )
        space.moveTo(this.sunX, this.sunY),
        space.lineTo(
            this.sunX - length/2 * Math.cos(moidLineGradient),
            this.sunY - length/2 * Math.sin(moidLineGradient)
        )
        space.stroke();
    }
    visualise2D(aNeo, eNeo, perhelionNeo, inclinationNeo) {
        var Canvas = document.createElement("canvas");
        Canvas.id = "2DVisualisation";
        Canvas.width = 400;
        Canvas.height = 400;

        var space = Canvas.getContext("2d");
        document.body.appendChild(Canvas);

        this.drawEarthOrbit(space);
        this.drawSun(space)
        this.drawNeoOrbit(space, aNeo, eNeo, perhelionNeo, inclinationNeo);
        this.drawMoidLine(space, inclinationNeo, 200)
    }
}
