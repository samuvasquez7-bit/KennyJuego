from pathlib import Path
from wsgiref.simple_server import make_server
import mimetypes
import sys
import argparse


BASE_DIR = Path(__file__).resolve().parent


def application(environ, start_response):
    """WSGI entry point for PythonAnywhere and other WSGI hosts."""
    path = environ.get("PATH_INFO", "/")
    is_static_file = False
    if path == "/":
        file_path = BASE_DIR / "templates" / "index.html"
    elif path.startswith("/static/"):
        is_static_file = True
        file_path = BASE_DIR / "static" / path.removeprefix("/static/")
    else:
        start_response("404 Not Found", [("Content-Type", "text/plain; charset=utf-8")])
        return [b"Not found"]

    try:
        if is_static_file and BASE_DIR / "static" not in file_path.parents:
            raise ValueError("Path is outside the static directory")
        content = file_path.read_bytes()
    except (OSError, ValueError):
        start_response("404 Not Found", [("Content-Type", "text/plain; charset=utf-8")])
        return [b"Not found"]

    content_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
    start_response("200 OK", [("Content-Type", content_type)])
    return [content]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Kenny's English game")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    with make_server(args.host, args.port, application) as server:
        print(f"Game running at http://{args.host}:{args.port}")
        print("Press Ctrl+C to stop the server.")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")