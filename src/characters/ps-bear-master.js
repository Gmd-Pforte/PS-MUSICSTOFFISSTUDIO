import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const clamp = THREE.MathUtils.clamp;

/**
 * Production PS BÄR wrapper.
 * Expects assets/characters/ps_baer/model/PS_BAER_MASTER.glb
 */
export class PSBearMaster {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'PS_BAER_MASTER_ROOT';
    this.model = null;
    this.mixer = null;
    this.actions = new Map();
    this.activeAction = null;
    this.mode = 'idle';
    this.audioLevel = 0;
    this.morphMeshes = [];
    this.loaded = false;
    this._blinkTimer = 1.8;
    this._blinkPhase = 0;
  }

  async load(url = './assets/characters/ps_baer/model/PS_BAER_MASTER.glb') {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);

    this.model = gltf.scene;
    this.model.name = 'PS_BAER_MASTER';
    this.root.add(this.model);

    this.model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.morphTargetDictionary && node.morphTargetInfluences) {
          this.morphMeshes.push(node);
        }
      }
    });

    // Normalize the imported character to roughly 1.1 m without changing proportions.
    const box = new THREE.Box3().setFromObject(this.model);
    const size = box.getSize(new THREE.Vector3());
    if (size.y > 0.001) {
      const scale = 1.1 / size.y;
      this.model.scale.setScalar(scale);
      box.setFromObject(this.model);
      const center = box.getCenter(new THREE.Vector3());
      this.model.position.x -= center.x;
      this.model.position.z -= center.z;
      this.model.position.y -= box.min.y;
    }

    if (gltf.animations?.length) {
      this.mixer = new THREE.AnimationMixer(this.model);
      for (const clip of gltf.animations) {
        this.actions.set(clip.name, this.mixer.clipAction(clip));
      }
    }

    this.loaded = true;
    this.play('PSB_Idle_01', 0.15, true);
    return this;
  }

  hasAnimation(name) {
    return this.actions.has(name);
  }

  play(name, fade = 0.18, loop = true) {
    if (!this.mixer || !this.actions.has(name)) return false;
    const next = this.actions.get(name);
    next.reset();
    next.enabled = true;
    next.setEffectiveWeight(1);
    next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    next.clampWhenFinished = !loop;
    if (this.activeAction && this.activeAction !== next) {
      this.activeAction.fadeOut(fade);
      next.fadeIn(fade);
    }
    next.play();
    this.activeAction = next;
    return true;
  }

  setMode(mode) {
    this.mode = mode;
    const map = {
      idle: ['PSB_Idle_01', 'PSB_Idle_02'],
      walk: ['PSB_Walk'],
      run: ['PSB_Run'],
      wave: ['PSB_Wave'],
      look: ['PSB_LookAround'],
      happy: ['PSB_Happy'],
      sad: ['PSB_Sad'],
      sit: ['PSB_Sit'],
      surprised: ['PSB_Surprised'],
    };
    const candidates = map[mode] || map.idle;
    const found = candidates.find((name) => this.hasAnimation(name));
    if (found) this.play(found, 0.2, !['wave', 'surprised'].includes(mode));
  }

  setAudioLevel(level) {
    this.audioLevel = clamp(level, 0, 1);
    this.setMorph('viseme_A', this.audioLevel * 0.55);
    this.setMorph('viseme_rest', 1 - this.audioLevel * 0.55);
  }

  setViseme(name, weight = 1) {
    const visemes = ['viseme_A','viseme_E','viseme_I','viseme_O','viseme_U','viseme_MBP','viseme_FV','viseme_L','viseme_WQ','viseme_CH'];
    for (const v of visemes) this.setMorph(v, v === name ? weight : 0);
    this.setMorph('viseme_rest', name ? Math.max(0, 1 - weight) : 1);
  }

  setExpression(name, weight = 1) {
    const expressions = ['mouth_smile','mouth_sad','brow_happy','brow_sad','brow_surprised'];
    for (const e of expressions) this.setMorph(e, e === name ? weight : 0);
  }

  setMorph(name, value) {
    const v = clamp(value, 0, 1);
    for (const mesh of this.morphMeshes) {
      const index = mesh.morphTargetDictionary?.[name];
      if (index !== undefined) mesh.morphTargetInfluences[index] = v;
    }
  }

  update(dt) {
    if (this.mixer) this.mixer.update(dt);
    this._blinkTimer -= dt;
    if (this._blinkTimer <= 0 && this._blinkPhase === 0) this._blinkPhase = 0.001;
    if (this._blinkPhase > 0) {
      this._blinkPhase += dt;
      const p = this._blinkPhase / 0.16;
      const blink = p < 0.5 ? p * 2 : Math.max(0, 2 - p * 2);
      this.setMorph('blink_L', blink);
      this.setMorph('blink_R', blink);
      if (p >= 1) {
        this._blinkPhase = 0;
        this._blinkTimer = 2.4 + Math.random() * 3.0;
        this.setMorph('blink_L', 0);
        this.setMorph('blink_R', 0);
      }
    }
  }
}
