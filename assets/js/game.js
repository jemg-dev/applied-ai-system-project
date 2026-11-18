"use strict";

// Genre Hallway: walk a hallway of genre rooms; each room is a little theater
// playing a real 30-second iTunes preview of the recommender's pick for that
// genre, with a psychedelic, genre-colored visualizer driven by the audio.
//
// This file is the game glue: picks, keyboard input, the info/taste panels and
// the main loop. The other pieces live next to it in assets/js/.
// (Classic script: load order is set in game/index.html.)

function refreshPicks() {
  for (const room of rooms) {
    room.pick = pickForGenre(room.genre);
    if (room !== currentRoom) drawIdle(room);
  }
  // If the pick changed under us while inside a room, switch to the new song.
  if (currentRoom && playing && playing.songId !== currentRoom.pick.song.id && !MUTE) {
    stopRoomAudio();
    startRoomAudio(currentRoom);
  }
  updateInfo();
}

// ---- Input ---------------------------------------------------------------
const keys = new Set();
let started = false;
addEventListener("keydown", (e) => {
  if (e.target.tagName === "SELECT" || e.target.tagName === "INPUT") {
    if (!e.key.startsWith("Arrow")) return;
    e.target.blur(); // let arrows drive the character, not the sliders
  }
  if (e.key.startsWith("Arrow") || e.key === " ") e.preventDefault();
  if (!started && e.key === "Enter") return begin();
  keys.add(e.key.toLowerCase());
});
addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
addEventListener("blur", () => keys.clear());

function begin() {
  if (started) return;
  started = true;
  if (!MUTE) ensureAudio();
  document.getElementById("start").classList.add("hidden");
}
document.getElementById("start").addEventListener("click", begin);
if (location.protocol === "file:") document.getElementById("file-warning").classList.remove("hidden");

// ---- HUD -----------------------------------------------------------------
const $ = (id) => document.getElementById(id);
function bindTaste() {
  $("mood").innerHTML = '<option value="">Any</option>' + MOODS.map((m) => `<option>${m}</option>`).join("");
  $("mood").addEventListener("change", () => { taste.mood = $("mood").value; refreshPicks(); });
  for (const id of ["energy", "valence", "acousticness"]) {
    $(id).addEventListener("input", () => { taste[id] = Number($(id).value); refreshPicks(); });
  }
}

const STATUS_TEXT = {
  loading: "Loading preview from iTunes…",
  playing: "Playing a 30-second iTunes preview (looping)",
};

let currentRoom = null;
function updateInfo() {
  if (!currentRoom) {
    $("info-title").textContent = "Hallway";
    $("info-sub").textContent = "Walk into a room to hear its pick.";
    $("info-source").textContent = "";
    $("info-why").innerHTML = "";
    return;
  }
  const { song, score, reasons } = currentRoom.pick;
  $("info-title").textContent = `${currentRoom.genre.toUpperCase()}: ${song.title}`;
  $("info-sub").textContent = `${song.artist} · ${Math.round(score * 100)}% match`;
  const src = $("info-source");
  if (MUTE) src.textContent = "Audio muted (debug)";
  else if (!playing) src.textContent = "";
  else if (playing.status === "error") src.textContent = `Can't play this preview: ${playing.detail}`;
  else src.textContent = STATUS_TEXT[playing.status];
  src.style.color = playing && playing.status === "error" ? "#ff8a8a" : "";
  $("info-why").innerHTML = reasons.map((r) => `<li>${r}</li>`).join("");
}

function roomAt(x, z) {
  for (const r of rooms) {
    if (x >= r.xMin && x <= r.xMax && z >= r.zBot && z <= r.zTop) return r;
  }
  return null;
}

// ---- Main loop -----------------------------------------------------------
const clock = new THREE.Clock();
const camPos = new THREE.Vector3(0, 3, 5);

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  if (started) {
    const turn = (keys.has("arrowright") || keys.has("d") ? 1 : 0) - (keys.has("arrowleft") || keys.has("a") ? 1 : 0);
    const move = (keys.has("arrowup") || keys.has("w") ? 1 : 0) - (keys.has("arrowdown") || keys.has("s") ? 0.55 : 0);
    // Steer like a car: when reversing, flip the turn so back+left curves
    // backward to the left (otherwise the rotation swings the path to the right).
    P.yaw += turn * (move < 0 ? -1 : 1) * 2.4 * dt;
    if (move) {
      P.x += Math.sin(P.yaw) * move * 5 * dt;
      P.z -= Math.cos(P.yaw) * move * 5 * dt;
      resolve(P, P.radius);
      P.walk += dt * 10 * Math.abs(move);
    } else {
      P.walk *= 0.85;
    }
  }

  // Character pose
  player.position.set(P.x, 0, P.z);
  player.rotation.y = -P.yaw;
  const sw = Math.sin(P.walk) * 0.7;
  legL.rotation.x = sw; legR.rotation.x = -sw;
  armL.rotation.x = -sw; armR.rotation.x = sw;

  // Which room are we in? Switch audio + visualizer when it changes.
  const room = roomAt(P.x, P.z);
  if (room !== currentRoom) {
    const left = currentRoom;
    currentRoom = room;
    stopRoomAudio();
    if (left) drawIdle(left);
    if (room) {
      resetViz(room);
      if (started && !MUTE) startRoomAudio(room);
    }
    updateInfo();
  }

  // Visualizer for the current room, driven by the live audio when we have it
  if (currentRoom) {
    if (playing && playing.room === currentRoom && playing.status === "playing") {
      playing.analyser.getByteFrequencyData(freqData);
      playing.analyser.getByteTimeDomainData(waveData);
    } else if (playing && playing.room === currentRoom && playing.status === "error") {
      freqData.fill(0); waveData.fill(128); // nothing is playing, so the screen goes quiet
    } else {
      fakeAudio(t); // still loading (or muted): keep the screen alive
    }
    stepViz(currentRoom, dt, t);
    drawLive(currentRoom);
  }

  // Lighting follows the player, tinted by the room's main color
  follow.position.set(P.x, 3.2, P.z);
  if (currentRoom) follow.color.set(currentRoom.palette[0]).lerp(new THREE.Color(0xffffff), 0.35);
  else follow.color.set(0xffffff);

  // Walk the camera back from the character and stop before it would touch a wall,
  // so it never ends up on the far side of one.
  const bx = -Math.sin(P.yaw), bz = Math.cos(P.yaw);
  let dist = 1.0;
  for (let d = 1.0; d <= 4.2; d += 0.2) {
    if (blocked(P.x + bx * d, P.z + bz * d, 0.5)) break;
    dist = d;
  }
  const want = new THREE.Vector3(P.x + bx * dist, 1.6 + dist * 0.33, P.z + bz * dist);
  camPos.lerp(want, 1 - Math.pow(0.001, dt));
  camera.position.copy(camPos);
  camera.lookAt(P.x, 1.4, P.z);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

bindTaste();
refreshPicks();

// Debug helpers: game/index.html?autostart&room=3 skips the title overlay and
// drops the character in the middle of room 3 (handy for screenshots/testing).
{
  const idx = Number(QUERY.get("room"));
  if (QUERY.has("room") && rooms[idx]) {
    const r = rooms[idx];
    P.x = r.side * (HALL_HALF + 2.2); P.z = r.cz; P.yaw = r.side * Math.PI / 2;
    camPos.set(P.x - r.side * 1.5, 3.4, P.z);
  }
  if (QUERY.has("autostart")) { started = true; $("start").classList.add("hidden"); }
}
tick();
