"use strict";

// iTunes preview lookup and the audio engine (one room plays at a time).
// (Classic script: load order is set in game/index.html.)

// ---- iTunes preview lookup (same matching rule as src/check_previews.py) --
const BAD_VERSION = /remix|karaoke|lullaby|tribute|instrumental|cover|\blive\b|8-bit|rework|\bedit\b|re-?record/;
const normalize = (t) => t.toLowerCase().replace(/[\(\[].*?[\)\]]/g, " ").replace(/[^a-z0-9]+/g, " ").trim();

function pickBestPreview(song, results) {
  const wantTitle = normalize(song.title);
  const wantArtist = normalize(song.artist).split(" ")[0];
  let best = null, bestScore = null;
  for (const r of results) {
    if (!r.previewUrl || !normalize(r.trackName).includes(wantTitle)) continue;
    let s = 2 + (normalize(r.artistName).includes(wantArtist) ? 1 : 0);
    const labels = `${r.trackName} ${r.collectionName || ""}`.toLowerCase();
    if (BAD_VERSION.test(labels) && !BAD_VERSION.test(song.title.toLowerCase())) s -= 3;
    if (bestScore === null || s > bestScore) { best = r; bestScore = s; }
  }
  return best ? best.previewUrl : null;
}

const previewCache = new Map(); // song id -> Promise<url | null>
// Resolves to {url} or {error} so the screen can say exactly what went wrong.
function lookupPreview(song) {
  if (!previewCache.has(song.id)) {
    const term = encodeURIComponent(`${song.title} ${song.artist}`);
    // A known iTunes track id is looked up directly (some songs never show up in
    // text search); everything else is searched by title + artist.
    const endpoint = song.itunes_track_id
      ? `https://itunes.apple.com/lookup?id=${song.itunes_track_id}`
      : `https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=10`;
    const p = fetch(endpoint)
      .then((r) => {
        if (!r.ok) throw new Error(`iTunes search returned ${r.status}`);
        return r.json();
      })
      .then((j) => {
        const results = j.results || [];
        const url = song.itunes_track_id
          ? (results.find((r) => r.previewUrl) || {}).previewUrl
          : pickBestPreview(song, results);
        return url ? { url } : { error: "iTunes has no preview clip for this song" };
      })
      .catch((e) => ({
        error: location.protocol === "file:"
          ? "the browser blocks iTunes when the page is opened as a file. Start it with: python -m src.serve_game"
          : `couldn't reach iTunes (${e.message})`,
      }))
      .then((res) => { if (res.error) previewCache.delete(song.id); return res; }); // retry next time
    previewCache.set(song.id, p);
  }
  return previewCache.get(song.id);
}

// ---- Audio engine: one room plays at a time ------------------------------
let actx = null;
let playing = null; // { room, songId, bus, analyser, el, status, detail }

function ensureAudio() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === "suspended") actx.resume();
}

function setStatus(p, status, detail = "") {
  p.status = status; // "loading" | "playing" | "error"
  p.detail = detail;
  if (playing === p) updateInfo();
}

function startRoomAudio(room) {
  ensureAudio();
  const bus = actx.createGain();
  bus.gain.setValueAtTime(0, actx.currentTime);
  bus.gain.linearRampToValueAtTime(0.9, actx.currentTime + 0.5);
  const analyser = actx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.8;
  bus.connect(analyser);
  analyser.connect(actx.destination);
  const p = { room, songId: room.pick.song.id, bus, analyser, el: null, status: "loading", detail: "" };
  playing = p;
  updateInfo();

  lookupPreview(room.pick.song).then((res) => {
    if (playing !== p) return; // we left the room (or the pick changed) meanwhile
    if (res.error) return setStatus(p, "error", res.error);
    const el = new Audio();
    el.crossOrigin = "anonymous"; // Apple sends CORS headers, so the analyser can read it
    el.loop = true;
    el.src = res.url;
    p.el = el;
    el.addEventListener("error", () => setStatus(p, "error", "the preview file failed to load or decode"));
    actx.createMediaElementSource(el).connect(bus);
    el.play().then(() => setStatus(p, "playing")).catch((e) =>
      setStatus(p, "error", `the browser blocked playback (${e.name}). Click the page, then step out and back in`));
  });
}

function stopRoomAudio() {
  if (!playing) return;
  const p = playing;
  playing = null;
  p.bus.gain.setTargetAtTime(0, actx.currentTime, 0.08);
  setTimeout(() => {
    if (p.el) p.el.pause();
    p.bus.disconnect();
    p.analyser.disconnect();
  }, 700);
}
