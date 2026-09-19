import * as THREE from 'three';

const MOTION_OK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── procedural textures ──────────────────────────────────────────────── */
function tex(w, h, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  return t;
}

// photographed plates of the real hardware, warped flat and used as albedo maps
const LOADER = new THREE.TextureLoader();
function photo(file, repeat) {
  const t = LOADER.load('tex/' + file, () => window.dispatchEvent(new Event('rig-texture')));
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  return t;
}

// fine square perforation, like the N5's upper front panel
const perfMap = tex(128, 128, (x, w, h) => {
  x.fillStyle = '#4a4841';
  x.fillRect(0, 0, w, h);
  const pitch = 8, hole = 4.4;
  for (let i = 0; i < w / pitch; i++) {
    for (let j = 0; j < h / pitch; j++) {
      x.fillStyle = '#0d0d0b';
      x.fillRect(i * pitch + 1.8, j * pitch + 1.8, hole, hole);
      x.fillStyle = 'rgba(255,248,235,0.22)';
      x.fillRect(i * pitch + 1.8, j * pitch + 1.8, hole, 1.1);
    }
  }
}, [9, 4]);
const perfBump = tex(128, 128, (x, w, h) => {
  x.fillStyle = '#fff';
  x.fillRect(0, 0, w, h);
  x.fillStyle = '#000';
  for (let i = 0; i < w / 8; i++) for (let j = 0; j < h / 8; j++) x.fillRect(i * 8 + 1.8, j * 8 + 1.8, 4.4, 4.4);
}, [9, 4]);

// mahogany grain for the slat door
const woodMap = tex(256, 64, (x, w, h) => {
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#9e6030');
  g.addColorStop(0.5, '#874c21');
  g.addColorStop(1, '#6d3c18');
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) {
    x.strokeStyle = `rgba(${Math.random() > 0.5 ? '60,28,10' : '210,140,80'},${0.05 + Math.random() * 0.16})`;
    x.lineWidth = 0.6 + Math.random() * 1.6;
    x.beginPath();
    const y = Math.random() * h;
    x.moveTo(0, y);
    x.bezierCurveTo(w * 0.33, y + (Math.random() - 0.5) * 7, w * 0.66, y + (Math.random() - 0.5) * 7, w, y + (Math.random() - 0.5) * 5);
    x.stroke();
  }
});

// brushed-steel drive lid with a printed label
const driveMap = tex(256, 128, (x, w, h) => {
  x.fillStyle = '#b9b4ac';
  x.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    x.strokeStyle = `rgba(255,255,255,${Math.random() * 0.11})`;
    x.beginPath(); x.moveTo(0, Math.random() * h); x.lineTo(w, Math.random() * h + 2); x.stroke();
  }
  x.fillStyle = '#e7e3dc';
  x.fillRect(22, 18, 150, 92);
  x.fillStyle = '#26251f';
  x.fillRect(22, 18, 150, 13);
  x.fillStyle = '#8d8880';
  x.fillRect(32, 42, 108, 3);
  x.fillRect(32, 52, 92, 3);
  x.fillRect(32, 62, 120, 3);
  for (let i = 0; i < 22; i++) { x.fillStyle = i % 3 ? '#26251f' : '#4a463f'; x.fillRect(34 + i * 5, 78, 2.4, 24); }
  x.fillStyle = '#5c584f';
  x.fillRect(196, 26, 44, 44);
});

const radMap = tex(128, 64, (x, w, h) => {
  x.fillStyle = '#15140f';
  x.fillRect(0, 0, w, h);
  for (let i = 0; i < w; i += 3) {
    x.fillStyle = 'rgba(190,182,166,0.5)';
    x.fillRect(i, 0, 1.2, h);
  }
}, [8, 1]);

