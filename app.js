import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { or } from 'three/tsl'; //need to check where i will use it 
import {getAllNeosData, getTopNeos, getNeoDetailsById} from './getAPI.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

//Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
camera.position.set(0, 100, 300);

//renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

//stars
function createStarfield(count){
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < count; i++){
    const x = (Math.random() - 0.5) * 800 
    const y = (Math.random() - 0.5) * 800 
    const z = (Math.random() - 0.5) * 800 

    positions.push(x, y, z);
  }
 
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({color: 0xffffff, size: 0.5});
  const points = new THREE.Points(geometry, material);
  scene.add(points);
}
createStarfield(2000);

//sun
const sunGeometry = new THREE.SphereGeometry(6, 32, 32);
const sunMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 2, roughness: 0.1, metalness: 0});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

//earth
const earthGeometry = new THREE.SphereGeometry(5, 32, 32);
const earthMaterial = new THREE.MeshStandardMaterial({color: 0x1e90ff});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

//lights
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);


// meteors Placeholder



// NASA Data Fetching
//done in getAPI.js

// Orbit line creation function
function drawOrbit(majorearthaxis, minorearthaxis, color = 0xffffff, segments = 128) {
  const points = [];

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * majorearthaxis;
    const z = Math.sin(theta) * minorearthaxis;

    points.push(new THREE.Vector3(x, y, z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });

  let orbitLine;

  if (open) {
    orbitLine = new THREE.Line(geometry, material);      // open trajectory (e.g., meteor)
  } else {
    orbitLine = new THREE.LineLoop(geometry, material);  // closed orbit (e.g., Earth)
  }
  return orbitLine;
}

// Earth orbit (elliptical & tilted slightly)
const majorearthaxis = 40;
const minorearthaxis = majorearthaxis * 0.983;
const orbitSpeed = 0.01;

const earthOrbit = drawOrbit(majorearthaxis, minorearthaxis, 0x00ff00, 256);
scene.add(earthOrbit);



//Process Data and Create allNeos
//not done yet
const allNeos = [];

function createAllNeos(neosData;

)
  


//not done yet
// Animation

const timer = new THREE.Timer();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = timer.getElapsedTime();

  // Earth
  earth.position.x = Math.cos(elapsed * orbitSpeed) * majorearthaxis;
  earth.position.z = Math.sin(elapsed * orbitSpeed) * minorearthaxis;
  earth.position.y = Math.sin(axialtilt) * 2;
  earth.rotation.y += 0.02;

  // allNeos
  allNeos.forEach(a => {
    a.angle += a.speed;
    const x = Math.cos(a.angle) * a.radiusX;
    const z = Math.sin(a.angle) * a.radiusZ;
    const y = Math.sin(a.tilt) * 10;
    a.mesh.position.set(x, y, z);
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();


var optionblock = document.getElementById("UserOption");
var dateblock = document.getElementById("dateInput");
var button = document.getElementById("button all");

var option = optionblock.value;
var date = dateblock.value;

button.addEventListener("click", main());

function main (){
  allNeos = getAllNeosData(date)
  orbitalData = getTopNeos(allNeos)[option]
  createAllNeos(orbitalData)
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});