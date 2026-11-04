"""
Command line runner for the Music Recommender Simulation.

This file helps you quickly run and test your recommender.

You will implement the functions in recommender.py:
- load_songs
- score_song
- recommend_songs
"""

from src.recommender import load_songs, recommend_songs


# Each profile is (name, what it tests, preferences).
PROFILES = [
    # --- Distinct, realistic taste profiles ---
    ("Starter: Happy Pop", "baseline example",
     {"genre": "pop", "mood": "happy", "energy": 0.8, "valence": 0.9, "acousticness": 0.6}),

    ("High-Energy Pop", "upbeat, electronic, danceable",
     {"genre": "pop", "mood": "euphoric", "energy": 0.95, "valence": 0.85, "acousticness": 0.1}),

    ("Chill Lofi", "low energy, mellow, fairly acoustic",
     {"genre": "lofi", "mood": "chill", "energy": 0.3, "valence": 0.55, "acousticness": 0.8}),

    ("Deep Intense Rock", "loud, aggressive, dark, not acoustic",
     {"genre": "rock", "mood": "intense", "energy": 0.92, "valence": 0.3, "acousticness": 0.1}),

    # --- Adversarial / edge-case profiles ---
    ("Conflict: Energetic but Sad", "high energy + 'sad' mood; no song has mood 'sad', so mood can never match",
     {"genre": "pop", "mood": "sad", "energy": 0.9, "valence": 0.1, "acousticness": 0.5}),

    ("Conflict: Calm Metal Fan", "genre/mood say aggressive, numbers say quiet and acoustic",
     {"genre": "rock", "mood": "intense", "energy": 0.1, "valence": 0.5, "acousticness": 0.95}),

    ("Unknown Genre", "genre not in the catalog ('k-pop'); does the 0.15 genre weight just vanish?",
     {"genre": "k-pop", "mood": "happy", "energy": 0.8, "valence": 0.8, "acousticness": 0.3}),

    ("Out-of-Range Numbers", "energy=1.5 and acousticness=-0.5 are impossible; closeness can go below zero",
     {"genre": "pop", "mood": "happy", "energy": 1.5, "valence": 0.9, "acousticness": -0.5}),

    ("Dead Center", "every numeric target is 0.5, so many songs should tie",
     {"genre": "jazz", "mood": "relaxed", "energy": 0.5, "valence": 0.5, "acousticness": 0.5}),

    ("Case/Whitespace Mismatch", "'Lofi ' and 'CHILL' differ from 'lofi'/'chill' under exact matching",
     {"genre": "Lofi ", "mood": "CHILL", "energy": 0.3, "valence": 0.55, "acousticness": 0.8}),

    ("Empty Profile", "no preferences at all; every song should score 1.00",
     {}),

    ("Genre Only", "only genre given; unspecified fields count as a perfect match",
     {"genre": "classical"}),
]


def print_recommendations(name: str, note: str, user_prefs: dict, songs: list, k: int = 5) -> None:
    recommendations = recommend_songs(user_prefs, songs, k=k)

    width = 72
    print("\n" + "=" * width)
    print(f"{name.upper()} - TOP {len(recommendations)}".center(width))
    print("=" * width)
    print(f"Tests:   {note}")
    print("Profile: " + (", ".join(f"{key}={value!r}" for key, value in user_prefs.items()) or "(empty)"))

    for rank, (song, score, explanation) in enumerate(recommendations, start=1):
        print("\n" + "-" * width)
        print(f"#{rank}  {song['title']}  by {song['artist']}  [{song['genre']}/{song['mood']}]")
        print(f"    Score: {score:.2f} / 1.00   [{'#' * max(0, round(score * 20)):<20}]")
        print("    Why:")
        # recommend_songs joins the reasons with "; ", so split them back apart
        for reason in explanation.split("; "):
            print(f"      - {reason}")

    print("\n" + "=" * width + "\n")


def main() -> None:
    songs = load_songs("data/songs.csv")

    for name, note, user_prefs in PROFILES:
        print_recommendations(name, note, user_prefs, songs)


if __name__ == "__main__":
    main()
