import * as THREE from 'https://unpkg.com/three@0.156.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.156.0/examples/jsm/controls/OrbitControls.js';
import { getAllNeosData, getTopNeos, getNeoDetailsById } from './getAPI.js';

console.log('app.js module loaded');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 100, 300);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);
console.log('app.js: renderer.domElement appended to document.body (canvas created)');

// Expose core objects for debugging in DevTools
window.__APP = window.__APP || {};
window.__APP.renderer = renderer;
window.__APP.scene = scene;
window.__APP.camera = camera;

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
// expose controls after initialization
window.__APP.controls = controls;
console.log('app.js: OrbitControls initialized and exposed on window.__APP.controls');

// give the canvas an id so it's easy to inspect
if (renderer.domElement && !renderer.domElement.id) renderer.domElement.id = 'three-canvas';
// Improve interaction UX
const canvasEl = renderer.domElement;
canvasEl.style.touchAction = 'none';
canvasEl.style.cursor = 'grab';
canvasEl.addEventListener('pointerdown', () => canvasEl.style.cursor = 'grabbing');
canvasEl.addEventListener('pointerup', () => canvasEl.style.cursor = 'grab');

// OrbitControls config for better feel
controls.enablePan = false;
controls.enableZoom = true;
controls.rotateSpeed = 0.6;
controls.zoomSpeed = 0.8;

// Starfield
function createStarfield(count) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 1600;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1600;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1600;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, sizeAttenuation: true });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
}
createStarfield(2000);

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(6, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 2, roughness: 0.2 })
);
scene.add(sun);

// Earth
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(5, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x1e90ff })
);
scene.add(earth);

// Lights
scene.add(new THREE.AmbientLight(0x404040, 1));
const sunLight = new THREE.PointLight(0xffffff, 2, 2000);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Orbit helper
function drawOrbit(maj, min, color = 0xffffff, segments = 256) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(t) * maj, 0, Math.sin(t) * min));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color, opacity: 0.5, transparent: true });
  return new THREE.LineLoop(geo, mat);
}

// Earth orbit params
const majorearthaxis = 40;
const minorearthaxis = majorearthaxis * 0.983;
const orbitSpeed = 0.01;
const earthOrbit = drawOrbit(majorearthaxis, minorearthaxis, 0x00ff00, 256);
scene.add(earthOrbit);

// NEO storage
const allNeos = [];

// Create a visual NEO from normalized data
function createAllNeos(neo) {
  if (!neo || !neo.orbit) return;

  // scale orbital axes for visibility
  const scale = 15;
  const radiusX = (neo.orbit.semiMajorAxis || 1) * scale;
  const radiusZ = (neo.orbit.semiMinorAxis || radiusX * 0.8);
  const diameter = Math.max((neo.diameter_km || 0.1) * 0.7, 0.3);
  const color = neo.is_hazardous || neo.is_potentially_hazardous_asteroid ? 0xff4444 : 0xffffff;

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(diameter, 12, 12),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4 })
  );
  scene.add(mesh);

  const orbitLine = drawOrbit(radiusX, radiusZ, color, 256);
  scene.add(orbitLine);

  allNeos.push({
    mesh,
    orbitLine,
    radiusX,
    radiusZ,
    angle: neo.orbit.angle ?? Math.random() * Math.PI * 2,
    speed: (neo.orbit.angular_speed ?? 0.0005) * 0.05
  });
}

// Animation
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Earth motion
  earth.position.x = Math.cos(t * orbitSpeed) * majorearthaxis;
  earth.position.z = Math.sin(t * orbitSpeed) * minorearthaxis;
  earth.rotation.y += 0.01;

  // NEOs
  for (const n of allNeos) {
    n.angle += n.speed;
    n.mesh.position.x = Math.cos(n.angle) * n.radiusX;
    n.mesh.position.z = Math.sin(n.angle) * n.radiusZ;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Wire button to main
const button = document.getElementById('buttonAll');
if (button) button.addEventListener('click', main);

async function main() {
  try {
    const dateInput = document.getElementById('dateInput')?.value;
    const option = document.getElementById('UserOption')?.value;
    if (!dateInput || !option) { alert('Select date and option'); return; }

    // Clear previous
    allNeos.forEach(n => {
      if (n.mesh) scene.remove(n.mesh);
      if (n.orbitLine) scene.remove(n.orbitLine);
    });
    allNeos.length = 0;

    const neos = await getAllNeosData(dateInput);
    if (!Array.isArray(neos) || neos.length === 0) { alert('No NEOs for that date'); return; }

    const tops = getTopNeos(neos);
    const chosen = tops?.[option.toLowerCase()];
    if (!chosen) { alert('No top NEO for option'); return; }

    const details = await getNeoDetailsById(chosen.id);
    // Normalize orbital properties (fallback sensible defaults)
    const orbital = details?.orbital_data || {};
    const semiMajor = parseFloat(orbital.semi_major_axis || 1);
    const ecc = parseFloat(orbital.eccentricity || 0);
    const semiMinor = semiMajor * Math.sqrt(Math.max(0, 1 - ecc * ecc));
    const angularSpeed = (details?.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second)
      ? parseFloat(details.close_approach_data[0].relative_velocity.kilometers_per_second) / 50000
      : 0.0005;

    const normalized = {
      name: details.name || chosen.name,
      diameter_km: chosen.diameter_km || 0.1,
      is_hazardous: details.is_potentially_hazardous_asteroid ?? chosen.hazardous,
      orbit: {
        semiMajorAxis: semiMajor,
        semiMinorAxis: semiMinor,
        angular_speed: angularSpeed,
        angle: Math.random() * Math.PI * 2
      }
    };

    createAllNeos(normalized);
  } catch (err) {
    console.error('main() error:', err);
    alert('Error fetching or visualizing NEO data — check console.');
  }
}

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});