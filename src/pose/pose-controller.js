import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;

const LIMITS = {
  head: {
    x: [-0.45, 0.45],
    y: [-0.75, 0.75],
    z: [-0.35, 0.35],
  },
  torso: {
    x: [-0.28, 0.28],
    y: [-0.48, 0.48],
    z: [-0.32, 0.32],
  },
  leftArm: {
    x: [-1.65, 1.45],
    y: [-0.55, 0.55],
    z: [-0.35, 2.75],
  },
  rightArm: {
    x: [-1.65, 1.45],
    y: [-0.55, 0.55],
    z: [-2.75, 0.35],
  },
  leftLeg: {
    x: [-0.90, 0.90],
    y: [-0.35, 0.35],
    z: [-0.45, 0.55],
  },
  rightLeg: {
    x: [-0.90, 0.90],
    y: [-0.35, 0.35],
    z: [-0.55, 0.45],
  },
};

const LABELS = {
  head: 'Kopf',
  torso: 'Körper',
  leftArm: 'Arm links',
  rightArm: 'Arm rechts',
  leftLeg: 'Bein links',
  rightLeg: 'Bein rechts',
};

export class PoseController {
  constructor(character, camera, domElement, orbitControls, {
    storageKey = 'stoffis.ps_baer.pose.v1',
    onChange = null,
    onSelect = null,
  } = {}) {
    this.character = character;
    this.camera = camera;
    this.domElement = domElement;
    this.orbitControls = orbitControls;
    this.storageKey = storageKey;
    this.onChange = onChange;
    this.onSelect = onSelect;
    this.enabled = false;
    this.selected = 'head';
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.dragging = false;
    this.pointerId = null;
    this.lastPointer = { x: 0, y: 0 };

    this.parts = {
      head: character?.head,
      torso: character?.torso,
      leftArm: character?.leftArm,
      rightArm: character?.rightArm,
      leftLeg: character?.leftLeg,
      rightLeg: character?.rightLeg,
    };

    this.enabledForCharacter = Object.values(this.parts).every(Boolean);
    this.base = {};
    this.values = {};

    Object.entries(this.parts).forEach(([name, object]) => {
      if (!object) return;
      this.base[name] = object.rotation.clone();
      this.values[name] = { x: 0, y: 0, z: 0 };
    });

    this.helper = new THREE.BoxHelper(character.root, 0x5be7ff);
    this.helper.visible = false;
    character.root.parent?.add(this.helper);

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);

    domElement.addEventListener('pointerdown', this._onPointerDown, { passive: false });
    domElement.addEventListener('pointermove', this._onPointerMove, { passive: false });
    domElement.addEventListener('pointerup', this._onPointerUp, { passive: false });
    domElement.addEventListener('pointercancel', this._onPointerUp, { passive: false });
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled && this.enabledForCharacter);
    if (this.orbitControls) this.orbitControls.enabled = !this.enabled;
    this.dragging = false;
    this.pointerId = null;
    this.helper.visible = this.enabled;
    if (this.enabled) {
      this.apply();
      this.select(this.selected);
    }
  }

  get label() {
    return LABELS[this.selected] ?? this.selected;
  }

  select(name) {
    if (!this.parts[name]) return false;
    this.selected = name;
    this._updateHelper();
    this.onSelect?.(name, this.getSelectedValues());
    return true;
  }

  getSelectedValues() {
    return { ...(this.values[this.selected] ?? { x: 0, y: 0, z: 0 }) };
  }

  setAxis(axis, value) {
    const values = this.values[this.selected];
    if (!values || !['x', 'y', 'z'].includes(axis)) return;
    const [min, max] = LIMITS[this.selected]?.[axis] ?? [-Math.PI, Math.PI];
    values[axis] = clamp(Number(value) || 0, min, max);
    this.apply();
    this.onChange?.(this.selected, this.getSelectedValues());
  }

  nudge(dx, dy) {
    const values = this.values[this.selected];
    if (!values) return;

    if (this.selected === 'head') {
      this.setAxis('y', values.y + dx * 0.008);
      this.setAxis('x', values.x + dy * 0.006);
      return;
    }

    if (this.selected === 'torso') {
      this.setAxis('y', values.y + dx * 0.005);
      this.setAxis('z', values.z - dy * 0.004);
      return;
    }

    this.setAxis('z', values.z + dx * 0.009);
    this.setAxis('x', values.x + dy * 0.007);
  }

  apply() {
    if (!this.enabledForCharacter) return;
    Object.entries(this.values).forEach(([name, values]) => {
      const object = this.parts[name];
      const base = this.base[name];
      if (!object || !base) return;
      object.rotation.set(
        base.x + values.x,
        base.y + values.y,
        base.z + values.z,
        base.order,
      );
    });
    this._updateHelper();
  }

  resetSelected() {
    if (!this.values[this.selected]) return;
    this.values[this.selected] = { x: 0, y: 0, z: 0 };
    this.apply();
    this.onChange?.(this.selected, this.getSelectedValues());
  }

  resetAll() {
    Object.keys(this.values).forEach((name) => {
      this.values[name] = { x: 0, y: 0, z: 0 };
    });
    this.apply();
    localStorage.removeItem(this.storageKey);
    this.onChange?.(this.selected, this.getSelectedValues());
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify({
      version: 1,
      selected: this.selected,
      values: this.values,
    }));
  }

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey) || 'null');
      if (!saved?.values) return false;
      Object.keys(this.values).forEach((name) => {
        const stored = saved.values[name];
        if (!stored) return;
        ['x', 'y', 'z'].forEach((axis) => {
          const value = Number(stored[axis]);
          if (!Number.isFinite(value)) return;
          const [min, max] = LIMITS[name]?.[axis] ?? [-Math.PI, Math.PI];
          this.values[name][axis] = clamp(value, min, max);
        });
      });
      if (saved.selected && this.parts[saved.selected]) this.selected = saved.selected;
      return true;
    } catch {
      return false;
    }
  }

  _pick(clientX, clientY) {
    const rect = this.domElement.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObject(this.character.root, true);
    for (const hit of hits) {
      let node = hit.object;
      while (node && node !== this.character.root) {
        for (const [name, root] of Object.entries(this.parts)) {
          if (node === root) return name;
        }
        node = node.parent;
      }
    }
    return null;
  }

  _onPointerDown(event) {
    if (!this.enabled || event.pointerType === 'touch' && !event.isPrimary) return;
    const picked = this._pick(event.clientX, event.clientY);
    if (!picked) return;
    event.preventDefault();
    this.select(picked);
    this.dragging = true;
    this.pointerId = event.pointerId;
    this.lastPointer.x = event.clientX;
    this.lastPointer.y = event.clientY;
    this.domElement.setPointerCapture?.(event.pointerId);
  }

  _onPointerMove(event) {
    if (!this.enabled || !this.dragging || event.pointerId !== this.pointerId) return;
    event.preventDefault();
    const dx = event.clientX - this.lastPointer.x;
    const dy = event.clientY - this.lastPointer.y;
    this.lastPointer.x = event.clientX;
    this.lastPointer.y = event.clientY;
    this.nudge(dx, dy);
  }

  _onPointerUp(event) {
    if (!this.dragging || event.pointerId !== this.pointerId) return;
    this.dragging = false;
    this.pointerId = null;
    try { this.domElement.releasePointerCapture?.(event.pointerId); } catch {}
  }

  _updateHelper() {
    if (!this.helper || !this.enabled) return;
    const object = this.parts[this.selected];
    if (!object) return;
    this.helper.setFromObject(object);
    this.helper.visible = true;
  }
}
