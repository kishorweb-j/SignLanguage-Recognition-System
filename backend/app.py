import sys
from pathlib import Path
import base64

# =========================================================
# PROJECT ROOT
# =========================================================

ROOT = Path(__file__).resolve().parents[1]

# Allow Python to find:
# computer_vision/
# backend/
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))


# =========================================================
# IMPORTS
# =========================================================

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

import cv2
import numpy as np

from services.cv_service import recognize_frame


# =========================================================
# FRONTEND
# =========================================================

FRONTEND = ROOT / "frontend"


# =========================================================
# FLASK APP
# =========================================================

app = Flask(
    __name__,
    static_folder=str(FRONTEND),
    static_url_path=""
)

CORS(app)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def index():
    return send_from_directory(
        FRONTEND,
        "index.html"
    )


# =========================================================
# FRONTEND FILES
# =========================================================

@app.get("/<path:path>")
def frontend_file(path):

    target = FRONTEND / path

    if target.exists() and target.is_file():
        return send_from_directory(
            FRONTEND,
            path
        )

    return send_from_directory(
        FRONTEND,
        "index.html"
    )


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/api/health")
def health():

    return jsonify({
        "status": "ok",
        "service": "sign-language-recognition"
    })


# =========================================================
# SIGN RECOGNITION API
# =========================================================

@app.post("/api/recognize")
def recognize():

    data = request.get_json(
        silent=True
    ) or {}

    image_data = data.get(
        "image",
        ""
    )

    if not image_data:

        return jsonify({
            "error": "No image supplied"
        }), 400

    try:

        # Remove data URL prefix
        if "," in image_data:

            image_data = image_data.split(
                ",",
                1
            )[1]

        # Base64 → bytes
        raw = base64.b64decode(
            image_data
        )

        # Bytes → OpenCV image
        frame = cv2.imdecode(
            np.frombuffer(
                raw,
                dtype=np.uint8
            ),
            cv2.IMREAD_COLOR
        )

        if frame is None:

            return jsonify({
                "error": "Invalid image"
            }), 400

        # Computer Vision recognition
        result = recognize_frame(
            frame
        )

        return jsonify(result)

    except Exception as exc:

        print(
            "Recognition error:",
            exc
        )

        return jsonify({
            "error": f"Recognition failed: {exc}"
        }), 500


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    print("=" * 60)
    print("SignVoice - Sign Language Recognition System")
    print("=" * 60)
    print("Frontend : http://127.0.0.1:5000")
    print("Health   : http://127.0.0.1:5000/api/health")
    print("API      : http://127.0.0.1:5000/api/recognize")
    print("=" * 60)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )