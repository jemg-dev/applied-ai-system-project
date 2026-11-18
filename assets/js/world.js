"use strict";

// The 3D world: renderer, hallway and rooms, the character and wall collision.
// (Classic script: load order is set in game/index.html.)

// ---- Three.js scene ------------------------------------------------------
const canvasEl = document.getElementById("view");
const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07070f);
scene.fog = new THREE.Fog(0x07070f, 18, 60);
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120);

scene.add(new THREE.AmbientLight(0x9090b8, 0.7));
scene.add(new THREE.HemisphereLight(0xaaaaff, 0x222233, 0.35));
const follow = new THREE.PointLight(0xffffff, 1.0, 22);
scene.add(follow);

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

// ---- Layout --------------------------------------------------------------
const HALL_HALF = 3, ROOM_D = 8, ROOM_W = 8, WALL_H = 4.5, T = 0.4, DOOR = 3.2;
const Z_FRONT = 10; // entrance area south of the first rooms
const slots = Math.ceil(GENRES.length / 2);
const Z_END = -2 - ROOM_D * slots;

const walls = []; // collision boxes {minX,maxX,minZ,maxZ}
const wallMat = new THREE.MeshLambertMaterial({ color: 0x2a2c4a });
const floorMat = new THREE.MeshLambertMaterial({ color: 0x15162a });

function addBox(cx, cy, cz, sx, sy, sz, mat, collide) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  m.position.set(cx, cy, cz);
  scene.add(m);
  if (collide) walls.push({ minX: cx - sx / 2, maxX: cx + sx / 2, minZ: cz - sz / 2, maxZ: cz + sz / 2 });
  return m;
}
const addWall = (cx, cz, sx, sz) => addBox(cx, WALL_H / 2, cz, sx, WALL_H, sz, wallMat, true);

function makeLabelTexture(text, pal) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#0b0c1a"; g.fillRect(0, 0, 512, 128);
  g.strokeStyle = pal[0]; g.lineWidth = 6; g.strokeRect(6, 6, 500, 116);
  g.fillStyle = pal[1];
  g.font = "bold 56px system-ui"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(text.toUpperCase(), 256, 68, 480);
  return new THREE.CanvasTexture(c);
}

// Hall floor
const hallLen = Z_FRONT - Z_END;
{
  const f = new THREE.Mesh(new THREE.PlaneGeometry(HALL_HALF * 2, hallLen), floorMat);
  f.rotation.x = -Math.PI / 2;
  f.position.set(0, 0, (Z_FRONT + Z_END) / 2);
  scene.add(f);
  const r = new THREE.Mesh(new THREE.PlaneGeometry(1.4, hallLen), new THREE.MeshLambertMaterial({ color: 0x5a1f46 }));
  r.rotation.x = -Math.PI / 2;
  r.position.set(0, 0.01, (Z_FRONT + Z_END) / 2);
  scene.add(r);
}
addWall(0, Z_FRONT, HALL_HALF * 2 + T, T);
addWall(0, Z_END, HALL_HALF * 2 + T, T);

// Rooms
const rooms = GENRES.map((genre, k) => {
  const side = k % 2 === 0 ? -1 : 1;
  const slot = Math.floor(k / 2);
  const zTop = -2 - ROOM_D * slot;
  const zBot = zTop - ROOM_D;
  const cz = zTop - ROOM_D / 2;
  const palette = PALETTES[genre] || DEFAULT_PALETTE;
  return { genre, k, side, slot, zTop, zBot, cz, palette, pick: null };
});

// Hall side walls with door gaps
for (const side of [-1, 1]) {
  const centers = rooms.filter((r) => r.side === side).map((r) => r.cz).sort((a, b) => b - a);
  let cur = Z_FRONT;
  const seg = (a, b) => { if (a - b > 0.01) addWall(side * HALL_HALF, (a + b) / 2, T, a - b); };
  for (const c of centers) { seg(cur, c + DOOR / 2); cur = c - DOOR / 2; }
  seg(cur, Z_END);
}

const separators = new Set();
const seatMat = new THREE.MeshLambertMaterial({ color: 0x3a1a2e });

