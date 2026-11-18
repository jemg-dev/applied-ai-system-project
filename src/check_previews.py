"""
Check that every song in the game catalog resolves to an iTunes preview clip.

    python -m src.check_previews

Uses the same matching rule as game/game.js (title must match; artist match is
preferred), so a MISSING line here means that room will fall back to the
synthesized sample in the game.
"""

import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Dict, Optional

from src.export_game_data import load_game_songs


# Keep this pattern in sync with BAD_VERSION in game/game.js.
BAD_VERSION = re.compile(
    r"remix|karaoke|lullaby|tribute|instrumental|cover|\blive\b|8-bit|rework|\bedit\b|re-?record"
)


def normalize(text: str) -> str:
    text = re.sub(r"[\(\[].*?[\)\]]", " ", text.lower())  # drop (feat. ...) / [Remix]
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def fetch_json(url: str, tries: int = 4) -> Dict:
    """GET json, backing off if Apple rate-limits us (HTTP 403/429)."""
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=20) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as exc:
            if exc.code not in (403, 429) or attempt == tries - 1:
                raise
            time.sleep(5 * (attempt + 1))
    raise RuntimeError("unreachable")


def find_preview(song: Dict) -> Optional[Dict]:
    # A known iTunes track id beats text search (some songs never show up in search).
    if song.get("itunes_track_id"):
        url = f"https://itunes.apple.com/lookup?id={song['itunes_track_id']}"
        found = [r for r in fetch_json(url)["results"] if r.get("previewUrl")]
        return found[0] if found else None
    term = urllib.parse.quote(f"{song['title']} {song['artist']}")
    url = f"https://itunes.apple.com/search?term={term}&media=music&entity=song&limit=10"
    results = fetch_json(url)["results"]
    want_title = normalize(song["title"])
    want_artist = normalize(song["artist"]).split(" ")[0]
    best, best_score = None, None
    for r in results:
        if not r.get("previewUrl") or want_title not in normalize(r["trackName"]):
            continue
        score = 2 + (1 if want_artist in normalize(r["artistName"]) else 0)
        # Prefer the original recording over remixes, covers and karaoke.
        labels = f"{r['trackName']} {r.get('collectionName', '')}".lower()
        if BAD_VERSION.search(labels) and not BAD_VERSION.search(song["title"].lower()):
            score -= 3
        if best_score is None or score > best_score:
            best, best_score = r, score
    return best


def main() -> int:
    missing = 0
    for song in load_game_songs():
        time.sleep(0.4)  # stay well under Apple's rate limit
        try:
            hit = find_preview(song)
        except Exception as exc:  # network trouble
            print(f"ERROR   {song['title']}: {exc}")
            missing += 1
            continue
        if hit:
            print(f"OK      {song['title']} / {song['artist']}  ->  {hit['trackName']} / {hit['artistName']}")
        else:
            print(f"MISSING {song['title']} / {song['artist']}")
            missing += 1
    print(f"\n{missing} problem(s)")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
