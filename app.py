import argparse
from flask import Flask, render_template


app = Flask(__name__, template_folder="templates", static_folder="static")
application = app


@app.route("/")
def home():
    return render_template("index.html")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Kenny's English game")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    app.run(host=args.host, port=args.port, debug=False)
