import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PSBear } from './characters/ps-bear.js';
import { PSBearMaster } from './characters/ps-bear-master.js';
import { StoffiBuilder } from './builder/stoffi-builder.js';
import { PoseController } from './pose/pose-controller.js';
import { AudioLipSync } from './core/audio-lipsync.js';

const stage = document.querySelector('#stage');
const statusText = document.querySelector('#statusText');
const voiceFile = document.querySelector('#voiceFile');
const voiceAudio = document.querySelector('#voiceAudio');
const playVoice = document.querySelector('#playVoice');
const stopVoice = document.querySelector('#stopVoice');
const meterFill = document.querySelector('#meterFill');

const builderToggle = document.querySelector('#builderToggle');
const builderPanel = document.querySelector('#builderPanel');
const builderClose = document.querySelector('#builderClose');
const builderSave = document.querySelector('#builderSave');
const builderReset = document.querySelector('#builderReset');
const builderInputs = [...document.querySelectorAll('[data-build]')];
const partToggles = [...document.querySelectorAll('[data-part-toggle]')];
const colorSwatches = [...document.querySelectorAll('[data-color-target]')];
const facePresetButtons = [...document.querySelectorAll('[data-face-preset]')];
const facePresetLabel = document.querySelector('#facePresetLabel');

const poseToggle = document.querySelector('#poseToggle');
const posePanel = document.querySelector('#posePanel');
const poseClose = document.querySelector('#poseClose');
const poseDone = document.querySelector('#poseDone');
const poseSave = document.querySelector('#poseSave');
const poseResetSelected = document.querySelector('#poseResetSelected');
const poseResetAll = document.querySelector('#poseResetAll');
const poseInputs = [...document.querySelectorAll('[data-pose-axis]')];
const posePartButtons = [...document.querySelectorAll('[data-pose-part]')];
const poseSelectedLabel = document.querySelector('#poseSelectedLabel');

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

let psBear;
let usingMaster = false;
let builder = null;
let pose = null;

try {
  const master = new PSBearMaster();
  await master.load('./assets/characters/ps_baer/model/PS_BAER_MASTER.glb');
  scene.add(master.root);
  psBear = master;
  usingMaster = true;
  statusText.textContent = 'PS BÄR MASTER geladen';
  builderToggle.disabled = true;
  builderToggle.textContent = '🧩 Bausatz · Morphs folgen';
  poseToggle.disabled = true;
  poseToggle.textContent = '🦴 Pose · Rig folgt';
} catch (error) {
  console.warn('PS_BAER_MASTER.glb noch nicht vorhanden — modularer PS-BÄR-Bausatz aktiv.', error);
  const kit = new PSBear();
  kit.root.scale.setScalar(0.45);
  kit.root.position.y = 0.02;
  scene.add(kit.root);
  psBear = kit;

  builder = new StoffiBuilder(kit);
  builder.load();

  pose = new PoseController(kit, camera, renderer.domElement, controls, {
    onSelect: () => {
      syncPoseUi();
      statusText.textContent = `PS BÄR · ${pose.label} ausgewählt`;
    },
    onChange: () => {
      syncPoseUi();
      statusText.textContent = `PS BÄR · ${pose.label} bewegen`;
    },
  });
  pose.load();
  statusText.textContent = 'PS BÄR · Bausatz & Pose bereit';
}

function formatBuilderValue(input, value) {
  if (input.dataset.format === 'degree') return `${Math.round(value * 180 / Math.PI)}°`;
  return `${Math.round(value * 100)}%`;
}

function syncBuilderUi() {
  if (!builder) return;

  builderInputs.forEach((input) => {
    const value = builder.values[input.dataset.build] ?? Number(input.value) ?? 1;
    input.value = String(value);
    const output = input.parentElement?.querySelector('output');
    if (output) output.textContent = formatBuilderValue(input, value);
  });

  partToggles.forEach((button) => {
    const active = Boolean(builder.parts[button.dataset.partToggle]);
    button.classList.toggle('active', active);
    button.textContent = active ? 'AN' : 'AUS';
  });

  colorSwatches.forEach((button) => {
    const target = button.dataset.colorTarget;
    const active = builder.colors[target]?.toLowerCase() === button.dataset.color?.toLowerCase();
    button.classList.toggle('active', active);
  });

  facePresetButtons.forEach((button) => {
    button.classList.toggle('active', builder.facePreset === button.dataset.facePreset);
  });
  if (facePresetLabel) {
    const labels = { original: 'PS Original', soft: 'Weicher', curious: 'Neugierig', custom: 'Eigene Form' };
    facePresetLabel.textContent = labels[builder.facePreset] ?? 'Eigene Form';
  }
}