const M = {
  paint: new THREE.MeshStandardMaterial({ name: 'chassis-paint', color: 0x2e2d28, roughness: 0.56, metalness: 0.36 }),
  paintDark: new THREE.MeshStandardMaterial({ name: 'chassis-paint-dark', color: 0x1e1d19, roughness: 0.62, metalness: 0.3 }),
  perf: new THREE.MeshStandardMaterial({ name: 'perforated-panel', map: photo('perf.png', [7, 3]), bumpMap: perfBump, bumpScale: 1.2, color: 0xffffff, roughness: 0.64, metalness: 0.3 }),
  wood: new THREE.MeshStandardMaterial({ name: 'walnut-slat', map: photo('wood.png', [1, 1]), roughness: 0.44, metalness: 0.04 }),
  moboTop: new THREE.MeshStandardMaterial({ name: 'mobo-photo', map: photo('mobo.png'), roughness: 0.68, metalness: 0.28 }),
  gpuTop: new THREE.MeshStandardMaterial({ name: 'gpu-photo', map: photo('gpu.png'), roughness: 0.34, metalness: 0.58 }),
  cpuTop: new THREE.MeshStandardMaterial({ name: 'cpu-photo', map: photo('cpu.png'), roughness: 0.3, metalness: 0.66 }),
  dimmWhite: new THREE.MeshStandardMaterial({ name: 'dimm-shroud-white', color: 0xe9e6df, roughness: 0.44, metalness: 0.1 }),
  dimmGlow: new THREE.MeshStandardMaterial({ name: 'dimm-rgb', color: 0xf2f4ff, emissive: 0xbfd4ff, emissiveIntensity: 1.9, roughness: 0.4 }),
  alu: new THREE.MeshStandardMaterial({ name: 'aluminium', color: 0x8f8a83, roughness: 0.3, metalness: 0.72 }),
  aluDark: new THREE.MeshStandardMaterial({ name: 'anodised', color: 0x35312d, roughness: 0.36, metalness: 0.62 }),
  pcb: new THREE.MeshStandardMaterial({ name: 'pcb', color: 0x14201a, roughness: 0.72, metalness: 0.18 }),
  pcbGreen: new THREE.MeshStandardMaterial({ name: 'pcb-green', color: 0x1c3a26, roughness: 0.74, metalness: 0.15 }),
  drive: new THREE.MeshStandardMaterial({ name: 'drive-steel', map: photo('drive.png'), roughness: 0.32, metalness: 0.64 }),
  driveSide: new THREE.MeshStandardMaterial({ name: 'drive-body', color: 0x2c2b27, roughness: 0.5, metalness: 0.5 }),
  rad: new THREE.MeshStandardMaterial({ name: 'radiator-core', map: radMap, roughness: 0.55, metalness: 0.6 }),
  copper: new THREE.MeshStandardMaterial({ name: 'cold-plate', color: 0xb5713a, roughness: 0.22, metalness: 0.94 }),
  gold: new THREE.MeshStandardMaterial({ name: 'gold-trim', color: 0xb68235, roughness: 0.32, metalness: 0.95 }),
  glass: new THREE.MeshStandardMaterial({ name: 'panel-glass', color: 0x2a2724, roughness: 0.12, metalness: 0.4, transparent: true, opacity: 0.3 }),
  ledOn: new THREE.MeshStandardMaterial({ name: 'led-on', color: 0x2f6fd0, emissive: 0x4f9dff, emissiveIntensity: 2.4, roughness: 0.3 }),
  ledOff: new THREE.MeshStandardMaterial({ name: 'led-off', color: 0x171613, roughness: 0.5 }),
  ring: new THREE.MeshStandardMaterial({ name: 'power-ring', color: 0xf4efe4, emissive: 0xfbf6ea, emissiveIntensity: 2.1, roughness: 0.4 }),
  rubber: new THREE.MeshStandardMaterial({ name: 'tubing', color: 0x141312, roughness: 0.82, metalness: 0.06 })
};

function box(w, h, d, mat, name) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.name = name;
  return m;
}

function part(mesh, pos, explode) {
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.userData.base = mesh.position.clone();
  mesh.userData.explode = new THREE.Vector3(explode[0], explode[1], explode[2]);
  return mesh;
}

function roundedRectPath(w, d, r, Ctor) {
  const s = new Ctor();
  s.moveTo(-w / 2 + r, -d / 2);
  s.lineTo(w / 2 - r, -d / 2);
  s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
  s.lineTo(w / 2, d / 2 - r);
  s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
  s.lineTo(-w / 2 + r, d / 2);
  s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r);
  s.lineTo(-w / 2, -d / 2 + r);
  s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  return s;
}

// hollow extruded tube with rounded vertical corners — the N5's monocoque wrap
function shellWrap(w, d, h, r, wall, mat, name) {
  const shape = roundedRectPath(w, d, r, THREE.Shape);
  shape.holes.push(roundedRectPath(w - wall * 2, d - wall * 2, Math.max(r - wall, 0.002), THREE.Path));
  const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -h / 2, 0);
  const m = new THREE.Mesh(g, mat);
  m.name = name;
  return m;
}

