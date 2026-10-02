import cv2
import numpy as np

def count_fingers(contour):
    hull_indices = cv2.convexHull(contour, returnPoints=False)
    if hull_indices is None or len(hull_indices) < 4:
        return 0

    defects = cv2.convexityDefects(contour, hull_indices)
    if defects is None:
        return 0

    count = 0
    for i in range(defects.shape[0]):
        s, e, f, depth = defects[i, 0]
        start, end, far = contour[s][0], contour[e][0], contour[f][0]
        a = np.linalg.norm(end - start)
        b = np.linalg.norm(far - start)
        c = np.linalg.norm(end - far)
        if b == 0 or c == 0:
            continue

        cos_angle = (b*b + c*c - a*a) / (2*b*c)
        angle = np.degrees(np.arccos(np.clip(cos_angle, -1, 1)))
        depth_value = depth / 256.0

        if angle < 80 and depth_value > 10:
            count += 1

    return min(count + 1, 5)

def extract_features(contour, mask):
    area = cv2.contourArea(contour)
    perimeter = cv2.arcLength(contour, True)
    hull = cv2.convexHull(contour)
    hull_area = max(cv2.contourArea(hull), 1.0)
    solidity = area / hull_area
    x, y, w, h = cv2.boundingRect(contour)

    return {
        "area": area,
        "perimeter": perimeter,
        "solidity": solidity,
        "aspect_ratio": w / max(h, 1),
        "finger_count": count_fingers(contour)
    }
