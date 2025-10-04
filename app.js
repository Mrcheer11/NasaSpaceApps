import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

//sun
const SunGeometry =  new THREE.SphereGeometry(6, 32, 32);
const SunMaterial = new THREE.MeshStandardMaterial({color : 0xffff00, emissive: 0xffff00, emissiveIntensity: 2, roughness : 0.1, metalness : 0});
const Sun = new THREE.Mesh(SunGeometry, SunMaterial);
scene.add(Sun);

//lights
const pointLight = new THREE.PointLight(0xffffff, 2, 0);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

//earth
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0x0000ff })
);
scene.add(earth);

const earthOrbitRadiusX = 15;
const earthOrbitRadiusZ = 10;

//earth orbit
function createOrbitLine(a, b, color) {
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * Math.PI * 2;
    const x = Math.cos(theta) * a;
    const z = Math.sin(theta) * b;
    points.push(new THREE.Vector3(x, 0, z));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, opacity: 0.6, transparent: true });
  return new THREE.LineLoop(geometry, material);
}
scene.add(createOrbitLine(earthOrbitRadiusX, earthOrbitRadiusZ, 0x00ff00));

//Stars
function createStarfield(count){
    const starGeometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i=0; i < count; i++){
        const x = (Math.random() - 0.5) * 800
        const y = (Math.random () - 0.5) * 800
        const z = (Math.random () - 0.5) * 800

        positions.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({color: 0xffffff, size: 0.5});
    const points = new THREE.Points(starGeometry, starMaterial);
    scene.add(points);
}

createStarfield(2000);


let asteroids = [];


async function loadAsteroidData() {
  const res = await fetch(
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=2025-09-25&end_date=2025-09-26&api_key=DEMO_KEY`
  );
  const data = await res.json();

  
  const neos = Object.values(data.near_earth_objects).flat();

  
  asteroids = neos.map((obj) => {
    
    const name = obj.name;
    const hazardous = obj.is_potentially_hazardous_asteroid;
    const diameter =
      (obj.estimated_diameter.kilometers.estimated_diameter_min +
        obj.estimated_diameter.kilometers.estimated_diameter_max) /
      2;
    const velocity = parseFloat(
      obj.close_approach_data[0].relative_velocity.kilometers_per_second
    );
    const missDist = parseFloat(
      obj.close_approach_data[0].miss_distance.kilometers
    );

    
    
    const a = missDist / 100000; 
    const b = a * 0.8;           
    const speed = velocity / 50000; 

    
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(diameter / 100, 16, 16), 
      new THREE.MeshStandardMaterial({
        color: hazardous ? 0x39ff14 : 0x87cefa, 
        emissive: hazardous ? 0x004400 : 0x112244,
      })
    );
    scene.add(mesh);

    
    const orbitLine = createOrbitLine(a, b, hazardous ? 0x39ff14 : 0x87cefa);
    scene.add(orbitLine);

    
    return {
      name,        
      hazardous,   
      diameter,    
      velocity,    
      missDist,    
      orbit: { a, b }, 
      speed,       
      angle: Math.random() * Math.PI * 2, 
      mesh         
    };
  });
}

loadAsteroidData();


const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  //Earth orbit
  const earthSpeed = 0.02;
  earth.position.x = Math.cos(elapsed * earthSpeed) * earthOrbitRadiusX;
  earth.position.z = Math.sin(elapsed * earthSpeed) * earthOrbitRadiusZ;
  earth.rotation.y += 0.05;

  //Asteroids orbit
  asteroids.forEach((ast) => {
    ast.angle += ast.speed; // increment angle
    ast.mesh.position.x = Math.cos(ast.angle) * ast.orbit.a;
    ast.mesh.position.z = Math.sin(ast.angle) * ast.orbit.b;
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});