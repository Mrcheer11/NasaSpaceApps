export class visualisation2D {
    perhelionEarth = 0.983290; //AU
    aEarth = 1.00000; //AU
    bEarth = 0.998987; //AU
    windowCentreX = 200;
    windowCentreY = 200;
    scaleLength = 150;
    sunX = this.windowCentreX - (this.aEarth * this.scaleLength - this.perhelionEarth * this.scaleLength);
    sunY = this.windowCentreY;

    drawEarthOrbit(space) {
        space.beginPath();
        space.ellipse(
            this.windowCentreX,
            this.windowCentreY,
            this.aEarth * this.scaleLength,
            this.bEarth * this.scaleLength,
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
            this.sunX + (aNeo - perhelionNeo) * Math.cos(inclinationNeo) * this.scaleLength,
            this.sunY + (aNeo - perhelionNeo) * Math.sin(inclinationNeo) * this.scaleLength,
            aNeo * this.scaleLength,
            aNeo * Math.sqrt(1 - eNeo ** 2) * this.scaleLength,
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

    showMoid(space, moid) {
        
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
        this.drawMoidLine(space, inclinationNeo, 2*this.scaleLength)
    }
}
