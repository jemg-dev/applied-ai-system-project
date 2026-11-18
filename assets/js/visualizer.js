"use strict";

// The psychedelic visualizer and the theater screens (live and idle).
// (Classic script: load order is set in game/index.html.)

// =========================================================================
// Visualizer: a feedback-loop "Milkdrop"-style effect. Each frame the previous
// frame is zoomed/rotated slightly and faded (the trails), then a 6-way
// kaleidoscope waveform, spectrum spokes and beat particles are added on top.
// Colors walk around the room's genre palette.
// =========================================================================
const VW = 1024, VH = 512;
const vizCanvas = document.createElement("canvas");
vizCanvas.width = VW; vizCanvas.height = VH;
const vg = vizCanvas.getContext("2d");
const viz = { room: null, phase: 0, particles: [], prevBass: 0, lastBeat: 0, flash: 0 };

const freqData = new Uint8Array(256);
const waveData = new Uint8Array(512);

function resetViz(room) {
  viz.room = room;
  viz.particles = [];
  viz.phase = 0;
  vg.globalCompositeOperation = "source-over";
  vg.globalAlpha = 1;
  vg.fillStyle = "#000";
  vg.fillRect(0, 0, VW, VH);
}

// Stand-in signal while a preview is still loading (or in ?mute mode).
function fakeAudio(t) {
  const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * 1.8)), 6);
  for (let i = 0; i < freqData.length; i++) {
    freqData[i] = clamp((230 * Math.exp(-i / 22) * (0.35 + 0.65 * beat)) + 35 * (1 + Math.sin(t * 2 + i * 0.3)), 0, 255);
  }
  for (let i = 0; i < waveData.length; i++) {
    waveData[i] = 128 + 55 * Math.sin(i * 0.06 + t * 3) * (0.5 + 0.5 * beat) + 25 * Math.sin(i * 0.19 - t * 5);
  }
}

const avg = (arr, a, b) => { let s = 0; for (let i = a; i < b; i++) s += arr[i]; return s / ((b - a) * 255); };

function stepViz(room, dt, t) {
  const pal = room.palette;
  const bass = avg(freqData, 0, 4), mid = avg(freqData, 4, 30), treble = avg(freqData, 30, 120);
  viz.phase += dt * (0.5 + bass * 2 + mid);
  const cx = VW / 2, cy = VH * 0.45;

  // 1. Feedback: zoom + twist + fade the previous frame
  vg.globalCompositeOperation = "source-over";
  vg.save();
  vg.translate(cx, cy);
  vg.rotate(Math.sin(viz.phase * 0.7) * 0.007 + bass * 0.014);
  const sc = 1.012 + bass * 0.03 + treble * 0.012;
  vg.scale(sc, sc);
  vg.translate(-cx, -cy);
  vg.globalAlpha = 0.82;
  vg.drawImage(vizCanvas, 0, 0);
  vg.restore();
  vg.globalAlpha = 1;
  vg.fillStyle = "rgba(0,0,0,0.07)";
  vg.fillRect(0, 0, VW, VH);

  vg.globalCompositeOperation = "lighter";
  const drift = viz.phase * 0.06;

  // 2. Pulsing core glow
  const coreR = 40 + bass * 140;
  const glow = vg.createRadialGradient(cx, cy, 0, cx, cy, coreR);
  glow.addColorStop(0, colorAt(pal, drift, 0.22));
  glow.addColorStop(1, colorAt(pal, drift + 0.3, 0));
  vg.fillStyle = glow;
  vg.beginPath(); vg.arc(cx, cy, coreR, 0, Math.PI * 2); vg.fill();

  // 3. Kaleidoscope waveform (6-fold rotation, each wedge mirrored)
  const N = 6, wedge = (Math.PI * 2) / N;
  vg.lineWidth = 1.5 + bass * 3;
  vg.lineJoin = "round";
  for (let s = 0; s < N * 2; s++) {
    vg.save();
    vg.translate(cx, cy);
    vg.rotate(Math.floor(s / 2) * wedge + viz.phase * 0.15);
    if (s % 2) vg.scale(1, -1);
    vg.strokeStyle = colorAt(pal, s / (N * 2) + drift, 0.6);
    vg.beginPath();
    for (let i = 0; i < waveData.length; i += 4) {
      const a = (i / waveData.length) * wedge;
      const r = 95 + bass * 60 + ((waveData[i] - 128) / 128) * 120;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0) vg.moveTo(x, y); else vg.lineTo(x, y);
    }
    vg.stroke();
    vg.restore();
  }

  // 4. Spectrum spokes around the core
  vg.lineWidth = 3;
  vg.lineCap = "round";
  const spokes = 72, r0 = 150 + bass * 30;
  for (let i = 0; i < spokes; i++) {
    const v = freqData[Math.floor(i * 1.6)] / 255;
    const a = (i / spokes) * Math.PI * 2 - viz.phase * 0.25;
    vg.strokeStyle = colorAt(pal, i / spokes + drift, 0.18 + v * 0.45);
    vg.beginPath();
    vg.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    vg.lineTo(cx + Math.cos(a) * (r0 + 6 + v * 170), cy + Math.sin(a) * (r0 + 6 + v * 170));
    vg.stroke();
  }

  // 5. Beat detection -> particle burst + flash
  if (bass > 0.5 && bass - viz.prevBass > 0.05 && t - viz.lastBeat > 0.18) {
    viz.lastBeat = t;
    viz.flash = 1;
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2, sp = 90 + Math.random() * 280;
      viz.particles.push({
        x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, size: 2 + Math.random() * 4, u: Math.random(),
      });
    }
  }
  viz.prevBass = bass;
  for (const p of viz.particles) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= 0.985; p.vy *= 0.985;
    p.life -= dt * 0.8;
    vg.fillStyle = colorAt(pal, p.u + drift, Math.max(0, p.life));
    vg.beginPath(); vg.arc(p.x, p.y, p.size * p.life + 0.5, 0, Math.PI * 2); vg.fill();
  }
  viz.particles = viz.particles.filter((p) => p.life > 0);
  if (viz.flash > 0.01) {
    vg.fillStyle = colorAt(pal, drift + 0.5, viz.flash * 0.07);
    vg.fillRect(0, 0, VW, VH);
    viz.flash *= 0.85;
  }
  vg.globalCompositeOperation = "source-over";
}

