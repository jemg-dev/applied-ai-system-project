import http.client
import json
import threading
from types import SimpleNamespace

from src.curator import Curator, clean_taste, retrieve, DEFAULT_TASTE
from src.serve_game import make_server

SONGS = [
    {"id": 1, "title": "Quiet Pines", "artist": "A", "genre": "ambient", "mood": "chill",
     "energy": 0.2, "tempo_bpm": 70, "valence": 0.5, "danceability": 0.2, "acousticness": 0.9},
    {"id": 2, "title": "Sleepy Loop", "artist": "B", "genre": "lofi", "mood": "chill",
     "energy": 0.3, "tempo_bpm": 75, "valence": 0.5, "danceability": 0.4, "acousticness": 0.7},
    {"id": 3, "title": "Thunder Run", "artist": "C", "genre": "metal", "mood": "intense",
     "energy": 0.95, "tempo_bpm": 170, "valence": 0.3, "danceability": 0.4, "acousticness": 0.05},
    {"id": 4, "title": "Sun Up", "artist": "D", "genre": "pop", "mood": "happy",
     "energy": 0.8, "tempo_bpm": 120, "valence": 0.95, "danceability": 0.9, "acousticness": 0.1},
    {"id": 5, "title": "Rain Piano", "artist": "E", "genre": "ambient", "mood": "chill",
     "energy": 0.1, "tempo_bpm": 60, "valence": 0.4, "danceability": 0.1, "acousticness": 0.95},
    {"id": 6, "title": "Mist", "artist": "F", "genre": "ambient", "mood": "chill",
     "energy": 0.15, "tempo_bpm": 65, "valence": 0.45, "danceability": 0.1, "acousticness": 0.9},
]
MOODS = ["chill", "happy", "intense"]


class FakeClient:
    """Stands in for anthropic.Anthropic: returns queued JSON answers, one per model call."""

    def __init__(self, *answers):
        self.answers = list(answers)
        self.calls = []
        self.messages = self

    def create(self, **kwargs):
        self.calls.append(kwargs)
        answer = self.answers.pop(0)
        if isinstance(answer, Exception):
            raise answer
        return SimpleNamespace(
            content=[SimpleNamespace(type="text", text=json.dumps(answer))],
            stop_reason="end_turn", usage=SimpleNamespace(input_tokens=100, output_tokens=20))


def make(*answers, **kw):
    return Curator(SONGS, client=FakeClient(*answers), min_interval=0, **kw)


CALM = {"intent": "recommend", "energy": 0.2, "valence": 0.5, "acousticness": 0.9, "mood": "chill"}


# ---- validation ---------------------------------------------------------------
def test_clean_taste_clamps_and_rejects_bad_values():
    t = clean_taste({"energy": 5, "valence": -2, "acousticness": "nope", "mood": "made-up"}, DEFAULT_TASTE, MOODS)
    assert t == {"energy": 1.0, "valence": 0.0, "acousticness": DEFAULT_TASTE["acousticness"], "mood": ""}
    assert clean_taste({"energy": float("nan")}, DEFAULT_TASTE, MOODS)["energy"] == DEFAULT_TASTE["energy"]
    assert clean_taste({"mood": "any"}, {**DEFAULT_TASTE, "mood": "happy"}, MOODS)["mood"] == ""
    assert clean_taste({"energy": 0.33}, DEFAULT_TASTE, MOODS)["energy"] == 0.35  # snaps to the slider step


# ---- retrieval ----------------------------------------------------------------
def test_retrieve_ranks_by_real_score_limits_genres_and_includes_current_song():
    calm = {"mood": "chill", "energy": 0.2, "valence": 0.5, "acousticness": 0.9}
    got = retrieve(SONGS, calm, k=4, per_genre=2)
    assert got[0]["id"] == 1 and got[0]["match_percent"] >= got[1]["match_percent"]
    assert sum(1 for c in got if c["genre"] == "ambient") <= 2
    assert all(c["score_breakdown"] for c in got)
    with_current = retrieve(SONGS, calm, k=2, per_genre=1, include_id=3)  # metal is nowhere near calm
    assert with_current[0]["id"] == 3


# ---- the pipeline ---------------------------------------------------------------
def test_happy_path_applies_taste_and_returns_grounded_pick():
    c = make(CALM, {"reply": "Quiet Pines suits you at 0.2 energy. Try the ambient room.", "pick_song_id": 1})
    out = c.handle({"message": "something calm to study to", "taste": DEFAULT_TASTE})
    assert out["ok"] and not out["degraded"]
    assert out["taste"]["energy"] == 0.2 and out["taste"]["mood"] == "chill"
    assert out["pick"]["id"] == 1 and out["pick"]["genre"] == "ambient"
    # The second model call must have been given the retrieved songs to ground itself in.
    assert "Quiet Pines" in c.client.calls[1]["messages"][0]["content"]


