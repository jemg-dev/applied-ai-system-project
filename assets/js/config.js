"use strict";

// Shared settings: the song data, debug flags (?mute) and tiny helpers.
// (Classic script: load order is set in game/index.html.)

const { genres: GENRES, moods: MOODS, songs: SONGS } = window.GAME_DATA;
const QUERY = new URLSearchParams(location.search);
const MUTE = QUERY.has("mute"); // debug: no audio, visualizer runs on a fake signal

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
