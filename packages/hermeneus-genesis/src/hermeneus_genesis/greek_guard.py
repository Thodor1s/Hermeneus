from __future__ import annotations

def _is_greek_char(char: str) -> bool:
    codepoint = ord(char)
    return 0x0370 <= codepoint <= 0x03FF or 0x1F00 <= codepoint <= 0x1FFF


def _greek_ratio(text: str) -> float:
    relevant = [char for char in text if char.isalpha()]
    if not relevant:
        return 0.0
    greek_chars = sum(1 for char in relevant if _is_greek_char(char))
    return greek_chars / len(relevant)


def is_greek_prompt(text: str) -> bool:
    return _greek_ratio(text) >= 0.6


def bilingual_decline(language_name: str = "the requested language") -> str:
    return (
        f"Αυτό το σύστημα έχει εκπαιδευτεί μόνο σε ελληνικά κείμενα και δεν μπορεί να παράγει αξιόπιστο κείμενο στη γλώσσα {language_name}. "
        "Παρακαλώ διατυπώστε το αίτημα στα ελληνικά.\n\n"
        f"This system was trained only on Greek texts and cannot produce reliable text in {language_name}. "
        "Please ask the question in Greek."
    )
