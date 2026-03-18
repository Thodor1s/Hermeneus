from __future__ import annotations


def is_greek_char(char: str) -> bool:
    codepoint = ord(char)
    return (
        0x0370 <= codepoint <= 0x03FF
        or 0x1F00 <= codepoint <= 0x1FFF
        or char in {" ", "\n", "\t", ".", ",", ";", ":", "·", "-", "«", "»", "(", ")", "!", "?"}
    )


def greek_ratio(text: str) -> float:
    relevant = [char for char in text if char.isalpha()]
    if not relevant:
        return 0.0
    greek_chars = sum(1 for char in relevant if is_greek_char(char))
    return greek_chars / len(relevant)


def mostly_greek(text: str, threshold: float = 0.75) -> bool:
    return greek_ratio(text) >= threshold
