import re

from src.recommender import load_songs
from src.export_game_data import CSV_PATH, build_payload
from src.check_previews import normalize, BAD_VERSION


def test_every_song_gets_a_room():
    songs = load_songs(CSV_PATH)
    payload = build_payload(songs)
    assert {s["genre"] for s in songs} == set(payload["genres"])
    assert payload["genres"] == sorted(payload["genres"])
    assert len(payload["songs"]) == len(songs)


def test_game_catalog_values_are_valid():
    for s in load_songs(CSV_PATH):
        for attr in ("energy", "valence", "danceability", "acousticness"):
            assert 0.0 <= s[attr] <= 1.0, (s["title"], attr)
        assert 40 <= s["tempo_bpm"] <= 220, s["title"]


def test_every_genre_has_a_color_palette():
    js = open("assets/js/palettes.js", encoding="utf-8").read()
    block = js.split("const PALETTES = {")[1].split("};")[0]
    for genre in build_payload(load_songs(CSV_PATH))["genres"]:
        assert re.search(rf'"?{re.escape(genre)}"?:\s*\[', block), f"no palette for {genre}"


def test_preview_matching_helpers():
    assert normalize("Happy (From \"Despicable Me 2\")") == "happy"
    assert normalize("Take Me Home, Country Roads") == "take me home country roads"
    assert BAD_VERSION.search("electric feel (justice remix)")
    assert not BAD_VERSION.search("electric feel")


def test_itunes_track_id_is_attached_only_where_set():
    from src.export_game_data import load_game_songs

    songs = {s["title"]: s for s in load_game_songs()}
    assert songs["Funk Around the Punk"]["itunes_track_id"] == 1157427798
    assert songs["Funk Around the Punk"]["genre"] == "jazz"
    assert songs["Take Five"]["itunes_track_id"] is None
