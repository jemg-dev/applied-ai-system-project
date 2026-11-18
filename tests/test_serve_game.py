import http.client
import threading

from src.serve_game import make_server


def _get(port: int, path: str) -> int:
    # http.client sends the path as-is (urllib would tidy away the ".." we want to test)
    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
    conn.request("GET", path)
    status = conn.getresponse().status
    conn.close()
    return status


def test_server_serves_page_and_assets_but_nothing_else():
    server = make_server(0)  # port 0 = any free port
    port = server.server_address[1]
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        assert _get(port, "/") == 200
        assert _get(port, "/assets/css/style.css") == 200
        assert _get(port, "/assets/js/game.js") == 200
        assert _get(port, "/assets/data/game_data.js") == 200
        # Not reachable: project files outside game/ and assets/
        assert _get(port, "/README.md") == 404
        assert _get(port, "/src/recommender.py") == 404
        assert _get(port, "/.git/config") == 404
        # Path traversal out of assets/ is refused
        assert _get(port, "/assets/../README.md") == 404
        assert _get(port, "/assets/%2e%2e/README.md") == 404
        assert _get(port, "/assets/js/../../README.md") == 404
    finally:
        server.shutdown()
        server.server_close()


def test_index_only_references_files_that_exist():
    import os
    import re

    html = open("game/index.html", encoding="utf-8").read()
    refs = re.findall(r'(?:src|href)="(assets/[^"]+)"', html)
    assert refs, "index.html should load things from assets/"
    for ref in refs:
        assert os.path.exists(ref), f"index.html references missing file: {ref}"
