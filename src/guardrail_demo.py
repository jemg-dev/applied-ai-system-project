"""
Offline guardrail demo for the Curator. No API key and no network needed.

    python -m src.guardrail_demo

Feeds the real Curator pipeline (real catalog, real retrieval, real validation) with a
stand-in model that misbehaves on purpose, and prints PASS or FAIL for each guardrail.
Exits with status 1 if any guardrail fails. Output is saved in docs/evidence/.
"""

import http.client
import io
import json
import logging
import sys
import threading
from contextlib import redirect_stdout
from types import SimpleNamespace

import anthropic
import httpx2

from src.curator import Curator, DEFAULT_TASTE
from src.export_game_data import load_game_songs
from src.serve_game import make_server

logging.getLogger("curator").setLevel(logging.CRITICAL)  # keep the output to PASS/FAIL lines (full logs: logs/curator.log)
with redirect_stdout(io.StringIO()):  # load_songs prints a progress line
    SONGS = load_game_songs()


class StubModel:
    """Stands in for the Anthropic client and returns queued answers (or raises them)."""

    def __init__(self, *answers):
        self.answers, self.calls, self.messages = list(answers), [], self

    def create(self, **kwargs):
        self.calls.append(kwargs)
        answer = self.answers.pop(0)
        if isinstance(answer, Exception):
            raise answer
        return SimpleNamespace(content=[SimpleNamespace(type="text", text=json.dumps(answer))],
                               stop_reason="end_turn", usage=None)


def curator(*answers, **kw):
    return Curator(SONGS, client=StubModel(*answers), min_interval=0, **kw)


def post(port, path, body):
    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
    conn.request("POST", path, body=body, headers={"Content-Type": "application/json"})
    status = conn.getresponse().status
    conn.close()
    return status


RESULTS = []


def check(name, condition, detail=""):
    RESULTS.append(bool(condition))
    print(f"{'PASS' if condition else 'FAIL'}  {name}" + (f"\n        {detail}" if detail else ""))


def main() -> int:
    ask = {"message": "play something loud", "taste": DEFAULT_TASTE}

    # 1. Wild numbers from the model are clamped, and a made-up mood is rejected.
    wild = {"intent": "recommend", "energy": 500, "valence": -3, "acousticness": 0.5, "mood": "banana"}
    out = curator(wild, {"reply": "ok", "pick_song_id": 1}).handle(ask)
    check("model returns energy=500, valence=-3, mood='banana' -> clamped and rejected",
          out["taste"]["energy"] == 1.0 and out["taste"]["valence"] == 0.0 and out["taste"]["mood"] == "",
          f"game receives taste = {out['taste']}")

    # 2. A pick the retrieval step never returned is replaced.
    calm = {"intent": "recommend", "energy": 0.2, "valence": 0.5, "acousticness": 0.6, "mood": "focused"}
    out = curator(calm, {"reply": "Try this one.", "pick_song_id": 999999}).handle(ask)
    check("model picks song id 999999 (not in the catalog) -> replaced by a retrieved song",
          out["pick"]["id"] != 999999 and out["pick"]["id"] in {s["id"] for s in SONGS},
          f"pick = {out['pick']}")

    # 3. "Explain" questions never move the sliders.
    explain = {"intent": "explain", "energy": 0.0, "valence": 0.0, "acousticness": 0.0, "mood": "happy"}
    out = curator(explain, {"reply": "Because.", "pick_song_id": 1}).handle({**ask, "song_id": SONGS[3]["id"]})
    check("explain intent -> sliders unchanged and the on-screen song is the one explained",
          out["taste"] is None and out["pick"]["id"] == SONGS[3]["id"], f"taste = {out['taste']}")

    # 4. Long input is truncated before it reaches the model.
    c = curator(calm, {"reply": "ok", "pick_song_id": 1})
    c.handle({"message": "x" * 5000, "taste": DEFAULT_TASTE})
    sent = len(json.loads(c.client.calls[0]["messages"][0]["content"])["message"])
    check("5000-character message -> truncated to 300 before the model call", sent == 300, f"sent {sent} characters")

    # 5. Empty and malformed requests are rejected politely.
    check("empty message -> rejected", curator().handle({"message": "   "})["ok"] is False)
    check("non-JSON-object request -> rejected", curator().handle("hello")["ok"] is False)

    # 6-8. The model is unavailable: fall back to retrieval-only, never crash.
    out = Curator(SONGS, client=None, min_interval=0).handle(ask)
    check("no API key -> retrieval-only answer from the real scores",
          out["ok"] and out["degraded"] and out["taste"] is None, f"reply = {out['reply'][:110]}...")
    err = anthropic.APIConnectionError(request=httpx2.Request("POST", "https://example.com"))
    out = curator(err).handle(ask)
    check("API connection error -> retrieval-only answer", out["ok"] and out["degraded"])
    out = curator({"intent": "recommend"}, {"reply": "partial"}).handle(ask)
    check("model returns incomplete JSON -> still a valid answer", out["ok"])

    # 9-10. Cost protection.
    c = curator(calm, {"reply": "ok", "pick_song_id": 1}, max_calls=2)
    first, second = c.handle(ask), c.handle(ask)
    check("call budget of 2 spent after one chat message -> next message falls back",
          not first["degraded"] and second["degraded"])
    slow = Curator(SONGS, client=StubModel(calm, {"reply": "ok", "pick_song_id": 1}), min_interval=60)
    slow.handle(ask)
    check("second message within the rate-limit window -> refused", slow.handle(ask)["ok"] is False)

    # 11-13. The HTTP endpoint.
    server = make_server(0, curator=SimpleNamespace(handle=lambda payload: {"ok": True}))
    port = server.server_address[1]
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        check("POST with a 10,000-byte body -> 413", post(port, "/api/curator", b"x" * 10000) == 413)
        check("POST with invalid JSON -> 400", post(port, "/api/curator", b"{oops") == 400)
        check("POST to an unknown path -> 404", post(port, "/api/other", b"{}") == 404)
    finally:
        server.shutdown()
        server.server_close()

    print(f"\n{sum(RESULTS)}/{len(RESULTS)} guardrail checks passed")
    return 0 if all(RESULTS) else 1


if __name__ == "__main__":
    sys.exit(main())
