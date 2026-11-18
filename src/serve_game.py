"""
Serve the 3D game on http://localhost:8000 and open it in your browser.

    python -m src.serve_game [port]

Why a server? Browsers refuse to let a page opened straight from disk
(file://) call the iTunes API, so the real song previews can't load that way.
Serving over http://localhost fixes it. Standard library only.

What is served:
  /          -> game/index.html (the page)
  /assets/*  -> the project's assets/ folder (scripts, styles, data, images)
Nothing else in the project (.git, .venv, source code) is reachable.
"""

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


class GameHandler(SimpleHTTPRequestHandler):
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


def make_server(port: int) -> ThreadingHTTPServer:
    handler = partial(GameHandler, directory=GAME_DIR)
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