def test_pick_outside_the_retrieved_songs_is_replaced():
    c = make(CALM, {"reply": "Try this.", "pick_song_id": 999})
    out = c.handle({"message": "calm please", "taste": DEFAULT_TASTE})
    assert out["pick"]["id"] in {s["id"] for s in SONGS} and out["pick"]["id"] != 999


def test_wild_model_numbers_are_clamped():
    wild = {"intent": "recommend", "energy": 40, "valence": -3, "acousticness": 0.5, "mood": "bogus"}
    c = make(wild, {"reply": "ok", "pick_song_id": 3})
    out = c.handle({"message": "loud", "taste": DEFAULT_TASTE})
    assert out["taste"]["energy"] == 1.0 and out["taste"]["valence"] == 0.0 and out["taste"]["mood"] == ""


def test_explain_keeps_taste_and_explains_the_on_screen_song():
    explain = {"intent": "explain", "energy": 0.0, "valence": 0.0, "acousticness": 0.0, "mood": "happy"}
    c = make(explain, {"reply": "Its energy is far from yours.", "pick_song_id": 1})
    out = c.handle({"message": "why is this a low match?", "taste": DEFAULT_TASTE, "song_id": 3})
    assert out["taste"] is None          # explaining never moves the sliders
    assert out["pick"]["id"] == 3        # and it explains the song actually on screen


def test_message_is_truncated_and_empty_is_rejected():
    c = make(CALM, {"reply": "ok", "pick_song_id": 1})
    c.handle({"message": "x" * 5000, "taste": DEFAULT_TASTE})
    sent = json.loads(c.client.calls[0]["messages"][0]["content"])["message"]
    assert len(sent) == 300
    assert make().handle({"message": "   "})["ok"] is False
    assert make().handle("not a dict")["ok"] is False


# ---- failure handling --------------------------------------------------------------
def test_no_client_falls_back_to_retrieval_only():
    out = Curator(SONGS, client=None, min_interval=0).handle({"message": "hi", "taste": DEFAULT_TASTE})
    assert out["ok"] and out["degraded"] and out["taste"] is None and out["pick"]["title"] in out["reply"]


def test_model_failure_falls_back_instead_of_crashing():
    import anthropic
    import httpx2
    err = anthropic.APIConnectionError(request=httpx2.Request("POST", "https://example.com"))
    out = make(err).handle({"message": "hello", "taste": DEFAULT_TASTE})
    assert out["ok"] and out["degraded"]
    out = make({"intent": "recommend"}, {"reply": "x"}).handle({"message": "hello", "taste": DEFAULT_TASTE})
    assert out["ok"]  # missing fields are repaired or fall back, never a crash


def test_call_budget_and_rate_limit():
    c = make(CALM, {"reply": "ok", "pick_song_id": 1}, max_calls=2)
    assert not c.handle({"message": "one", "taste": DEFAULT_TASTE})["degraded"]
    assert c.handle({"message": "two", "taste": DEFAULT_TASTE})["degraded"]  # budget spent
    slow = Curator(SONGS, client=FakeClient(), min_interval=60)
    slow.handle({"message": "a", "taste": DEFAULT_TASTE})
    assert slow.handle({"message": "b", "taste": DEFAULT_TASTE})["ok"] is False  # too soon


# ---- the HTTP endpoint ----------------------------------------------------------------
def _post(port, path, body):
    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
    raw = body if isinstance(body, bytes) else json.dumps(body).encode()
    conn.request("POST", path, body=raw, headers={"Content-Type": "application/json"})
    resp = conn.getresponse()
    data = json.loads(resp.read() or b"{}")
    conn.close()
    return resp.status, data


def test_api_endpoint_validates_requests():
    fake = SimpleNamespace(handle=lambda payload: {"ok": True, "reply": "echo " + payload["message"]})
    server = make_server(0, curator=fake)
    port = server.server_address[1]
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        assert _post(port, "/api/curator", {"message": "hi"}) == (200, {"ok": True, "reply": "echo hi"})
        assert _post(port, "/api/curator", b"{not json")[0] == 400
        assert _post(port, "/api/curator", {"message": "x" * 10000})[0] == 413
        assert _post(port, "/api/other", {"message": "hi"})[0] == 404
    finally:
        server.shutdown()
        server.server_close()
