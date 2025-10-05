import { getAllNeosData, getTopNeos, getNeoDetailsById } from "./getAPI.js";
import { visualisation2D } from "./visualisation2D.js";
import * as THREE from 'https://unpkg.com/three@0.156.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.156.0/examples/jsm/controls/OrbitControls.js';

console.log('main2D.js module loaded');

var button = document.getElementById("enterButton");

if (button) {
    button.addEventListener("click", async () => {
    var date = document.getElementById("dateInput").value;
    var option = document.getElementById("UserOption").value;

    var allNeos = await getAllNeosData(date);
    var reqdNEO = getTopNeos(allNeos)[option.toLowerCase()];
    var orbital_data = await getNeoDetailsById(reqdNEO["id"]);

    var aNeo = parseFloat(orbital_data["orbital_data"]["semi_major_axis"]);
    var eNeo = parseFloat(orbital_data["orbital_data"]["eccentricity"]);
    var perhelionNeo = parseFloat(orbital_data["orbital_data"]["perihelion_distance"]);
    var inclinationNeo = parseFloat(orbital_data["orbital_data"]["inclination"]);
    var isHazardous = orbital_data["is_potentially_hazardous_asteroid"];

    console.log("Drawing NEO:", reqdNEO.name);

    var existingCanvas = document.getElementById("2DVisualisation");
    if (existingCanvas) {
        existingCanvas.remove()
    }

    var visuals = new visualisation2D();
    visuals.visualise2D(aNeo, eNeo, perhelionNeo, inclinationNeo, isHazardous);
    });
} else {
    console.warn('main2D.js: enterButton not found in document');
}



