import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PSBear } from './characters/ps-bear.js';
import { AudioLipSync } from './core/audio-lipsync.js';

const stage = document.querySelector('#stage');
const statusText = document.querySelector('#statusText');
const voiceFile = document.querySelector('#voiceFile');
const voiceAudio = document.querySelector('#voiceAudio');
const playVoice = document.querySelector('#playVoice');
const stopVoice = document.querySelector('#stopVoice');
const meterFill = document.querySelector('#meterFill');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070d, .047);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, .1, 100);
camera.position.set(0, 2.75, 7.4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
stage.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.95, 0);
controls.enableDamping = true;
controls.dampingFactor = .06;
controls.minDistance = 4.7;
controls.maxDistance = 10;
controls.minPolarAngle = Math.PI * .22;
controls.maxPolarAngle = Math.PI * .61;
controls.enablePan = false;
controls.update();

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(7, 96),
  new THREE.MeshPhysicalMaterial({ color: 0x070a10, roughness: .26, metalness: .42, clearcoat: .18, clearcoatRoughness: .28 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -.13;
floor.receiveShadow = true;
scene.add(floor);

function ring(radius, color, opacity) {
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(radius - .022, radius + .022, 128),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, toneMapped: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -.112;
  scene.add(mesh);
}
ring(1.55, 0xff4fd2, .52);
ring(2.45, 0x45e7ff, .42);
ring(3.62, 0x735dff, .25);

scene.add(new THREE.HemisphereLight(0xcfe2ff, 0x201109, 1.25));
const key = new THREE.SpotLight(0xffffff, 115, 18, Math.PI/5.6, .48, 1.2);
key.position.set(2.8, 6.4, 5.3);
key.target.position.set(0, 1.9, 0);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key, key.target);

const cyan = new THREE.PointLight(0x39e9ff, 28, 8.5, 2);
cyan.position.set(3.4, 3.25, 1.5);
scene.add(cyan);
const pink = new THREE.PointLight(0xff35c8, 24, 8.5, 2);
pink.position.set(-3.2, 2.6, 2.0);
scene.add(pink);
const violet = new THREE.PointLight(0x6655ff, 18, 10, 2);
violet.position.set(0, 3.2, -4.5);
scene.add(violet);

const psBear = new PSBear();
scene.add(psBear.root);

function makeNote(text, color, position, scale=.58) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 192;
  const ctx = canvas.getContext('2d');
  ctx.font = '130px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = 30;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.fillText(text, 96, 102);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }));
  sprite.position.copy(position);
  sprite.scale.setScalar(scale);
  scene.add(sprite);
  return sprite;
}
const notes = [
  makeNote('♪','#5be7ff',new THREE.Vector3(-2.9,3.2,-.9),.68),
  makeNote('♫','#ff58d6',new THREE.Vector3(2.7,2.7,-1.5),.76),
  makeNote('♪','#9a79ff',new THREE.Vector3(-2.1,1.3,-2.0),.54),
  makeNote('♫','#56e9ff',new THREE.Vector3(3.1,1.22,-.2),.56),
];

const actionButtons = [...document.querySelectorAll('[data-action]')];
actionButtons.forEach(button => {
  button.addEventListener('click', () => {
    psBear.setMode(button.dataset.action);
    actionButtons.forEach(b => b.classList.toggle('active', b === button));
    statusText.textContent = `PS BÄR · ${button.querySelector('span').textContent}`;
  });
});

const lipSync = new AudioLipSync(voiceAudio, level => {
  psBear.setAudioLevel(level);
  meterFill.style.width = `${Math.round(level * 100)}%`;
});
let audioUrl = null;

voiceFile.addEventListener('change', () => {
  const file = voiceFile.files?.[0];
  if (!file) return;
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl = URL.createObjectURL(file);
  voiceAudio.src = audioUrl;
  playVoice.disabled = false;
  stopVoice.disabled = false;
  statusText.textContent = `Sprachclip geladen · ${file.name}`;
});

playVoice.addEventListener('click', async () => {
  try {
    await lipSync.play();
    statusText.textContent = 'PS BÄR spricht';
  } catch (error) {
    console.error(error);
    statusText.textContent = 'Audio konnte nicht gestartet werden';
  }
});

stopVoice.addEventListener('click', () => {
  lipSync.stop();
  statusText.textContent = 'Bereit';
});

voiceAudio.addEventListener('ended', () => {
  psBear.setAudioLevel(0);
  meterFill.style.width = '0%';
  statusText.textContent = 'Bereit';
});

const clock = new THREE.Clock();
let elapsed = 0;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .05);
  elapsed += dt;
  psBear.update(elapsed, dt);

  notes.forEach((note, i) => {
    note.position.y += Math.sin(elapsed*1.15 + i) * .0009;
    note.material.rotation = Math.sin(elapsed*.42 + i) * .08;
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
