import random

FACE_MATCH_THRESHOLD = 0.60  # Lowered for demo

def compare_faces(id_image_path: str, selfie_path: str) -> dict:
    """
    Simulated face match — in production use DeepFace or AWS Rekognition.
    """
    confidence = round(random.uniform(0.78, 0.95), 2)
    passed = confidence >= FACE_MATCH_THRESHOLD
    return {
        "match": passed,
        "confidence": confidence,
        "threshold": FACE_MATCH_THRESHOLD,
        "method": "simulated",
        "reason": "Face match passed" if passed else f"Confidence {confidence:.0%} below threshold"
    }