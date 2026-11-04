from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import csv

import os

# Baseline weights from the README recipe. They sum to 1.0, so the final score is 0 to 1.
BASELINE_WEIGHTS = {
    "energy": 0.30,
    "valence": 0.30,
    "genre": 0.15,
    "mood": 0.15,
    "acousticness": 0.10,
}

# Experiment: double energy, halve genre. Those raw numbers add up to 1.225, so
# every weight is divided by the total to bring the sum back to exactly 1.0.
# That keeps the score between 0 and 1.
_RAW_EXPERIMENT = {
    "energy": BASELINE_WEIGHTS["energy"] * 2,
    "valence": BASELINE_WEIGHTS["valence"],
    "genre": BASELINE_WEIGHTS["genre"] / 2,
    "mood": BASELINE_WEIGHTS["mood"],
    "acousticness": BASELINE_WEIGHTS["acousticness"],
}
EXPERIMENT_WEIGHTS = {k: v / sum(_RAW_EXPERIMENT.values()) for k, v in _RAW_EXPERIMENT.items()}

for _w in (BASELINE_WEIGHTS, EXPERIMENT_WEIGHTS):
    assert abs(sum(_w.values()) - 1.0) < 1e-9, "weights must sum to 1.0"

# Run with RECOMMENDER_WEIGHTS=experiment to try the experiment; default is baseline.
WEIGHTS = EXPERIMENT_WEIGHTS if os.environ.get("RECOMMENDER_WEIGHTS") == "experiment" else BASELINE_WEIGHTS


@dataclass
class Song:
    """
    Represents a song and its attributes.
    Required by tests/test_recommender.py
    """
    id: int
    title: str
    artist: str
    genre: str
    mood: str
    energy: float
    tempo_bpm: float
    valence: float
    danceability: float
    acousticness: float

@dataclass
class UserProfile:
    """
    Represents a user's taste preferences.
    Required by tests/test_recommender.py
    """
    favorite_genre: str
    favorite_mood: str
    target_energy: float
    # likes_acoustic: bool now becomes a float value for more precise preferences
    target_acousticness: float
    target_valence: float

class Recommender:
    """
    OOP implementation of the recommendation logic.
    Required by tests/test_recommender.py
    """
    def __init__(self, songs: List[Song]):
        self.songs = songs

    def recommend(self, user: UserProfile, k: int = 5) -> List[Song]:
        # TODO: Implement recommendation logic
        return self.songs[:k]

    def explain_recommendation(self, user: UserProfile, song: Song) -> str:
        # TODO: Implement explanation logic
        return "Explanation placeholder"

def load_songs(csv_path: str) -> List[Dict]:
    """Load songs from a CSV file into a list of dicts with numeric fields converted."""
    songs = []
    #"With the specific document named 'data.csv' opened in a mode meant for reading text, 
    # while explicitly using a standard text translation system to ensure special characters don't get scrambled,
    # and keeping formatting clean, let's temporarily nickname this open document 'file'."
    with open(csv_path, mode="r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            songs.append({
                "id": int(row["id"]),
                "title": row["title"],
                "artist": row["artist"],
                "genre": row["genre"],
                "mood": row["mood"],
                "energy": float(row["energy"]),
                "tempo_bpm": float(row["tempo_bpm"]),
                "valence": float(row["valence"]),
                "danceability": float(row["danceability"]),
                "acousticness": float(row["acousticness"]),
            })
    print(f"Loading songs from {csv_path}...")
    print(f"Loaded songs: {len(songs)}")
    return songs

def score_song(user_prefs: Dict, song: Dict) -> Tuple[float, List[str]]:
    """Score one song against the user's preferences, returning (score 0.0-1.0, list of reasons)."""
    score = 0.0
    reasons: List[str] = []

    # Numeric attributes: closeness = 1 - |song - target|
    for attr in ("energy", "valence", "acousticness"):
        if attr in user_prefs:
            closeness = 1 - abs(song[attr] - user_prefs[attr])
            detail = f"song {song[attr]:.2f} vs target {user_prefs[attr]:.2f}"
        else:
            closeness = 1
            detail = "no preference, anything works"
        points = WEIGHTS[attr] * closeness
        score += points
        reasons.append(f"{attr} closeness {closeness:.2f} ({detail}) (+{points:.2f})")

    # Categorical attributes: exact match = full weight, otherwise 0
    for attr in ("genre", "mood"):
        if attr not in user_prefs:
            points, detail = WEIGHTS[attr], "no preference, anything works"
        elif song[attr] == user_prefs[attr]:
            points, detail = WEIGHTS[attr], f"match: {song[attr]}"
        else:
            points, detail = 0.0, f"mismatch: {song[attr]} vs {user_prefs[attr]}"
        score += points
        reasons.append(f"{attr} {detail} (+{points:.2f})")

    return round(score, 4), reasons

def recommend_songs(user_prefs: Dict, songs: List[Dict], k: int = 5) -> List[Tuple[Dict, float, str]]:
    """Return the top k songs as (song, score, explanation) tuples, highest score first."""
    scored = [(song, *score_song(user_prefs, song)) for song in songs]
    scored.sort(key=lambda item: item[1], reverse=True)
    return [(song, score, "; ".join(reasons)) for song, score, reasons in scored[:k]]
