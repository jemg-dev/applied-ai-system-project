"use strict";

// The taste profile and the scoring that picks each room's song.
// (Classic script: load order is set in game/index.html.)

// ---- Recommender (JS port of score_song in src/recommender.py) ----------
// Keep these weights in sync with BASELINE_WEIGHTS in src/recommender.py.
const WEIGHTS = { energy: 0.30, valence: 0.30, genre: 0.15, mood: 0.15, acousticness: 0.10 };
const taste = { mood: "", energy: 0.6, valence: 0.6, acousticness: 0.4 };

function scoreSong(song, genre) {
  let score = 0;
  const reasons = [];
  for (const attr of ["energy", "valence", "acousticness"]) {
    const closeness = 1 - Math.abs(song[attr] - taste[attr]);
    const pts = WEIGHTS[attr] * closeness;
    score += pts;
    reasons.push(`${attr}: song ${song[attr].toFixed(2)} vs you ${taste[attr].toFixed(2)} (+${pts.toFixed(2)})`);
  }
  // Inside a genre room the genre always matches; an empty mood means "any".
  score += WEIGHTS.genre;
  reasons.push(`genre match: ${genre} (+${WEIGHTS.genre.toFixed(2)})`);
  const moodOk = !taste.mood || song.mood === taste.mood;
  score += moodOk ? WEIGHTS.mood : 0;
  reasons.push(taste.mood
    ? `mood ${moodOk ? "match" : "mismatch"}: ${song.mood} vs ${taste.mood} (+${(moodOk ? WEIGHTS.mood : 0).toFixed(2)})`
    : `mood: any (+${WEIGHTS.mood.toFixed(2)})`);
  return { score, reasons };
}

function pickForGenre(genre) {
  let best = null;
  for (const song of SONGS.filter((s) => s.genre === genre)) {
    const r = scoreSong(song, genre);
    if (!best || r.score > best.score) best = { song, ...r };
  }
  return best;
}
