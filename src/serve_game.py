"""
Serve the 3D game on http://localhost:8000 and open it in your browser.

    python -m src.serve_game [port]

Why a server? Browsers refuse to let a page opened straight from disk
(file://) call the iTunes API, so the real song previews can't load that way.
Serving over http://localhost fixes it. Standard library only.

What is served:
  /          -> game/index.html (the page)
  /assets/*  -> the project's assets/ folder (scripts, styles, data, images)
  POST /api/curator -> the Curator butler (see src/curator.py). The API key stays here.
Nothing else in the project (.git, .venv, source code) is reachable.
"""

import json
import os
import sys
import urllib.parse
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME_DIR = os.path.join(ROOT, "game")
ASSETS_DIR = os.path.join(ROOT, "assets")
ASSETS_PREFIX = "/assets/"


MAX_BODY_BYTES = 4096  # a chat message is tiny; refuse anything bigger

_default_curator = None


def get_default_curator():
    """Build the real curator on first use (so serving the game never needs an API key)."""
    global _default_curator
    if _default_curator is None:
        from src.curator import build_curator
        _default_curator = build_curator()
    return _default_curator


class GameHandler(SimpleHTTPRequestHandler):
    curator = None  # tests inject a fake; None means "use the real one"

    def _send_json(self, status: int, body: dict) -> None:
        data = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self) -> None:
        if urllib.parse.urlsplit(self.path).path != "/api/curator":
            return self._send_json(404, {"ok": False, "reply": "Not found."})
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = -1
        if length < 0 or length > MAX_BODY_BYTES:
            # Read (a bounded amount of) the unwanted body first, or some clients see a reset
            # connection instead of our 413 reply.
            self.rfile.read(min(max(length, 0), 65536))
            self.close_connection = True
            return self._send_json(413, {"ok": False, "reply": "That message is too long."})
        try:
            payload = json.loads(self.rfile.read(length) or b"null")
        except ValueError:
            return self._send_json(400, {"ok": False, "reply": "I could not read that request."})
        try:
            result = (self.curator or get_default_curator()).handle(payload)
        except Exception:
            return self._send_json(500, {"ok": False, "reply": "The curator is indisposed. Do carry on."})
        self._send_json(200, result)

    def translate_path(self, path: str) -> str:
        url_path = urllib.parse.unquote(urllib.parse.urlsplit(path).path)
        if url_path.startswith(ASSETS_PREFIX):
            parts = [p for p in url_path[len(ASSETS_PREFIX):].split("/") if p not in ("", ".")]
            if ".." in parts:  # refuse anything that tries to climb out of assets/
                return os.path.join(ASSETS_DIR, "__blocked__")
            return os.path.join(ASSETS_DIR, *parts)
        return super().translate_path(path)  # falls back to GAME_DIR

    def log_message(self, fmt, *args):  # keep the terminal clean
        pass


def make_server(port: int, curator=None) -> ThreadingHTTPServer:
    handler_cls = type("BoundGameHandler", (GameHandler,), {"curator": curator})
    handler = partial(handler_cls, directory=GAME_DIR)
    return ThreadingHTTPServer(("127.0.0.1", port), handler)


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = make_server(port)
    url = f"http://localhost:{port}/"
    print(f"Genre Hallway running at {url}  (Ctrl+C to stop)")
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