// ---- Screen drawing ------------------------------------------------------
function drawCaption(g, room, W, H) {
  const { song, score } = room.pick;
  const pal = room.palette;
  const bar = g.createLinearGradient(0, H * 0.68, 0, H);
  bar.addColorStop(0, "rgba(0,0,0,0)");
  bar.addColorStop(0.45, "rgba(0,0,0,0.78)");
  bar.addColorStop(1, "rgba(0,0,0,0.9)");
  g.fillStyle = bar; g.fillRect(0, H * 0.68, W, H * 0.32);
  g.textAlign = "center"; g.textBaseline = "alphabetic";
  g.fillStyle = "#fff"; g.font = "bold 46px system-ui";
  g.fillText(song.title, W / 2, H * 0.84, W - 60);
  g.fillStyle = "#cfcdf0"; g.font = "28px system-ui";
  g.fillText(`${song.artist}  ·  ${song.mood}`, W / 2, H * 0.84 + 38, W - 60);
  g.fillStyle = pal[1]; g.font = "bold 24px system-ui";
  g.fillText(`${Math.round(score * 100)}% match for you`, W / 2, H * 0.84 + 72, W - 60);
  g.textAlign = "left";
  g.fillStyle = "rgba(255,255,255,.6)"; g.font = "bold 22px system-ui";
  g.fillText(room.genre.toUpperCase(), 24, 40);
}

function drawLive(room) { // current room: visualizer + caption
  const g = room.screenCanvas.getContext("2d");
  g.drawImage(vizCanvas, 0, 0);
  drawCaption(g, room, VW, VH);
  room.screenTex.needsUpdate = true;
}

function drawIdle(room) { // other rooms: a still palette card
  const g = room.screenCanvas.getContext("2d");
  const pal = room.palette;
  const bg = g.createLinearGradient(0, 0, VW, VH);
  pal.forEach((c, i) => bg.addColorStop(i / (pal.length - 1), c));
  g.globalAlpha = 1;
  g.fillStyle = bg; g.fillRect(0, 0, VW, VH);
  g.fillStyle = "rgba(0,0,0,0.62)"; g.fillRect(0, 0, VW, VH);
  g.lineWidth = 3;
  for (let i = 0; i < 9; i++) { // soft concentric rings
    g.strokeStyle = colorAt(pal, i / 9, 0.35);
    g.beginPath(); g.arc(VW / 2, VH * 0.4, 40 + i * 30, 0, Math.PI * 2); g.stroke();
  }
  drawCaption(g, room, VW, VH);
  g.textAlign = "center"; g.fillStyle = "rgba(255,255,255,.7)"; g.font = "22px system-ui";
  g.fillText("walk in to play", VW / 2, VH * 0.44);
  room.screenTex.needsUpdate = true;
}
