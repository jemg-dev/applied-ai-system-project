"use strict";

// Genre color palettes (room, door and visualizer colors) and a color-blending helper.
// (Classic script: load order is set in game/index.html.)

// ---- Genre palettes: the colors of each room, door and visualizer --------
const PALETTES = {
  latin:       ["#ff7a00", "#ffd400", "#ff2d78", "#00c9b7"], // tropical
  rock:        ["#ff1a1a", "#b30000", "#ff5a1f", "#ffd0a0"],
  metal:       ["#c40000", "#ff2a00", "#7a0000", "#c9ccd6"], // crimson + steel
  ambient:     ["#0a2a7a", "#0f8f8f", "#146b3a", "#7fe9ff"], // deep blue, teal, forest
  jazz:        ["#14307a", "#ff9f1c", "#7a1f3d", "#2aa7a0"],
  classical:   ["#d4af37", "#f5ecd0", "#6d1a36", "#1b2a5c"],
  country:     ["#e8892b", "#f2d28b", "#a3331f", "#6b8fb3"],
  "hip hop":   ["#7a1fff", "#ffc400", "#ff5a1f", "#1d1d2b"],
  "indie pop": ["#ff9ec4", "#ffc89e", "#9effd8", "#b9a0ff"],
  lofi:        ["#5b3f8c", "#ff9a76", "#4a8f8f", "#f3d9b1"],
  pop:         ["#ff2d95", "#00d4ff", "#ffe14d", "#9b5cff"],
  reggae:      ["#e32b2b", "#ffcc00", "#1ea84a", "#0b5d2a"],
  synthwave:   ["#ff2bd6", "#19e3ff", "#7a2cff", "#ff8a3d"],
};
const DEFAULT_PALETTE = ["#6c8cff", "#ff6cd8", "#6cffd0", "#ffe06c"];

const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function colorAt(pal, u, a = 1) { // smoothly walk around the palette, u in [0,1)
  u = ((u % 1) + 1) % 1;
  const f = u * pal.length, i = Math.floor(f) % pal.length, j = (i + 1) % pal.length, k = f - Math.floor(f);
  const A = hex2rgb(pal[i]), B = hex2rgb(pal[j]);
  const c = [0, 1, 2].map((n) => Math.round(A[n] + (B[n] - A[n]) * k));
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}
