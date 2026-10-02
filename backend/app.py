import sys
from pathlib import Path
import base64
import os

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

# Allow frontend requests from Firebase Hosting
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

        # -------------------------------------------------
        # Remove data URL prefix
        # -------------------------------------------------

        if "," in image_data:
            image_data = image_data.split(
                ",",
                1
            )[1]

        # -------------------------------------------------
        # Base64 → Bytes
        # -------------------------------------------------

        raw = base64.b64decode(
            image_data
        )

        # -------------------------------------------------
        # Bytes → OpenCV Image
        # -------------------------------------------------

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

        # -------------------------------------------------
        # Computer Vision Recognition
        # -------------------------------------------------

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

    # Render provides PORT through environment variable.
    # Local development falls back to port 5000.

    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )

    print("=" * 60)
    print("SignVoice - Sign Language Recognition System")
    print("=" * 60)
    print(f"Server Port : {port}")
    print("Health      : /api/health")
    print("Recognition : /api/recognize")
    print("=" * 60)

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )