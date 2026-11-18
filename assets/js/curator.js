"use strict";

// The Curator: a 3D butler in the hallway plus the chat panel that talks to the
// server's /api/curator endpoint (src/curator.py). The server does the retrieval and
// the model calls; this file only draws the butler and applies what comes back.
// (Classic script: loaded before game.js, uses globals from world.js and recommender.js.)

// ---- The butler (a blocky figure like the player, in a suit) ---------------
const butler = new THREE.Group();
{
  const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
  const box = (w, h, d, c, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
    m.position.set(x, y, z);
    butler.add(m);
    return m;
  };
  box(0.7, 0.85, 0.4, 0x14141c, 0, 1.2, 0);          // black coat
  box(0.26, 0.6, 0.02, 0xf4f4f4, 0, 1.3, -0.21);      // white shirt front
  box(0.2, 0.1, 0.04, 0xc0203a, 0, 1.55, -0.22);      // bow tie
  box(0.46, 0.46, 0.46, 0xffd9b0, 0, 1.88, 0);        // head
  box(0.5, 0.06, 0.5, 0x14141c, 0, 2.14, 0);          // hat brim
  box(0.34, 0.3, 0.34, 0x14141c, 0, 2.3, 0);          // hat crown
  box(0.4, 0.1, 0.06, 0x111122, 0, 1.92, -0.24);      // eyes strip
  butler.userData.legL = limb(0.28, 0.8, 0.3, 0x14141c, 0.8); butler.userData.legL.position.x = -0.18;
  butler.userData.legR = limb(0.28, 0.8, 0.3, 0x14141c, 0.8); butler.userData.legR.position.x = 0.18;
  butler.userData.armL = limb(0.22, 0.75, 0.25, 0x14141c, 1.58); butler.userData.armL.position.x = -0.46;
  butler.userData.armR = limb(0.22, 0.75, 0.25, 0x14141c, 1.58); butler.userData.armR.position.x = 0.46;
  butler.add(butler.userData.legL, butler.userData.legR, butler.userData.armL, butler.userData.armR);
  scene.add(butler);

  const tag = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35),
    new THREE.MeshBasicMaterial({ map: makeLabelTexture("Curator", ["#ffb86b", "#fff3dc"]), transparent: true }));
  tag.position.y = 2.85;
  butler.userData.tag = tag;
  butler.add(tag);
}

const butlerState = { x: 1.6, z: 3.2, yaw: 0, walk: 0, target: null, wave: 0 };
const BUTLER_HOME = { x: 1.6, z: 3.2 };

function sendButlerToGenre(genre) {
  const room = rooms.find((r) => r.genre === genre);
  if (!room) return;
  // Wait in the hallway just outside the room's door.
  butlerState.target = { x: room.side * 1.7, z: room.cz };
  butlerState.wave = 3; // seconds of waving once he arrives
}

function updateButler(dt, t) {
  const b = butlerState;
  let moving = false;
  if (b.target) {
    const dx = b.target.x - b.x, dz = b.target.z - b.z;
    const d = Math.hypot(dx, dz);
    if (d > 0.1) {
      const step = Math.min(d, 3.2 * dt);
      b.x += (dx / d) * step; b.z += (dz / d) * step;
      b.yaw = Math.atan2(dx, -dz);
      b.walk += dt * 10;
      moving = true;
    } else {
      b.target = null;
    }
  }
  if (!moving) {
    b.walk *= 0.85;
    // When standing still, turn to face the player.
    const want = Math.atan2(P.x - b.x, -(P.z - b.z));
    let diff = want - b.yaw;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    b.yaw += diff * Math.min(1, 4 * dt);
  }
  butler.position.set(b.x, 0, b.z);
  butler.rotation.y = -b.yaw;
  const sw = Math.sin(b.walk) * 0.7;
  const u = butler.userData;
  u.legL.rotation.x = sw; u.legR.rotation.x = -sw;
  u.armL.rotation.x = -sw; u.armR.rotation.x = sw;
  if (!moving && b.wave > 0) { // wave one arm to say "this way"
    b.wave -= dt;
    u.armR.rotation.x = Math.PI - 0.4 + Math.sin(t * 9) * 0.35;
  }
  u.tag.rotation.y = Math.atan2(camera.position.x - b.x, camera.position.z - b.z) + b.yaw;
}

// ---- Chat panel ------------------------------------------------------------
const curatorEls = {
  form: document.getElementById("curator-form"),
  input: document.getElementById("curator-input"),
  send: document.getElementById("curator-send"),
  log: document.getElementById("curator-log"),
  note: document.getElementById("curator-note"),
};

function curatorSay(cls, text) {
  const d = document.createElement("div");
  d.className = cls;
  d.textContent = text; // textContent (never innerHTML): model text can't inject markup
  curatorEls.log.appendChild(d);
  curatorEls.log.scrollTop = curatorEls.log.scrollHeight;
  return d;
}

function applyTaste(t) {
  // Same ranges as the sliders; clamp again here even though the server already validated.
  for (const id of ["energy", "valence", "acousticness"]) {
    taste[id] = clamp(Number(t[id]));
    document.getElementById(id).value = taste[id];
  }
  taste.mood = MOODS.includes(t.mood) ? t.mood : "";
  document.getElementById("mood").value = taste.mood;
  refreshPicks(); // the room songs and their match percentages change right here
}

curatorEls.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = curatorEls.input.value.trim();
  if (!message) return;
  curatorEls.input.value = "";
  curatorSay("me", message);
  const thinking = curatorSay("bot", "…");
  curatorEls.send.disabled = true;
  try {
    const res = await fetch("/api/curator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        taste: { mood: taste.mood, energy: taste.energy, valence: taste.valence, acousticness: taste.acousticness },
        song_id: currentRoom && currentRoom.pick ? currentRoom.pick.song.id : null,
      }),
    });
    const data = await res.json();
    thinking.textContent = data.reply || "My apologies, I have nothing to add.";
    curatorEls.note.textContent = data.degraded ? "(offline mode)" : "";
    if (data.taste) applyTaste(data.taste);
    if (data.pick) {
      curatorSay("pick", `♪ ${data.pick.title} · ${data.pick.artist} (${data.pick.genre} room, ${data.pick.match}% match)`);
      sendButlerToGenre(data.pick.genre);
    }
  } catch (err) {
    thinking.className = "err";
    thinking.textContent = location.protocol === "file:"
      ? "The curator needs the game served over http. Run: python -m src.serve_game"
      : "I cannot reach the curator's office just now. The hallway is yours.";
  } finally {
    curatorEls.send.disabled = false;
    curatorEls.input.focus();
  }
});
