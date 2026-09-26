import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PSBear } from './characters/ps-bear.js';
import { PSBearMaster } from './characters/ps-bear-master.js';
import { AudioLipSync } from './core/audio-lipsync.js';

const stage = document.querySelector('#stage');
const statusText = document.querySelector('#statusText');
const voiceFile = document.querySelector('#voiceFile');
const voiceAudio = document.querySelector('#voiceAudio');
const playVoice = document.querySelector('#playVoice');
const stopVoice = document.querySelector('#stopVoice');
const meterFill = document.querySelector('#meterFill');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x06080f, 0.040);

const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
stage.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minPolarAngle = Math.PI * 0.20;
controls.maxPolarAngle = Math.PI * 0.60;

function updateCameraForViewport() {
  const portrait = innerHeight > innerWidth;
  camera.aspect = innerWidth / innerHeight;
  camera.fov = portrait ? 32 : 34;
  camera.updateProjectionMatrix();
  controls.target.set(0, portrait ? 1.15 : 1.10, 0);
  controls.minDistance = portrait ? 2.25 : 1.9;
  controls.maxDistance = portrait ? 5.5 : 5.0;
  camera.position.set(0, portrait ? 1.35 : 1.35, portrait ? 3.35 : 2.85);
  controls.update();
}
updateCameraForViewport();

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(5.2, 96),
  new THREE.MeshPhysicalMaterial({ color: 0x070a11, roughness: 0.34, metalness: 0.34, clearcoat: 0.14, clearcoatRoughness: 0.35 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.02;
floor.receiveShadow = true;
scene.add(floor);

function ring(radius, color, opacity) {
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(radius - 0.012, radius + 0.012, 128),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, toneMapped: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.015;
  scene.add(mesh);
}
ring(0.85, 0xff4fd2, 0.42);
ring(1.25, 0x45e7ff, 0.35);
ring(1.75, 0x735dff, 0.18);

scene.add(new THREE.HemisphereLight(0xd9e7ff, 0x1b110b, 1.35));
const key = new THREE.SpotLight(0xffffff, 45, 9, Math.PI / 5.5, 0.45, 1.15);
key.position.set(1.5, 3.5, 3.1);
key.target.position.set(0, 1.0, 0.1);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key, key.target);

const fill = new THREE.DirectionalLight(0xe7f0ff, 1.2);
fill.position.set(-1.6, 2.4, 2.8);
scene.add(fill);

const cyan = new THREE.PointLight(0x35dbff, 5, 5, 2.2);
cyan.position.set(2.0, 1.5, 1.2);
scene.add(cyan);
const pink = new THREE.PointLight(0xff4ccd, 4, 5, 2.3);
pink.position.set(-1.8, 1.3, 1.2);
scene.add(pink);
const back = new THREE.PointLight(0x6d61ff, 3, 6, 2.2);
back.position.set(0.0, 1.8, -2.5);
scene.add(back);

// Character 01 — production GLB first, old procedural model only as fallback.
let psBear;
let usingMaster = false;
try {
  const master = new PSBearMaster();
  await master.load('./assets/characters/ps_baer/model/PS_BAER_MASTER.glb');
  scene.add(master.root);
  psBear = master;
  usingMaster = true;
  statusText.textContent = 'PS BÄR MASTER geladen';
} catch (error) {
  console.warn('PS_BAER_MASTER.glb noch nicht vorhanden — technischer Fallback aktiv.', error);
  const fallback = new PSBear();
  fallback.root.scale.setScalar(0.45);
  fallback.root.position.y = 0.02;
  scene.add(fallback.root);
  psBear = fallback;
  statusText.textContent = 'PS BÄR · Preview bis MASTER.glb fertig ist';
}

function makeNote(text, color, position, scale = 0.30) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 192;
  const ctx = canvas.getContext('2d');
  ctx.font = '130px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = 28;
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
  makeNote('♪', '#5be7ff', new THREE.Vector3(-1.6, 1.75, -0.6), 0.34),
  makeNote('♫', '#ff58d6', new THREE.Vector3(1.5, 1.45, -0.8), 0.38),
  makeNote('♪', '#9a79ff', new THREE.Vector3(-1.2, 0.75, -1.1), 0.28),
  makeNote('♫', '#56e9ff', new THREE.Vector3(1.7, 0.70, -0.15), 0.30),
];

const actionButtons = [...document.querySelectorAll('[data-action]')];
actionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    psBear.setMode(button.dataset.action);
    actionButtons.forEach((b) => b.classList.toggle('active', b === button));
    statusText.textContent = `PS BÄR · ${button.querySelector('span').textContent}`;
  });
});

const lipSync = new AudioLipSync(voiceAudio, (level) => {
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
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  if (usingMaster) psBear.update(dt);
  else psBear.update(elapsed, dt);

  notes.forEach((note, i) => {
    note.position.y += Math.sin(elapsed * 1.1 + i) * 0.0004;
    note.material.rotation = Math.sin(elapsed * 0.38 + i) * 0.08;
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  updateCameraForViewport();
});
