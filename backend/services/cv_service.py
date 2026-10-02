from computer_vision.preprocessing import preprocess_hand
from computer_vision.feature_extraction import extract_features
from computer_vision.pattern_matching import match_pattern


def recognize_frame(frame):

    # =====================================================
    # STEP 1 — PREPROCESSING
    # =====================================================

    mask, contour = preprocess_hand(frame)

    # No hand detected
    if contour is None:

        return {
            "recognized": False,
            "label": "No hand detected",
            "confidence": 0,
            "finger_count": 0,
            "features": {}
        }

    # =====================================================
    # STEP 2 — FEATURE EXTRACTION
    # =====================================================

    features = extract_features(
        contour,
        mask
    )

    # =====================================================
    # STEP 3 — PATTERN MATCHING
    # =====================================================

    match = match_pattern(
        features
    )

    # =====================================================
    # STEP 4 — FINAL RESULT
    # =====================================================

    return {
        "recognized": match["label"] != "Unknown",

        "label": match["label"],

        "confidence": match["confidence"],

        "finger_count": features["finger_count"],

        "features": {
            "area": round(
                features["area"],
                2
            ),

            "perimeter": round(
                features["perimeter"],
                2
            ),

            "solidity": round(
                features["solidity"],
                3
            ),

            "aspect_ratio": round(
                features["aspect_ratio"],
                3
            )
        }
    }