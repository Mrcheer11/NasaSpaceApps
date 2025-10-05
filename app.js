import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'; 
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

const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);


// Orbit line creation function
function drawOrbit(maj, min, color = 0xffffff, segments = 128, open = false) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * maj, 0, Math.sin(theta) * min));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });
  return open ? new THREE.Line(geometry, material) : new THREE.LineLoop(geometry, material);
}

// Earth orbit
const majorearthaxis = 40;
const minorearthaxis = majorearthaxis * 0.983;
const orbitSpeed = 0.01;

const earthOrbit = drawOrbit(majorearthaxis, minorearthaxis, 0x00ff00, 256);
scene.add(earthOrbit);



const allNeos = [];

function createAllNeos(neo) {
  const scaleLength = 15;
  const orbit = neo.orbit;

  if (!orbit) return; // in case orbit data is missing

  const diameter = Math.max(neo.diameter_km * 0.5, 0.5);
  const color = neo.is_hazardous ? 0xff0000 : 0xffffff;

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(diameter, 12, 12),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: neo.is_hazardous ? 1 : 0.3 })
  );
  scene.add(mesh);

  // Orbit line
  const orbitLine = drawOrbit(orbit.semiMajorAxis * scaleLength, orbit.semiMinorAxis * scaleLength, color, 256, true);
  scene.add(orbitLine);

  //animation storage
  allNeos.push({name: neo.name, mesh, orbitLine, radiusX: orbit.semiMajorAxis * scaleLength, radiusZ: orbit.semiMinorAxis * scaleLength, angle: orbit.angle, speed: orbit.angular_speed * 0.05, tilt: 0});
}


// Animation

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // Earth orbit
  earth.position.x = Math.cos(elapsed * orbitSpeed) * majorearthaxis;
  earth.position.z = Math.sin(elapsed * orbitSpeed) * minorearthaxis;
  earth.rotation.y += 0.02;

  // Animate NEOs
  allNeos.forEach(a => {
    a.angle += a.speed;
    a.mesh.position.set(Math.cos(a.angle) * a.radiusX, 0, Math.sin(a.angle) * a.radiusZ);
  });

  controls.update();
  renderer.render(scene, camera);
} 
animate();

var button = document.getElementById("button all");

button.addEventListener("click", main());

async function main() {

  var optionblock = document.getElementById("UserOption");
  var dateblock = document.getElementById("dateInput");
  allNeos.forEach(a => {
  scene.remove(a.mesh);
  scene.remove(a.orbitLine);
});
allNeos.length = 0;

  const date = dateblock.value;
  const option = optionblock.value;

  if (!date || !option) {
    alert("Please select both a date and an option.");
    return;
  }

  const allNeosData = await getAllNeosData(date);
  const topNeoSummary = getTopNeos(allNeosData)[option.toLowerCase()];
  const neoDetails = await getNeoDetailsById(topNeoSummary.id);
  createAllNeos(neoDetails);
}


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});