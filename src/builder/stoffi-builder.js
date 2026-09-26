import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;

export class StoffiBuilder {
  constructor(character, { storageKey = 'stoffis.ps_baer.builder.v1' } = {}) {
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
    };
    this.values = { ...this.defaults };
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
      ears: c.head?.children?.filter((obj) => obj.name?.startsWith('BUILDER_EAR_')) ?? [],
    };
  }

  set(name, rawValue) {
    if (!(name in this.values)) return;
    this.values[name] = clamp(Number(rawValue) || 1, 0.65, 1.45);
    this.apply();
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

    this.base.ears.forEach((ear) => ear.scale.setScalar(v.earSize));
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.values));
  }

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey) || 'null');
      if (!saved) return false;
      Object.keys(this.values).forEach((key) => {
        if (Number.isFinite(Number(saved[key]))) this.values[key] = clamp(Number(saved[key]), 0.65, 1.45);
      });
      this.apply();
      return true;
    } catch {
      return false;
    }
  }

  reset() {
    this.values = { ...this.defaults };
    this.apply();
    localStorage.removeItem(this.storageKey);
  }
}