function syncPoseUi() {
  if (!pose) return;
  const values = pose.getSelectedValues();
  const labels = {
    head: 'Kopf', torso: 'Körper', leftArm: 'Arm links', rightArm: 'Arm rechts', leftLeg: 'Bein links', rightLeg: 'Bein rechts'
  };
  if (poseSelectedLabel) poseSelectedLabel.textContent = labels[pose.selected] ?? pose.selected;

  posePartButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.posePart === pose.selected);
  });

  poseInputs.forEach((input) => {
    const radians = values[input.dataset.poseAxis] ?? 0;
    const degrees = Math.round(THREE.MathUtils.radToDeg(radians));
    input.value = String(degrees);
    const output = input.parentElement?.querySelector('output');
    if (output) output.textContent = `${degrees}°`;
  });
}

syncBuilderUi();
syncPoseUi();

function setPoseOpen(open) {
  if (!pose) return;
  const next = Boolean(open);
  posePanel.classList.toggle('open', next);
  pose.setEnabled(next);
  if (next) {
    builderPanel.classList.remove('open');
    psBear.setMode('idle');
    syncPoseUi();
    statusText.textContent = `PS BÄR · Pose-Modus · ${pose.label}`;
  } else {
    statusText.textContent = 'PS BÄR · Bereit';
  }
}

function setBuilderOpen(open) {
  const next = Boolean(open);
  builderPanel.classList.toggle('open', next);
  if (next) {
    if (pose?.enabled) setPoseOpen(false);
    statusText.textContent = builder ? 'PS BÄR · Bauteile bearbeiten' : 'Bausatz für MASTER-Modell folgt';
  }
}

builderToggle.addEventListener('click', () => setBuilderOpen(!builderPanel.classList.contains('open')));
builderClose.addEventListener('click', () => setBuilderOpen(false));
poseToggle.addEventListener('click', () => setPoseOpen(!posePanel.classList.contains('open')));
poseClose.addEventListener('click', () => setPoseOpen(false));
poseDone.addEventListener('click', () => {
  pose?.save();
  setPoseOpen(false);
  statusText.textContent = 'PS BÄR · Pose gespeichert';
});

builderInputs.forEach((input) => {
  input.addEventListener('input', () => {
    if (!builder) return;
    builder.set(input.dataset.build, input.value);
    const output = input.parentElement?.querySelector('output');
    if (output) output.textContent = formatBuilderValue(input, Number(input.value));
    syncBuilderUi();
    statusText.textContent = `PS BÄR · ${input.parentElement?.querySelector('span')?.textContent ?? 'Bausatz'}`;
  });
});

facePresetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!builder) return;
    builder.applyFacePreset(button.dataset.facePreset);
    syncBuilderUi();
    statusText.textContent = `PS BÄR · Gesicht ${button.textContent}`;
  });
});

partToggles.forEach((button) => {
  button.addEventListener('click', () => {
    if (!builder) return;
    const part = button.dataset.partToggle;
    const visible = builder.togglePart(part);
    syncBuilderUi();
    statusText.textContent = `PS BÄR · ${part} ${visible ? 'an' : 'aus'}`;
  });
});

colorSwatches.forEach((button) => {
  button.addEventListener('click', () => {
    if (!builder) return;
    const target = button.dataset.colorTarget;
    builder.setColor(target, button.dataset.color);
    syncBuilderUi();
    statusText.textContent = `PS BÄR · ${target} Farbe geändert`;
  });
});

builderSave.addEventListener('click', () => {
  if (!builder) return;
  builder.save();
  pose?.save();
  statusText.textContent = 'PS BÄR · Stoffi gespeichert';
});

builderReset.addEventListener('click', () => {
  if (!builder) return;
  builder.reset();
  pose?.resetAll();
  syncBuilderUi();
  syncPoseUi();
  statusText.textContent = 'PS BÄR · Original wiederhergestellt';
});

posePartButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!pose) return;
    pose.select(button.dataset.posePart);
    syncPoseUi();
  });
});

poseInputs.forEach((input) => {
  input.addEventListener('input', () => {
    if (!pose) return;
    const radians = THREE.MathUtils.degToRad(Number(input.value));
    pose.setAxis(input.dataset.poseAxis, radians);
    syncPoseUi();
  });
});

poseSave.addEventListener('click', () => {
  if (!pose) return;
  pose.save();
  statusText.textContent = 'PS BÄR · Pose gespeichert';
});

poseResetSelected.addEventListener('click', () => {
  if (!pose) return;
  pose.resetSelected();
  syncPoseUi();
  statusText.textContent = `PS BÄR · ${pose.label} zurückgesetzt`;
});

poseResetAll.addEventListener('click', () => {
  if (!pose) return;
  pose.resetAll();
  syncPoseUi();
  statusText.textContent = 'PS BÄR · Pose zurückgesetzt';
});

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
    if (pose?.enabled) setPoseOpen(false);
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

  builder?.apply();
  if (pose?.enabled) pose.apply();

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