function roundedPlate(w, d, h, r, mat, name) {
  const g = new THREE.ExtrudeGeometry(roundedRectPath(w, d, r, THREE.Shape), { depth: h, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -h / 2, 0);
  const m = new THREE.Mesh(g, mat);
  m.name = name;
  return m;
}

function fan(radius, thickness, name, blades = 9) {
  const g = new THREE.Group();
  g.name = name;
  const frame = new THREE.Mesh(new THREE.TorusGeometry(radius, thickness * 0.34, 10, 44), M.paintDark);
  frame.name = name + '-frame';
  frame.rotation.x = Math.PI / 2;
  g.add(frame);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.32, radius * 0.3, thickness * 0.9, 28), M.paintDark);
  hub.name = name + '-hub';
  g.add(hub);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.2, radius * 0.2, thickness, 24), M.aluDark);
  cap.name = name + '-cap';
  g.add(cap);
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.66, thickness * 0.16, radius * 0.34), M.alu);
    blade.name = name + '-blade-' + i;
    blade.position.set(Math.cos(a) * radius * 0.56, 0, Math.sin(a) * radius * 0.56);
    blade.rotation.y = -a;
    blade.rotation.z = 0.42;
    g.add(blade);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const strut = box(radius * 0.9, thickness * 0.18, radius * 0.1, M.paintDark, name + '-strut-' + i);
    strut.position.set(Math.cos(a) * radius * 0.5, -thickness * 0.4, Math.sin(a) * radius * 0.5);
    strut.rotation.y = -a;
    g.add(strut);
  }
  return g;
}

