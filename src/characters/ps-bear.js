import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;

function physical(color, roughness = .78, metalness = 0, extra = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    clearcoat: extra.clearcoat ?? 0,
    clearcoatRoughness: extra.clearcoatRoughness ?? .5,
    sheen: extra.sheen ?? 0,
    sheenRoughness: extra.sheenRoughness ?? .7,
    sheenColor: new THREE.Color(extra.sheenColor ?? color),
    emissive: new THREE.Color(extra.emissive ?? 0x000000),
    emissiveIntensity: extra.emissiveIntensity ?? 0,
  });
}

function enableShadows(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function sphere(material, scale, position = [0,0,0], segments = 40) {
  const mesh = enableShadows(new THREE.Mesh(new THREE.SphereGeometry(1, segments, Math.floor(segments / 2)), material));
  mesh.scale.set(...scale);
  mesh.position.set(...position);
  return mesh;
}

function box(material, size, position = [0,0,0]) {
  const geometry = new THREE.BoxGeometry(...size, 2, 2, 2);
  const mesh = enableShadows(new THREE.Mesh(geometry, material));
  mesh.position.set(...position);
  return mesh;
}

function cylinder(material, radiusTop, radiusBottom, height, position=[0,0,0], radial=32) {
  const mesh = enableShadows(new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial), material));
  mesh.position.set(...position);
  return mesh;
}

function makeLogoTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(100, 70, 650, 400);
  gradient.addColorStop(0, '#ff57d8');
  gradient.addColorStop(.48, '#986dff');
  gradient.addColorStop(1, '#4be8ff');
  ctx.strokeStyle = gradient;
  ctx.fillStyle = gradient;
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.arc(384, 210, 98, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(302, 140, 36, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(466, 140, 36, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(316, 183); ctx.quadraticCurveTo(384, 116, 452, 183); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(340, 172); ctx.quadraticCurveTo(386, 149, 430, 172); ctx.stroke();
  ctx.beginPath(); ctx.arc(384, 230, 38, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(369, 218); ctx.lineTo(384, 233); ctx.lineTo(399, 218); ctx.stroke();

  const heights = [54, 80, 112, 148, 110, 76];
  heights.forEach((h, i) => {
    const x = 135 + i * 31;
    ctx.beginPath(); ctx.moveTo(x, 213 - h / 2); ctx.lineTo(x, 213 + h / 2); ctx.stroke();
  });
  heights.forEach((h, i) => {
    const x = 633 - i * 31;
    ctx.beginPath(); ctx.moveTo(x, 213 - h / 2); ctx.lineTo(x, 213 + h / 2); ctx.stroke();
  });

  ctx.font = '800 52px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PS AI MUSIC', 384, 420);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export class PSBear {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'PS_BEAR';
    this.mode = 'idle';
    this.audioLevel = 0;
    this._blinkAt = 1.6;
    this._blinkStart = -10;
    this._build();
  }

  _build() {
    this.materials = {
      fur: physical(0x9b551f, .94, 0, { sheen: .22, sheenColor: 0xd58b53, sheenRoughness: .72 }),
      furLight: physical(0xd59759, .96, 0, { sheen: .18, sheenColor: 0xf0c491, sheenRoughness: .74 }),
      muzzle: physical(0xd8a16c, .95, 0, { sheen: .12, sheenColor: 0xffd5aa }),
      hoodie: physical(0x090a0d, .86, .01, { sheen: .12, sheenColor: 0x253040, sheenRoughness: .82 }),
      hoodie2: physical(0x11131a, .78, .02, { sheen: .08, sheenColor: 0x353b4b }),
      black: physical(0x040405, .38, .22, { clearcoat: .16, clearcoatRoughness: .4 }),
      eyeWhite: physical(0xf5f1e9, .18, .08, { clearcoat: .65, clearcoatRoughness: .16 }),
      iris: physical(0x35170a, .18, .06, { clearcoat: .72, clearcoatRoughness: .12 }),
      neonCyan: physical(0x53e9ff, .28, .02, { emissive: 0x20d5ff, emissiveIntensity: 2.3 }),
      neonPink: physical(0xff5ad7, .28, .02, { emissive: 0xff27bb, emissiveIntensity: 2.0 }),
    };

    this._buildLegs();
    this._buildTorso();
    this._buildArms();
    this._buildHead();
    this._buildLogo();
  }

  _buildLegs() {
    this.leftLeg = new THREE.Group();
    this.rightLeg = new THREE.Group();
    this.leftLeg.position.set(-.38, 1.08, 0);
    this.rightLeg.position.set(.38, 1.08, 0);
    this.root.add(this.leftLeg, this.rightLeg);

    for (const group of [this.leftLeg, this.rightLeg]) {
      const leg = sphere(this.materials.fur, [.38,.58,.36], [0,-.42,0]);
      const paw = sphere(this.materials.furLight, [.48,.25,.58], [0,-.88,.15]);
      const pad = sphere(this.materials.black, [.23,.055,.25], [0,-.95,.62]);
      group.add(leg, paw, pad);
    }
  }

  _buildTorso() {
    this.torso = new THREE.Group();
    this.torso.position.set(0, 1.76, 0);
    this.root.add(this.torso);

    this.torso.add(sphere(this.materials.hoodie, [1.0,1.12,.71]));
    this.torso.add(sphere(this.materials.hoodie2, [.94,.34,.71], [0,-.5,.05]));

    this.hood = new THREE.Mesh(new THREE.TorusGeometry(.66,.16,22,72,Math.PI * 1.6), this.materials.hoodie2);
    this.hood.position.set(0,.72,-.44);
    this.hood.rotation.set(.05,0,.68);
    this.hood.castShadow = true;
    this.torso.add(this.hood);

    const drawL = cylinder(this.materials.black,.018,.018,.48,[-.17,.34,.69],14);
    const drawR = cylinder(this.materials.black,.018,.018,.48,[.17,.34,.69],14);
    this.torso.add(drawL, drawR);
    this.torso.add(sphere(this.materials.black,[.042,.06,.042],[-.17,.09,.69],18));
    this.torso.add(sphere(this.materials.black,[.042,.06,.042],[.17,.09,.69],18));
  }

  _buildArms() {
    this.leftArm = new THREE.Group();
    this.rightArm = new THREE.Group();
    this.leftArm.position.set(-.96,2.18,0);
    this.rightArm.position.set(.96,2.18,0);
    this.root.add(this.leftArm, this.rightArm);

    const makeArm = group => {
      group.add(sphere(this.materials.hoodie,[.34,.72,.39],[0,-.47,0]));
      const paw = sphere(this.materials.fur,[.35,.34,.37],[0,-1.0,.02]);
      const palm = sphere(this.materials.furLight,[.22,.12,.22],[0,-1.05,.34]);
      group.add(paw,palm);
      return paw;
    };
    this.leftPaw = makeArm(this.leftArm);
    this.rightPaw = makeArm(this.rightArm);
  }

  _buildHead() {
    this.head = new THREE.Group();
    this.head.position.set(0,3.16,0);
    this.root.add(this.head);

    const earL = sphere(this.materials.fur,[.40,.40,.25],[-.67,.28,-.05]);
    const earR = sphere(this.materials.fur,[.40,.40,.25],[.67,.28,-.05]);
    const earLi = sphere(this.materials.furLight,[.25,.25,.14],[-.67,.28,.11]);
    const earRi = sphere(this.materials.furLight,[.25,.25,.14],[.67,.28,.11]);
    this.head.add(earL,earR,earLi,earRi);

    this.headMesh = sphere(this.materials.fur,[.86,.82,.74]);
    this.head.add(this.headMesh);

    this.muzzleGroup = new THREE.Group();
    this.muzzleGroup.position.set(0,-.25,.68);
    this.head.add(this.muzzleGroup);
    this.muzzleGroup.add(sphere(this.materials.muzzle,[.50,.34,.26]));
    this.nose = sphere(this.materials.black,[.19,.13,.13],[0,.08,.26],30);
    this.muzzleGroup.add(this.nose);

    this.mouthPivot = new THREE.Group();
    this.mouthPivot.position.set(0,-.10,.24);
    this.muzzleGroup.add(this.mouthPivot);
    const lower = sphere(this.materials.muzzle,[.28,.11,.09],[0,-.11,.05],28);
    this.mouthPivot.add(lower);

    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x2a0b07 });
    const mouthCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-.22,0,0),
      new THREE.Vector3(-.11,-.075,.015),
      new THREE.Vector3(0,-.09,.02),
      new THREE.Vector3(.11,-.075,.015),
      new THREE.Vector3(.22,0,0),
    ]);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(mouthCurve,24,.016,10,false),mouthMat);
    tube.position.set(0,-.06,.34);
    this.mouthPivot.add(tube);

    this.eyeL = this._createEye(-.31);
    this.eyeR = this._createEye(.31);
    this.browL = this._createBrow(-.31,.05);
    this.browR = this._createBrow(.31,-.05);

    this._buildGlasses();
    this._buildCap();
  }

  _createEye(x) {
    const g = new THREE.Group();
    g.position.set(x,.16,.70);
    g.add(sphere(this.materials.eyeWhite,[.23,.27,.12]));
    g.add(sphere(this.materials.iris,[.137,.16,.08],[0,0,.11],28));
    g.add(sphere(this.materials.black,[.068,.09,.045],[0,0,.165],24));
    const highlight = sphere(new THREE.MeshBasicMaterial({color:0xffffff}),[.026,.034,.012],[-.035,.053,.205],18);
    g.add(highlight);
    this.head.add(g);
    return g;
  }

  _createBrow(x, zRot) {
    const brow = box(physical(0x4c260f,.92,0),[.24,.045,.035],[x,.45,.72]);
    brow.rotation.z = zRot;
    this.head.add(brow);
    return brow;
  }

  _buildGlasses() {
    const frameMaterial = this.materials.black;
    const frame = (cx) => {
      const g = new THREE.Group();
      g.position.set(cx,.17,.90);
      const w=.53,h=.43,t=.052,d=.055;
      g.add(box(frameMaterial,[w,t,d],[0,h/2,0]));
      g.add(box(frameMaterial,[w,t,d],[0,-h/2,0]));
      g.add(box(frameMaterial,[t,h,d],[-w/2,0,0]));
      g.add(box(frameMaterial,[t,h,d],[w/2,0,0]));
      this.head.add(g);
    };
    frame(-.31); frame(.31);
    this.head.add(box(frameMaterial,[.18,.05,.06],[0,.17,.90]));
    const sideL = box(frameMaterial,[.38,.045,.05],[-.81,.19,.73]); sideL.rotation.y=.18; this.head.add(sideL);
    const sideR = box(frameMaterial,[.38,.045,.05],[.81,.19,.73]); sideR.rotation.y=-.18; this.head.add(sideR);
  }

  _buildCap() {
    const crown = enableShadows(new THREE.Mesh(
      new THREE.SphereGeometry(.79,48,28,0,Math.PI*2,0,Math.PI/2),
      this.materials.hoodie2
    ));
    crown.scale.set(1.03,.72,.93);
    crown.position.set(0,.63,.02);
    this.head.add(crown);

    const brim = box(this.materials.hoodie2,[.98,.08,.48],[0,.45,.64]);
    brim.rotation.x = -.11;
    this.head.add(brim);

    const seam = new THREE.Mesh(new THREE.TorusGeometry(.44,.012,8,36,Math.PI), new THREE.MeshBasicMaterial({color:0x32353d}));
    seam.position.set(0,.90,.08);
    seam.rotation.x = Math.PI/2;
    this.head.add(seam);
  }

  _buildLogo() {
    const texture = makeLogoTexture();
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.36,.92), material);
    plane.position.set(0,-.02,.708);
    this.torso.add(plane);
  }

  setMode(mode) {
    this.mode = mode;
  }

  setAudioLevel(level) {
    this.audioLevel = clamp(level,0,1);
  }

  update(time, dt) {
    const breath = Math.sin(time * 1.52) * .012;
    this.torso.scale.set(1 + breath*.42, 1 + breath, 1 + breath*.34);
    this.root.position.y = .02 + Math.sin(time*1.52)*.008;

    this._animateBlink(time);
    this._animateMouth(time);

    let headY = Math.sin(time*.54)*.05;
    let headX = Math.sin(time*.73)*.018;
    let headZ = 0;

    this.leftArm.rotation.set(0,0,.10);
    this.rightArm.rotation.set(0,0,-.10);
    this.leftLeg.rotation.set(0,0,0);
    this.rightLeg.rotation.set(0,0,0);
    this.torso.rotation.set(0,0,0);

    this.browL.rotation.z = .05;
    this.browR.rotation.z = -.05;

    if (this.mode === 'idle') {
      this.leftArm.rotation.x = Math.sin(time*1.3)*.018;
      this.rightArm.rotation.x = -Math.sin(time*1.3)*.018;
    }

    if (this.mode === 'walk') {
      const s = Math.sin(time*5.25);
      this.leftArm.rotation.x = s*.50;
      this.rightArm.rotation.x = -s*.50;
      this.leftLeg.rotation.x = -s*.46;
      this.rightLeg.rotation.x = s*.46;
      this.root.position.y += Math.abs(Math.sin(time*5.25))*.052;
      this.torso.rotation.z = Math.sin(time*5.25)*.034;
      headY += Math.sin(time*2.6)*.05;
    }

    if (this.mode === 'wave') {
      this.rightArm.rotation.z = 2.45 + Math.sin(time*6.2)*.22;
      this.rightArm.rotation.x = -.16;
      headZ = -.08;
      headY -= .08;
    }

    if (this.mode === 'look') {
      headY += Math.sin(time*.78)*.46;
      headX += Math.sin(time*.55)*.09;
    }

    if (this.mode === 'happy') {
      headZ = Math.sin(time*.8)*.035;
      this.leftArm.rotation.z = .26 + Math.sin(time*1.7)*.04;
      this.rightArm.rotation.z = -.26 - Math.sin(time*1.7)*.04;
      this.browL.rotation.z = -.02;
      this.browR.rotation.z = .02;
    }

    if (this.mode === 'sad') {
      headX = .10 + Math.sin(time*.4)*.02;
      headY *= .45;
      this.leftArm.rotation.z = .02;
      this.rightArm.rotation.z = -.02;
      this.browL.rotation.z = -.18;
      this.browR.rotation.z = .18;
    }

    const lerp = 1 - Math.pow(.001, dt);
    this.head.rotation.y = THREE.MathUtils.lerp(this.head.rotation.y, headY, lerp*.12);
    this.head.rotation.x = THREE.MathUtils.lerp(this.head.rotation.x, headX, lerp*.12);
    this.head.rotation.z = THREE.MathUtils.lerp(this.head.rotation.z, headZ, lerp*.10);
  }

  _animateBlink(time) {
    if (time > this._blinkAt) {
      this._blinkStart = time;
      this._blinkAt = time + 2.8 + Math.random()*3.2;
    }
    const p = time - this._blinkStart;
    let scaleY = 1;
    if (p >= 0 && p < .18) {
      const n = p/.18;
      scaleY = n < .5 ? 1 - n*1.82 : .09 + (n-.5)*1.82;
    }
    this.eyeL.scale.y = scaleY;
    this.eyeR.scale.y = scaleY;
  }

  _animateMouth(time) {
    const idleTalk = this.audioLevel > .01 ? 0 : (this.mode === 'happy' ? .05 + Math.sin(time*2.4)*.012 : 0);
    const amount = clamp(this.audioLevel*.72 + idleTalk, 0, .72);
    this.mouthPivot.rotation.x = amount;
    this.mouthPivot.scale.y = 1 + amount*.48;
    this.muzzleGroup.scale.y = 1 + amount*.035;
  }
}