for (const room of rooms) {
  const { side, zTop, zBot, cz, palette } = room;
  const xMid = side * (HALL_HALF + ROOM_W / 2);
  const xBack = side * (HALL_HALF + ROOM_W);
  room.xMin = Math.min(side * (HALL_HALF + 0.3), xBack);
  room.xMax = Math.max(side * (HALL_HALF + 0.3), xBack);

  const fl = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D),
    new THREE.MeshLambertMaterial({ color: new THREE.Color(palette[0]).multiplyScalar(0.2) }));
  fl.rotation.x = -Math.PI / 2;
  fl.position.set(xMid, 0.01, cz);
  scene.add(fl);
  addWall(xBack, cz, T, ROOM_D);
  for (const z of [zTop, zBot]) {
    const key = `${side}:${z}`;
    if (!separators.has(key)) { separators.add(key); addWall(xMid, z, ROOM_W, T); }
  }

  // Lintel + door sign + glowing door frame (face the hallway)
  const faceHall = -side * Math.PI / 2;
  addBox(side * HALL_HALF, 3.75, cz, T, 1.5, DOOR, wallMat, false);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.75),
    new THREE.MeshBasicMaterial({ map: makeLabelTexture(room.genre, palette) }));
  sign.position.set(side * (HALL_HALF - 0.22), 3.75, cz);
  sign.rotation.y = faceHall;
  scene.add(sign);
  const glowA = new THREE.MeshBasicMaterial({ color: new THREE.Color(palette[0]) });
  const glowB = new THREE.MeshBasicMaterial({ color: new THREE.Color(palette[1]) });
  addBox(side * HALL_HALF, 1.6, cz - DOOR / 2, T + 0.06, 3.2, 0.12, glowA, false);
  addBox(side * HALL_HALF, 1.6, cz + DOOR / 2, T + 0.06, 3.2, 0.12, glowB, false);

  // Theater screen on the back wall
  const sc = document.createElement("canvas");
  sc.width = 1024; sc.height = 512;
  room.screenCanvas = sc;
  room.screenTex = new THREE.CanvasTexture(sc);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(6, 3),
    new THREE.MeshBasicMaterial({ map: room.screenTex }));
  screen.position.set(xBack - side * 0.22, 2.3, cz);
  screen.rotation.y = faceHall;
  scene.add(screen);

  // Seats (two rows facing the screen)
  for (const rowX of [side * 6.4, side * 8.4]) {
    for (const dz of [-3.2, -1.8, 1.8, 3.2]) {
      addBox(rowX, 0.3, cz + dz, 0.9, 0.6, 0.9, seatMat, true);
      addBox(rowX - side * 0.35, 0.8, cz + dz, 0.2, 0.7, 0.9, seatMat, false);
    }
  }
}

// ---- Character -----------------------------------------------------------
const player = new THREE.Group();
const limb = (w, h, d, color, y) => {
  const pivot = new THREE.Group();
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
  m.position.y = -h / 2;
  pivot.add(m);
  pivot.position.y = y;
  return pivot;
};
const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 0.4), new THREE.MeshLambertMaterial({ color: 0xff4fa3 }));
torso.position.y = 1.2; player.add(torso);
const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), new THREE.MeshLambertMaterial({ color: 0xffd9b0 }));
head.position.y = 1.88; player.add(head);
const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.06), new THREE.MeshBasicMaterial({ color: 0x111122 }));
visor.position.set(0, 1.92, -0.24); player.add(visor); // -z is "forward"
const legL = limb(0.28, 0.8, 0.3, 0x2b2f66, 0.8); legL.position.x = -0.18;
const legR = limb(0.28, 0.8, 0.3, 0x2b2f66, 0.8); legR.position.x = 0.18;
const armL = limb(0.22, 0.75, 0.25, 0xff4fa3, 1.58); armL.position.x = -0.46;
const armR = limb(0.22, 0.75, 0.25, 0xff4fa3, 1.58); armR.position.x = 0.46;
player.add(legL, legR, armL, armR);
scene.add(player);

const P = { x: 0, z: 5.5, yaw: 0, radius: 0.4, walk: 0 };

// ---- Collision -----------------------------------------------------------
function resolve(pos, r) {
  for (let pass = 0; pass < 3; pass++) {
    for (const w of walls) {
      const cx = clamp(pos.x, w.minX, w.maxX), cz = clamp(pos.z, w.minZ, w.maxZ);
      const dx = pos.x - cx, dz = pos.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      if (d2 > 1e-9) {
        const d = Math.sqrt(d2);
        pos.x = cx + (dx / d) * r; pos.z = cz + (dz / d) * r;
      } else { // centre is inside the box: push out along the shallowest axis
        const push = [pos.x - w.minX, w.maxX - pos.x, pos.z - w.minZ, w.maxZ - pos.z];
        const m = Math.min(...push);
        if (m === push[0]) pos.x = w.minX - r;
        else if (m === push[1]) pos.x = w.maxX + r;
        else if (m === push[2]) pos.z = w.minZ - r;
        else pos.z = w.maxZ + r;
      }
    }
  }
}

function blocked(x, z, r) {
  for (const w of walls) {
    if (x > w.minX - r && x < w.maxX + r && z > w.minZ - r && z < w.maxZ + r) return true;
  }
  return false;
}