export function buildRack() {
  const rig = new THREE.Group();
  rig.name = 'homelab-n5';
  const W = 0.30, H = 0.32, D = 0.30, R = 0.026;
  const SHELF = -0.038;            // deck dividing the drive cage from the board chamber

  /* ── chassis wrap, plates, shelf, side vents ───────────────────────── */
  const shell = new THREE.Group();
  shell.name = 'chassis';
  shell.add(shellWrap(W, D, H - 0.024, R, 0.005, M.paint, 'chassis-wrap'));
  const shelf = box(W - 0.018, 0.005, D - 0.018, M.paintDark, 'chassis-shelf');
  shelf.position.y = SHELF;
  shell.add(shelf);
  for (let i = 0; i < 7; i++) {
    const v = box(0.004, 0.14, 0.0075, M.paintDark, 'chassis-louvre-' + i);
    v.position.set(W / 2 - 0.004, 0.055, 0.05 + i * 0.016);
    shell.add(v);
  }
  rig.add(part(shell, [0, 0, 0], [0, 0, 0]));

  const topPlate = roundedPlate(W, D, 0.012, R, M.paint, 'chassis-top');
  const topPerf = box(W - 0.05, 0.002, D - 0.06, M.perf, 'chassis-top-perf');
  topPerf.position.y = 0.007;
  topPlate.add(topPerf);
  rig.add(part(topPlate, [0, H / 2 - 0.006, 0], [0, 0.20, 0]));

  const basePlate = roundedPlate(W, D, 0.014, R, M.paintDark, 'chassis-base');
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) => {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.009, 20), M.rubber);
    foot.name = 'chassis-foot-' + i;
    foot.position.set(sx * (W / 2 - 0.03), -0.011, sz * (D / 2 - 0.03));
    basePlate.add(foot);
  });
  rig.add(part(basePlate, [0, -H / 2 + 0.007, 0], [0, -0.21, 0]));

  const sideL = box(0.006, H - 0.05, D - 0.05, M.glass, 'chassis-side-left');
  rig.add(part(sideL, [-W / 2 + 0.004, 0, 0], [-0.4, 0.04, 0]));
  const backPanel = box(W - 0.03, H - 0.04, 0.006, M.paintDark, 'chassis-back');
  for (let i = 0; i < 5; i++) {
    const slot = box(0.018, 0.006, 0.002, M.aluDark, 'chassis-back-slot-' + i);
    slot.position.set(-0.09 + i * 0.024, -0.02, 0.004);
    backPanel.add(slot);
  }
  rig.add(part(backPanel, [0, 0, D / 2 - 0.006], [0, 0.02, 0.4]));

  /* ── front face: perforated intake (upper), IO strip, slat door ───── */
  const zF = -D / 2 + 0.003;

  const mesh = new THREE.Group();
  mesh.name = 'front-mesh';
  mesh.add(box(W - 0.018, 0.166, 0.007, M.paint, 'front-mesh-frame'));
  const meshFace = box(W - 0.044, 0.148, 0.003, M.perf, 'front-mesh-face');
  meshFace.position.z = -0.004;
  mesh.add(meshFace);
  rig.add(part(mesh, [0, 0.063, zF], [0, 0.10, -0.40]));

  const io = new THREE.Group();
  io.name = 'front-io';
  io.add(box(W - 0.018, 0.020, 0.008, M.paint, 'front-io-plate'));
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.0072, 0.0072, 0.003, 26), M.paintDark);
  btn.name = 'power-button';
  btn.rotation.x = Math.PI / 2;
  btn.position.set(0.086, 0, -0.005);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0062, 0.0009, 8, 30), M.ring);
  ring.name = 'power-button-ring';
  ring.rotation.x = Math.PI / 2;
  ring.position.z = -0.002;
  btn.add(ring);
  io.add(btn);
  const usbA = box(0.0135, 0.0058, 0.004, M.ledOn, 'port-usb-a');
  usbA.position.set(0.058, 0, -0.005);
  io.add(usbA);
  const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.0034, 0.0034, 0.005, 18), M.paintDark);
  jack.name = 'port-audio';
  jack.rotation.x = Math.PI / 2;
  jack.position.set(0.034, 0, -0.005);
  io.add(jack);
  const usbC = box(0.009, 0.0032, 0.004, M.aluDark, 'port-usb-c');
  usbC.position.set(0.012, 0, -0.005);
  io.add(usbC);
  for (let i = 0; i < 8; i++) {
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.0013, 10, 8), i < 2 ? M.ledOn : M.ledOff);
    led.name = 'bay-led-' + (i + 1);
    led.position.set(-0.016 - i * 0.0115, 0.002, -0.005);
    io.add(led);
  }
  rig.add(part(io, [0, -0.030, zF], [0, 0.0, -0.44]));

  const door = new THREE.Group();
  door.name = 'front-door';
  door.add(box(W - 0.018, 0.104, 0.008, M.paintDark, 'front-door-frame'));
  for (let i = 0; i < 8; i++) {
    const slat = box(W - 0.050, 0.0092, 0.011, M.wood, 'front-slat-' + (i + 1));
    slat.position.set(0, 0.0452 - i * 0.0129, -0.008);
    door.add(slat);
  }
  rig.add(part(door, [0, -0.092, zF], [0, -0.06, -0.48]));

  /* ── lower storey: eight vertical 3.5" bays, loaded front to back ─── */
  for (let i = 0; i < 8; i++) {
    const x = -0.1008 + i * 0.0288;
    const d = new THREE.Group();
    d.name = 'sas-drive-' + (i + 1);
    const tray = box(0.0285, 0.005, 0.150, M.paintDark, 'sas-tray-' + (i + 1));
    tray.position.y = -0.0525;
    d.add(tray);
    const handle = box(0.0285, 0.099, 0.008, M.paintDark, 'sas-handle-' + (i + 1));
    handle.position.z = -0.0775;
    const tab = box(0.0065, 0.014, 0.003, i < 4 ? M.ledOn : M.paint, 'sas-tab-' + (i + 1));
    tab.position.set(0, 0.040, -0.005);
    handle.add(tab);
    d.add(handle);
    if (i < 4) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.0265, 0.099, 0.147), [
        M.drive, M.drive, M.driveSide, M.driveSide, M.driveSide, M.driveSide
      ]);
      body.name = 'sas-drive-body-' + (i + 1);
      d.add(body);
      const conn = box(0.007, 0.010, 0.038, M.gold, 'sas-connector-' + (i + 1));
      conn.position.set(0, -0.040, 0.0745);
      d.add(conn);
    }
    rig.add(part(d, [x, -0.092, -0.045], [0.011 * (i - 3.5), -0.004 * (i - 3.5), -0.17 - i * 0.024]));
  }

  /* ── upper storey: board deck ──────────────────────────────────────── */
  const mobo = new THREE.Group();
  mobo.name = 'motherboard';
  const moboPcb = new THREE.Mesh(new THREE.BoxGeometry(0.244, 0.0045, 0.204), [M.pcb, M.pcb, M.moboTop, M.pcb, M.pcb, M.pcb]);
  moboPcb.name = 'mobo-pcb';
  mobo.add(moboPcb);
  const socket = box(0.046, 0.005, 0.046, M.paintDark, 'cpu-socket');
  socket.position.set(-0.030, 0.004, -0.024);
  mobo.add(socket);
  for (let i = 0; i < 2; i++) {
    const dimm = box(0.0075, 0.030, 0.126, M.pcbGreen, 'dimm-' + (i + 1));
    dimm.position.set(0.040 + i * 0.026, 0.017, -0.012);
    const hs = box(0.0092, 0.014, 0.120, M.dimmWhite, 'dimm-heatspreader-' + (i + 1));
    hs.position.y = 0.011;
    const fin = box(0.0098, 0.0016, 0.104, M.dimmGlow, 'dimm-crest-' + (i + 1));
    fin.position.y = 0.0072;
    hs.add(fin);
    dimm.add(hs);
    mobo.add(dimm);
  }
  for (let i = 0; i < 3; i++) {
    const pcie = box(0.088, 0.0075, 0.0105, M.paintDark, 'pcie-slot-' + (i + 1));
    pcie.position.set(-0.026, 0.006, 0.030 + i * 0.030);
    const latch = box(0.006, 0.008, 0.010, M.aluDark, 'pcie-latch-' + (i + 1));
    latch.position.set(0.047, 0.001, 0);
    pcie.add(latch);
    mobo.add(pcie);
  }
  const chipset = box(0.034, 0.010, 0.034, M.aluDark, 'chipset-heatsink');
  chipset.position.set(-0.02, 0.007, 0.076);
  const chipsetCrest = box(0.020, 0.0012, 0.020, M.gold, 'chipset-crest');
  chipsetCrest.position.y = 0.0058;
  chipset.add(chipsetCrest);
  mobo.add(chipset);
  const m2 = box(0.076, 0.005, 0.024, M.aluDark, 'm2-shield');
  m2.position.set(-0.03, 0.005, 0.010);
  mobo.add(m2);
  [[-0.09, -0.062], [-0.09, 0.008]].forEach(([x, z], i) => {
    const vrm = box(0.018, 0.020, 0.062, M.aluDark, 'vrm-heatsink-' + (i + 1));
    vrm.position.set(x, 0.012, z);
    mobo.add(vrm);
  });
  const atx24 = box(0.010, 0.012, 0.052, M.paintDark, 'atx-24pin');
  atx24.position.set(0.114, 0.008, -0.03);
  mobo.add(atx24);
  const rearIO = box(0.048, 0.034, 0.005, M.alu, 'rear-io-shield');
  rearIO.position.set(-0.082, 0.018, 0.101);
  for (let i = 0; i < 4; i++) {
    const p = box(0.0125, 0.0055, 0.002, M.ledOn, 'rear-usb-' + (i + 1));
    p.position.set(-0.012 + (i % 2) * 0.017, -0.006 + Math.floor(i / 2) * 0.009, -0.0035);
    rearIO.add(p);
  }
  mobo.add(rearIO);
  rig.add(part(mobo, [0, -0.028, 0.022], [0, -0.10, 0.12]));

  const cpu = new THREE.Group();
  cpu.name = 'cpu-ryzen';
  const ihs = new THREE.Mesh(new THREE.BoxGeometry(0.040, 0.0035, 0.040), [M.alu, M.alu, M.cpuTop, M.alu, M.alu, M.alu]);
  ihs.name = 'cpu-ihs';
  cpu.add(ihs);
  const cpuSub = box(0.0405, 0.0022, 0.0405, M.pcbGreen, 'cpu-substrate');
  cpuSub.position.y = -0.0028;
  cpu.add(cpuSub);
  for (let i = 0; i < 8; i++) {
    const row = box(0.034, 0.0006, 0.0018, M.gold, 'cpu-pin-row-' + i);
    row.position.set(0, -0.0042, -0.014 + i * 0.004);
    cpu.add(row);
  }
  rig.add(part(cpu, [-0.030, -0.019, -0.002], [-0.12, 0.02, -0.26]));

  /* ── AIO: pump on the CPU, radiator on the front intake ───────────── */
  const pump = new THREE.Group();
  pump.name = 'aio-pump';
  const pumpBody = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.033, 0.030, 44), M.paintDark);
  pumpBody.name = 'aio-pump-body';
  pump.add(pumpBody);
  const pumpTop = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.004, 44), M.aluDark);
  pumpTop.name = 'aio-pump-cap';
  pumpTop.position.y = 0.016;
  pump.add(pumpTop);
  const pumpRing = new THREE.Mesh(new THREE.TorusGeometry(0.0295, 0.0022, 10, 44), M.gold);
  pumpRing.name = 'aio-pump-ring';
  pumpRing.rotation.x = Math.PI / 2;
  pumpRing.position.y = 0.013;
  pump.add(pumpRing);
  const coldPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.029, 0.029, 0.004, 44), M.copper);
  coldPlate.name = 'aio-cold-plate';
  coldPlate.position.y = -0.016;
  pump.add(coldPlate);
  [-1, 1].forEach((sg, i) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sg * 0.026, 0.006, -0.006),
      new THREE.Vector3(sg * 0.040, 0.026, -0.044),
      new THREE.Vector3(sg * 0.034, 0.040, -0.082),
      new THREE.Vector3(sg * 0.030, 0.032, -0.100)
    ]);
    const t = new THREE.Mesh(new THREE.TubeGeometry(curve, 28, 0.0072, 14, false), M.rubber);
    t.name = 'aio-tube-' + (i + 1);
    pump.add(t);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.0092, 0.0092, 0.010, 18), M.aluDark);
    collar.name = 'aio-fitting-' + (i + 1);
    collar.position.set(sg * 0.028, 0.010, -0.008);
    collar.rotation.x = -0.5;
    pump.add(collar);
  });
  rig.add(part(pump, [-0.030, 0.000, -0.002], [-0.10, 0.10, -0.22]));

  const rad = new THREE.Group();
  rad.name = 'aio-radiator';
  rad.add(box(0.286, 0.028, 0.140, M.rad, 'radiator-core'));
  [-1, 1].forEach((sg, i) => {
    const tank = box(0.010, 0.030, 0.142, M.paintDark, 'radiator-tank-' + (i + 1));
    tank.position.set(sg * 0.143, 0, 0);
    rad.add(tank);
  });
  [-1, 1].forEach((sg, i) => {
    const f = fan(0.064, 0.026, 'radiator-fan-' + (i + 1), 9);
    f.position.set(sg * 0.070, -0.029, 0);
    rad.add(f);
    const shroud = new THREE.Mesh(new THREE.TorusGeometry(0.0665, 0.0035, 8, 40), M.paintDark);
    shroud.name = 'radiator-fan-shroud-' + (i + 1);
    shroud.rotation.x = Math.PI / 2;
    shroud.position.set(sg * 0.070, -0.042, 0);
    rad.add(shroud);
  });
  rad.rotation.x = -Math.PI / 2;      // stands upright against the front intake
  rig.add(part(rad, [0, 0.050, -0.118], [0, 0.04, -0.34]));

  const exhaust = new THREE.Group();
  exhaust.name = 'rear-fan';
  const ef = fan(0.064, 0.026, 'rear-fan-rotor', 9);
  exhaust.add(ef);
  const efCage = box(0.140, 0.004, 0.140, M.paintDark, 'rear-fan-cage');
  efCage.position.y = 0.016;
  exhaust.add(efCage);
  exhaust.rotation.x = -Math.PI / 2;
  rig.add(part(exhaust, [0.062, 0.052, 0.126], [0.06, 0.04, 0.30]));

  /* ── GPU: RTX 4070, flat over the board ───────────────────────────── */
  const gpu = new THREE.Group();
  gpu.name = 'gpu-4070';
  const gpuShroud = new THREE.Mesh(new THREE.BoxGeometry(0.242, 0.040, 0.112), [M.alu, M.alu, M.gpuTop, M.alu, M.alu, M.alu]);
  gpuShroud.name = 'gpu-shroud';
  gpu.add(gpuShroud);
  for (let i = 0; i < 2; i++) {
    const cut = new THREE.Mesh(new THREE.CylinderGeometry(0.049, 0.049, 0.042, 40), M.paint);
    cut.name = 'gpu-fan-well-' + (i + 1);
    cut.position.set(-0.055 + i * 0.110, 0.001, 0);
    gpu.add(cut);
    const f = fan(0.046, 0.018, 'gpu-fan-' + (i + 1), 11);
    f.position.set(-0.055 + i * 0.110, 0.020, 0);
    gpu.add(f);
  }
  const fins = box(0.200, 0.026, 0.096, M.alu, 'gpu-fin-stack');
  fins.position.y = -0.008;
  gpu.add(fins);
  for (let i = 0; i < 3; i++) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.0038, 0.0038, 0.190, 14), M.copper);
    pipe.name = 'gpu-heatpipe-' + (i + 1);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, 0.004, -0.030 + i * 0.030);
    gpu.add(pipe);
  }
  const backplate = box(0.238, 0.004, 0.106, M.alu, 'gpu-backplate');
  backplate.position.y = -0.024;
  gpu.add(backplate);
  const gpuPcb = box(0.206, 0.0035, 0.090, M.pcb, 'gpu-pcb');
  gpuPcb.position.y = -0.019;
  gpu.add(gpuPcb);
  const gpuEdge = box(0.086, 0.0022, 0.012, M.gold, 'gpu-edge-connector');
  gpuEdge.position.set(0.02, -0.0215, -0.050);
  gpu.add(gpuEdge);
  const pwr = box(0.024, 0.010, 0.012, M.paintDark, 'gpu-power-connector');
  pwr.position.set(0.06, 0.022, 0.050);
  gpu.add(pwr);
  const bracket = box(0.004, 0.040, 0.104, M.alu, 'gpu-bracket');
  bracket.position.set(-0.124, -0.004, 0);
  for (let i = 0; i < 3; i++) {
    const dp = box(0.002, 0.007, 0.018, M.paintDark, 'gpu-displayport-' + (i + 1));
    dp.position.set(-0.003, 0.004, -0.030 + i * 0.026);
    bracket.add(dp);
  }
  gpu.add(bracket);
  rig.add(part(gpu, [0, 0.048, 0.058], [0.30, 0.08, 0]));

  /* ── HBA in the far slot ──────────────────────────────────────────── */
  const hba = new THREE.Group();
  hba.name = 'hba-card';
  hba.add(box(0.158, 0.0035, 0.062, M.pcbGreen, 'hba-pcb'));
  const hbaSink = box(0.046, 0.014, 0.046, M.aluDark, 'hba-heatsink');
  hbaSink.position.set(0.006, 0.009, 0);
  for (let i = 0; i < 9; i++) {
    const f2 = box(0.0028, 0.010, 0.044, M.alu, 'hba-fin-' + i);
    f2.position.set(-0.019 + i * 0.0048, 0.003, 0);
    hbaSink.add(f2);
  }
  hba.add(hbaSink);
  for (let i = 0; i < 2; i++) {
    const p = box(0.020, 0.010, 0.014, M.paintDark, 'hba-sff-port-' + (i + 1));
    p.position.set(0.058, 0.006, -0.018 + i * 0.030);
    hba.add(p);
  }
  const hbaEdge = box(0.062, 0.0022, 0.011, M.gold, 'hba-edge-connector');
  hbaEdge.position.set(-0.02, -0.0025, -0.026);
  hba.add(hbaEdge);
  const hbaBracket = box(0.004, 0.036, 0.056, M.alu, 'hba-bracket');
  hbaBracket.position.set(-0.081, 0.013, 0);
  hba.add(hbaBracket);
  rig.add(part(hba, [0, 0.010, 0.090], [-0.30, 0.02, 0.12]));

  /* ── 2.5" SSDs on the left inner wall, NVMe under the M.2 shield ──── */
  for (let i = 0; i < 2; i++) {
    const sd = new THREE.Group();
    sd.name = 'sata-ssd-' + (i + 1);
    sd.add(box(0.100, 0.0075, 0.070, M.alu, 'sata-ssd-shell-' + (i + 1)));
    const lbl = box(0.060, 0.0005, 0.044, M.paintDark, 'sata-ssd-label-' + (i + 1));
    lbl.position.y = 0.004;
    sd.add(lbl);
    const sataPort = box(0.004, 0.005, 0.030, M.aluDark, 'sata-port-' + (i + 1));
    sataPort.position.set(-0.052, -0.001, -0.016);
    sd.add(sataPort);
    sd.rotation.z = Math.PI / 2;
    rig.add(part(sd, [-0.138, 0.052, -0.022 + i * 0.080], [-0.34, 0.02, 0]));
  }

  const nvme = new THREE.Group();
  nvme.name = 'nvme-evo';
  nvme.add(box(0.080, 0.0032, 0.022, M.pcbGreen, 'nvme-pcb'));
  const nvmeChip = box(0.026, 0.0022, 0.016, M.paintDark, 'nvme-chip');
  nvmeChip.position.set(0.006, 0.0027, 0);
  nvme.add(nvmeChip);
  const nvmeCtrl = box(0.011, 0.002, 0.011, M.paintDark, 'nvme-controller');
  nvmeCtrl.position.set(-0.024, 0.0026, 0);
  nvme.add(nvmeCtrl);
  const nvmeGold = box(0.014, 0.0008, 0.018, M.gold, 'nvme-edge');
  nvmeGold.position.set(-0.037, -0.0021, 0);
  nvme.add(nvmeGold);
  rig.add(part(nvme, [-0.030, -0.021, 0.010], [-0.26, -0.08, -0.10]));

  return rig;
}

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 20);

  const rig = buildRack();
  rig.rotation.y = Math.PI;
  const pivot = new THREE.Group();
  pivot.add(rig);
  scene.add(pivot);

  const envCanvas = document.createElement('canvas');
  envCanvas.width = 64; envCanvas.height = 32;
  const ectx = envCanvas.getContext('2d');
  const grad = ectx.createLinearGradient(0, 0, 0, 32);
  grad.addColorStop(0, '#fff3e4');
  grad.addColorStop(0.42, '#8d857a');
  grad.addColorStop(0.62, '#3a342d');
  grad.addColorStop(1, '#0f0e0c');
  ectx.fillStyle = grad;
  ectx.fillRect(0, 0, 64, 32);
  ectx.fillStyle = 'rgba(255,243,228,0.85)';
  ectx.fillRect(6, 2, 18, 7);
  const envTex = new THREE.CanvasTexture(envCanvas);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(envTex).texture;
  scene.environmentIntensity = 0.8;
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xdcd6c8, 0x0d0c0a, 1.05));
  const key = new THREE.DirectionalLight(0xfff3e4, 2.5);
  key.position.set(0.8, 1.1, 0.9);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xb68235, 1.45);
  rim.position.set(-1.1, 0.2, -0.8);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x8fa3b8, 0.55);
  fill.position.set(-0.4, -0.9, 0.6);
  scene.add(fill);
  const front = new THREE.DirectionalLight(0xf6f1e8, 1.05);
  front.position.set(0.1, 0.2, 1.4);
  scene.add(front);

  const parts = [];
  rig.traverse((o) => { if (o.userData.base) parts.push(o); });

  let wide = true;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    wide = w > 820;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const tmp = new THREE.Vector3();
  function project(name) {
    const target = rig.getObjectByName(name);
    if (!target) return null;
    target.getWorldPosition(tmp);
    tmp.project(camera);
    if (tmp.z > 1) return null;
    return { x: (tmp.x * 0.5 + 0.5) * canvas.clientWidth, y: (-tmp.y * 0.5 + 0.5) * canvas.clientHeight };
  }

  const SHELL = /^(chassis|front-)/;
  let shiftX = -0.1;
  function render(state) {
    const { explode, spin, tilt, dist, fade, shift } = state;
    shiftX = wide ? shift : 0;
    parts.forEach((p) => {
      p.position.copy(p.userData.base).addScaledVector(p.userData.explode, explode * 1.5);
    });
    const shellFade = 1 - fade;
    rig.traverse((o) => {
      if (!o.isMesh) return;
      let top = o;
      while (top.parent && top.parent !== rig) top = top.parent;
      if (!SHELL.test(top.name)) return;
      if (!o.userData.mat0) o.userData.mat0 = o.material;
      if (!o.userData.own) { o.material = o.userData.mat0.clone(); o.userData.own = true; }
      o.material.transparent = true;
      o.material.opacity = (o.userData.mat0.opacity ?? 1) * (0.25 + 0.75 * shellFade);
    });
    pivot.rotation.y = spin;
    pivot.rotation.x = tilt;
    camera.position.set(shiftX, 0.06, dist);
    camera.lookAt(shiftX, 0, 0);
    renderer.render(scene, camera);
  }

  resize();
  return { resize, render, project, motionOk: MOTION_OK };
}
