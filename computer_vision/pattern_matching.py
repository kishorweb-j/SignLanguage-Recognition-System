LABELS = {
    0: "FIST",
    1: "ONE",
    2: "TWO",
    3: "THREE",
    4: "FOUR",
    5: "HELLO",
}

def match_pattern(features):
    fingers = features.get("finger_count", 0)
    solidity = features.get("solidity", 0)

    if solidity < 0.20:
        return {"label": "Unknown", "confidence": 0}

    label = LABELS.get(fingers, "Unknown")
    confidence = 60 + min(fingers * 6, 30)
    if solidity > 0.55:
        confidence += 5

    return {"label": label, "confidence": min(confidence, 95)}
