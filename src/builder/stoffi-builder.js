import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;

const LIMITS = {
  headWidth: [0.75, 1.28],
  headHeight: [0.78, 1.24],
  muzzleSize: [0.72, 1.28],
  earSize: [0.72, 1.28],
  eyeSize: [0.72, 1.22],
  eyeSpacing: [0.78, 1.22],
  bodyWidth: [0.75, 1.28],
  bodyHeight: [0.82, 1.20],
  armLength: [0.75, 1.25],
  legLength: [0.75, 1.25],
  pawSize: [0.78, 1.25],
  capScale: [0.82, 1.18],
  capTilt: [-0.24, 0.24],
  glassesScale: [0.82, 1.20],
  glassesWidth: [0.86, 1.18],
  hoodieFit: [0.90, 1.12],
};

const FACE_PRESETS = {
  original: { headWidth: 1, headHeight: 1, muzzleSize: 1, eyeSize: 1, eyeSpacing: 1 },
  soft: { headWidth: 1.04, headHeight: 0.99, muzzleSize: 0.94, eyeSize: 0.95, eyeSpacing: 1.02 },
  curious: { headWidth: 1.01, headHeight: 1.01, muzzleSize: 0.91, eyeSize: 1.08, eyeSpacing: 1.03 },
};

export class StoffiBuilder {
  constructor(character, { storageKey = 'stoffis.ps_baer.builder.v2' } = {}) {
    this.character = character;
    this.storageKey = storageKey;
    this.enabled = Boolean(character?.head && character?.torso);
    this.defaults = {
      headWidth: 1,
      headHeight: 1,
      muzzleSize: 1,
      earSize: 1,
      eyeSize: 1,
      eyeSpacing: 1,
      bodyWidth: 1,
      bodyHeight: 1,
      armLength: 1,
      legLength: 1,
      pawSize: 1,
      capScale: 1,
      capTilt: 0,
      glassesScale: 1,
      glassesWidth: 1,
      hoodieFit: 1,
    };
    this.values = { ...this.defaults };
    this.parts = { cap: true, glasses: true, hoodie: true, logo: true };
    this.colors = { hoodie: '#090a0d', cap: '#11131a', glasses: '#040405' };
    this.facePreset = 'original';
    this.base = this.enabled ? this._captureBase() : null;
  }

  _captureBase() {
    const c = this.character;
    return {
      headScale: c.head.scale.clone(),
      muzzleScale: c.muzzleGroup?.scale.clone(),
      eyeLScale: c.eyeL?.scale.clone(),
      eyeRScale: c.eyeR?.scale.clone(),
      eyeLPos: c.eyeL?.position.clone(),
      eyeRPos: c.eyeR?.position.clone(),
      torsoScale: c.torso.scale.clone(),
      leftArmScale: c.leftArm?.scale.clone(),
      rightArmScale: c.rightArm?.scale.clone(),
      leftLegScale: c.leftLeg?.scale.clone(),
      rightLegScale: c.rightLeg?.scale.clone(),
      leftPawScale: c.leftPaw?.scale.clone(),
      rightPawScale: c.rightPaw?.scale.clone(),
      earLScale: c.earL?.scale.clone(),
      earRScale: c.earR?.scale.clone(),
      earLPos: c.earL?.position.clone(),
      earRPos: c.earR?.position.clone(),
      capScale: c.capGroup?.scale.clone(),
      capRotation: c.capGroup?.rotation.clone(),
      glassesScale: c.glassesGroup?.scale.clone(),
      hoodieScale: c.hoodieGroup?.scale.clone(),
    };
  }

  set(name, rawValue) {
    if (!(name in this.values)) return;
    const [min, max] = LIMITS[name] ?? [0.65, 1.45];
    const parsed = Number(rawValue);
    this.values[name] = clamp(Number.isFinite(parsed) ? parsed : this.defaults[name], min, max);
    this.facePreset = 'custom';
    this.apply();
  }

  setPart(name, visible) {
    if (!(name in this.parts)) return;
    this.parts[name] = Boolean(visible);
    this.applyParts();
  }

  togglePart(name) {
    if (!(name in this.parts)) return false;
    this.parts[name] = !this.parts[name];
    this.applyParts();
    return this.parts[name];
  }

  setColor(name, color) {
    if (!(name in this.colors)) return;
    this.colors[name] = color;
    this.character?.setPartColor?.(name, color);
  }

  applyFacePreset(name) {
    const preset = FACE_PRESETS[name];
    if (!preset) return;
    Object.assign(this.values, preset);
    this.facePreset = name;
    this.apply();
  }

  applyParts() {
    Object.entries(this.parts).forEach(([name, visible]) => {
      this.character?.setPartVisible?.(name, visible);
    });
    Object.entries(this.colors).forEach(([name, color]) => {
      this.character?.setPartColor?.(name, color);
    });
  }

  apply() {
    if (!this.enabled || !this.base) return;
    const c = this.character;
    const v = this.values;

    c.head.scale.set(
      this.base.headScale.x * v.headWidth,
      this.base.headScale.y * v.headHeight,
      this.base.headScale.z * ((v.headWidth + v.headHeight) * 0.5)
    );

    if (c.muzzleGroup && this.base.muzzleScale) {
      c.muzzleGroup.scale.copy(this.base.muzzleScale).multiplyScalar(v.muzzleSize);
    }

    if (c.eyeL && c.eyeR && this.base.eyeLScale && this.base.eyeRScale) {
      c.eyeL.scale.copy(this.base.eyeLScale).multiplyScalar(v.eyeSize);
      c.eyeR.scale.copy(this.base.eyeRScale).multiplyScalar(v.eyeSize);
      c.eyeL.position.x = this.base.eyeLPos.x * v.eyeSpacing;
      c.eyeR.position.x = this.base.eyeRPos.x * v.eyeSpacing;
    }

    c.torso.scale.set(
      this.base.torsoScale.x * v.bodyWidth,
      this.base.torsoScale.y * v.bodyHeight,
      this.base.torsoScale.z * v.bodyWidth
    );

    if (c.leftArm && c.rightArm) {
      c.leftArm.scale.set(this.base.leftArmScale.x, this.base.leftArmScale.y * v.armLength, this.base.leftArmScale.z);
      c.rightArm.scale.set(this.base.rightArmScale.x, this.base.rightArmScale.y * v.armLength, this.base.rightArmScale.z);
    }

    if (c.leftLeg && c.rightLeg) {
      c.leftLeg.scale.set(this.base.leftLegScale.x, this.base.leftLegScale.y * v.legLength, this.base.leftLegScale.z);
      c.rightLeg.scale.set(this.base.rightLegScale.x, this.base.rightLegScale.y * v.legLength, this.base.rightLegScale.z);
    }

    if (c.leftPaw && c.rightPaw && this.base.leftPawScale && this.base.rightPawScale) {
      c.leftPaw.scale.copy(this.base.leftPawScale).multiplyScalar(v.pawSize);
      c.rightPaw.scale.copy(this.base.rightPawScale).multiplyScalar(v.pawSize);
    }

    if (c.earL && c.earR && this.base.earLScale && this.base.earRScale) {
      c.earL.scale.copy(this.base.earLScale).multiplyScalar(v.earSize);
      c.earR.scale.copy(this.base.earRScale).multiplyScalar(v.earSize);
      c.earL.position.x = this.base.earLPos.x * v.earSize;
      c.earR.position.x = this.base.earRPos.x * v.earSize;
    }

    if (c.capGroup && this.base.capScale && this.base.capRotation) {
      c.capGroup.scale.copy(this.base.capScale).multiplyScalar(v.capScale);
      c.capGroup.rotation.copy(this.base.capRotation);
      c.capGroup.rotation.z += v.capTilt;
    }

    if (c.glassesGroup && this.base.glassesScale) {
      c.glassesGroup.scale.set(
        this.base.glassesScale.x * v.glassesScale * v.glassesWidth,
        this.base.glassesScale.y * v.glassesScale,
        this.base.glassesScale.z * v.glassesScale
      );
    }

    if (c.hoodieGroup && this.base.hoodieScale) {
      c.hoodieGroup.scale.copy(this.base.hoodieScale).multiplyScalar(v.hoodieFit);
    }

    this.applyParts();
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify({
      version: 2,
      values: this.values,
      parts: this.parts,
      colors: this.colors,
      facePreset: this.facePreset,
    }));
  }

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey) || 'null');
      if (!saved) return false;
      const storedValues = saved.values ?? saved;
      Object.keys(this.values).forEach((key) => {
        const value = Number(storedValues[key]);
        if (Number.isFinite(value)) {
          const [min, max] = LIMITS[key] ?? [0.65, 1.45];
          this.values[key] = clamp(value, min, max);
        }
      });
      if (saved.parts) Object.assign(this.parts, saved.parts);
      if (saved.colors) Object.assign(this.colors, saved.colors);
      if (typeof saved.facePreset === 'string') this.facePreset = saved.facePreset;
      this.apply();
      return true;
    } catch {
      return false;
    }
  }

  reset() {
    this.values = { ...this.defaults };
    this.parts = { cap: true, glasses: true, hoodie: true, logo: true };
    this.colors = { hoodie: '#090a0d', cap: '#11131a', glasses: '#040405' };
    this.facePreset = 'original';
    this.apply();
    localStorage.removeItem(this.storageKey);
  }
}
