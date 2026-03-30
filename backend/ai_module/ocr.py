import random

def extract_aadhar_details(image_path: str, booking_name: str = "") -> dict:
    """
    Simulates OCR extraction from Aadhar card.
    For demo: returns the booking name to ensure verification passes.
    In production: replace with pytesseract or Google Vision API.
    """
    ocr_confidence = random.uniform(0.85, 0.98)

    # For demo — use booking name so it always matches
    extracted_name = booking_name if booking_name else "Guest User"
    extracted_aadhar = f"{random.randint(1000,9999)} {random.randint(1000,9999)} {random.randint(1000,9999)}"

    return {
        "extracted_name": extracted_name,
        "aadhar_number": extracted_aadhar,
        "ocr_confidence": round(ocr_confidence, 2),
        "raw_text": f"Name: {extracted_name}\nAadhar: {extracted_aadhar}\nDOB: 01/01/1995",
        "source": "mock_ocr"
    }


def compare_names(ocr_name: str, booking_name: str) -> dict:
    ocr_clean = ocr_name.lower().strip()
    booking_clean = booking_name.lower().strip()

    if ocr_clean == booking_clean:
        return {"match": True, "score": 1.0, "reason": "Exact match"}

    ocr_parts = set(ocr_clean.split())
    booking_parts = set(booking_clean.split())
    common = ocr_parts.intersection(booking_parts)

    if common:
        score = len(common) / max(len(ocr_parts), len(booking_parts))
        if score >= 0.3:
            return {"match": True, "score": round(score, 2), "reason": "Partial name match"}

    return {"match": False, "score": 0.0, "reason": f"Name mismatch"}