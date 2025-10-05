export class visualisation2D {
    perhelionEarth = 0.983290; //AU
    aEarth = 1.00000; //AU
    bEarth = 0.998987; //AU
    windowCentreX = window.innerWidth/2-80;
    windowCentreY = window.innerHeight/2-30;
    scaleLength = 100
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

    drawNeoOrbit(space, aNeo, eNeo, perhelionNeo, inclinationNeo, isHazardous) {

        inclinationNeo = -Math.PI / 180 * inclinationNeo;

        space.beginPath();
        if (isHazardous == true) {
            space.strokeStyle = "red";
        }
        else {
            space.strokeStyle = "green";
        }
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

    drawLegend(space) {
        const startX = 20;       
        const startY = 20;       
        const lineLength = 40;   
        const spacing = 25;      
        const textOffset = 10;   

        space.lineWidth = 1;     
        space.font = "12px Arial";
        space.fillStyle = "black";

        // Hazardous NEO
        space.strokeStyle = "red";
        space.beginPath();
        space.moveTo(startX, startY);
        space.lineTo(startX + lineLength, startY);
        space.stroke();
        space.fillText("Hazardous NEO Orbit", startX + lineLength + textOffset, startY + 5);

        // Safe NEO
        space.strokeStyle = "green";
        space.beginPath();
        space.moveTo(startX, startY + spacing);
        space.lineTo(startX + lineLength, startY + spacing);
        space.stroke();
        space.fillText("Safe NEO Orbit", startX + lineLength + textOffset, startY + spacing + 5);

        //Earth
        space.strokeStyle = "black";
        space.beginPath();
        space.moveTo(startX, startY + 2*spacing);
        space.lineTo(startX + lineLength, startY + 2*spacing);
        space.stroke();
        space.fillText("Earth", startX + lineLength + textOffset, startY + 2*spacing + 5);

        //MOID line
        space.strokeStyle = "grey";
        space.beginPath();
        space.setLineDash([4, 2]);
        space.lineWidth = 0.5;
        space.moveTo(startX, startY + 3*spacing);
        space.lineTo(startX + lineLength, startY + 3*spacing);
        space.stroke();
        space.fillText("MOID (Minimum Orbit Intersection Distance) line", startX + lineLength + textOffset, startY + 3*spacing + 5);

        //Sun
        space.strokeStyle = "black";
        space.lineWidth = 0.5;
        space.setLineDash([]);
        space.beginPath();
        space.arc(startX + spacing, startY + 4*spacing, 5, 0, 2 * Math.PI);
        space.fillStyle = "orange";
        space.fill();

        space.fillStyle = "black";
        space.moveTo(startX, startY + 4*spacing);
        space.fillText("Sun", startX + lineLength + textOffset, startY + 4*spacing + 5);
        space.stroke();
    }


    visualise2D(aNeo, eNeo, perhelionNeo, inclinationNeo, isHazardous) {
        var Canvas = document.createElement("canvas");
        Canvas.id = "2DVisualisation";
        Canvas.width = window.innerWidth;
        Canvas.height = window.innerHeight;

        document.body.appendChild(Canvas);

        var space = Canvas.getContext("2d");

        this.drawEarthOrbit(space);
        this.drawSun(space)
        this.drawNeoOrbit(space, aNeo, eNeo, perhelionNeo, inclinationNeo, isHazardous);
        this.drawLegend(space);
        this.drawMoidLine(space, inclinationNeo, (1.5*aNeo + this.aEarth)*this.scaleLength, isHazardous);
    }
}
