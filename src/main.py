"""
Command line runner for the Music Recommender Simulation.

This file helps you quickly run and test your recommender.

You will implement the functions in recommender.py:
- load_songs
- score_song
- recommend_songs
"""

from src.recommender import load_songs, recommend_songs


def main() -> None:
    songs = load_songs("data/songs.csv") 

    # Starter example profile
    user_prefs = {"genre": "pop", "mood": "happy", "energy": 0.8, "valence": 0.9, "acousticness": 0.6}

    recommendations = recommend_songs(user_prefs, songs, k=5)

    width = 72
    print("\n" + "=" * width)
    print(f"TOP {len(recommendations)} RECOMMENDATIONS".center(width))
    print("=" * width)
    print("Profile: " + ", ".join(f"{key}={value}" for key, value in user_prefs.items()))

    for rank, (song, score, explanation) in enumerate(recommendations, start=1):
        print("\n" + "-" * width)
        print(f"#{rank}  {song['title']}  by {song['artist']}")
        print(f"    Score: {score:.2f} / 1.00   [{'#' * round(score * 20):<20}]")
        print("    Why:")
        # recommend_songs joins the reasons with "; ", so split them back apart
        for reason in explanation.split("; "):
            print(f"      - {reason}")

    print("\n" + "=" * width + "\n")


if __name__ == "__main__":
    main()
