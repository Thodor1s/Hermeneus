const greekRegex = /[\u0370-\u03ff\u1f00-\u1fff]/u;
const letterRegex = /\p{L}/gu;

export function greekRatio(text: string): number {
  const letters = text.match(letterRegex) ?? [];
  if (letters.length === 0) {
    return 0;
  }
  const greekLetters = letters.filter((letter) => greekRegex.test(letter)).length;
  return greekLetters / letters.length;
}

export function isMostlyGreek(text: string, threshold = 0.6): boolean {
  return greekRatio(text) >= threshold;
}

export function bilingualDecline(languageName = "τη ζητούμενη γλώσσα"): string {
  return [
    `Αυτό το σύστημα έχει εκπαιδευτεί μόνο σε ελληνικά κείμενα και δεν μπορεί να παράγει κείμενο στη γλώσσα ${languageName}. Παρακαλώ διατυπώστε το αίτημα στα ελληνικά.`,
    `This system was trained only on Greek texts and cannot produce text in ${languageName}. Please ask the question in Greek.`,
  ].join("\n\n");
}
