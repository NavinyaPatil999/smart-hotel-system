FACE_THRESHOLD = 0.60
NAME_SCORE_THRESHOLD = 0.3

def run_fraud_check(
    face_confidence: float,
    name_match: bool,
    name_score: float,
    booking_status: str
) -> dict:
    """
    Runs fraud detection logic combining face match + name match + booking status.
    Returns a verdict with full reasoning.

    In production: add ML model trained on fraud patterns.
    """

    reasons = []
    flags = []

    # Check 1 — Face confidence
    if face_confidence < FACE_THRESHOLD:
        flags.append("low_face_confidence")
        reasons.append(f"Face match confidence {face_confidence:.0%} is below threshold {FACE_THRESHOLD:.0%}")

    # Check 2 — Name match
    if not name_match:
        flags.append("name_mismatch")
        reasons.append(f"Name on ID does not match booking name (score: {name_score:.0%})")

    # Check 3 — Booking status
    if booking_status == "checked_in":
        flags.append("already_checked_in")
        reasons.append("This booking has already been checked in — possible duplicate attempt")

    if booking_status == "checked_out":
        flags.append("booking_closed")
        reasons.append("This booking is already checked out")

    if booking_status == "cancelled":
        flags.append("booking_cancelled")
        reasons.append("This booking has been cancelled")

    # Final verdict
    is_fraud = len(flags) > 0
    risk_level = _calculate_risk(flags)

    return {
        "is_fraud": is_fraud,
        "risk_level": risk_level,
        "flags": flags,
        "reasons": reasons,
        "verdict": "REJECTED" if is_fraud else "APPROVED",
        "summary": _build_summary(is_fraud, risk_level, reasons)
    }


def _calculate_risk(flags: list) -> str:
    if len(flags) == 0:
        return "none"
    elif len(flags) == 1:
        return "low" if "low_face_confidence" in flags else "high"
    else:
        return "high"


def _build_summary(is_fraud: bool, risk_level: str, reasons: list) -> str:
    if not is_fraud:
        return "All checks passed. Guest identity verified successfully."
    header = f"Verification failed [{risk_level.upper()} RISK]:"
    return header + " | ".join(reasons)
