import { bilingualDecline, isMostlyGreek } from "./greek";

export type Citation = {
  label: string;
  excerpt: string;
};

export type InferenceResult = {
  answer: string;
  citations: Citation[];
  mode: "stub" | "api" | "browser";
};

async function runStub(prompt: string): Promise<InferenceResult> {
  if (!isMostlyGreek(prompt)) {
    return {
      answer: bilingualDecline("English or another non-Greek language"),
      citations: [],
      mode: "stub",
    };
  }

  return {
    answer:
      "Η διεπαφή είναι έτοιμη, αλλά το παραγωγικό μοντέλο δεν έχει συνδεθεί ακόμη. Για αξιόπιστες παραπομπές, το επόμενο βήμα είναι να συνδεθεί retrieval index από το hermeneus-prosvasis και μοντέλο από το hermeneus-genesis.",
    citations: [
      {
        label: "Demo citation",
        excerpt: "Συνδέστε εδώ το πραγματικό χωρίο από το ευρετήριο του corpus.",
      },
    ],
    mode: "stub",
  };
}

async function runApi(prompt: string): Promise<InferenceResult> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing VITE_API_BASE_URL for API inference mode.");
  }

  const response = await fetch(`${baseUrl}/infer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`Inference request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as InferenceResult;
  return { ...data, mode: "api" };
}

async function runBrowser(prompt: string): Promise<InferenceResult> {
  if (!isMostlyGreek(prompt)) {
    return {
      answer: bilingualDecline("English or another non-Greek language"),
      citations: [],
      mode: "browser",
    };
  }

  return {
    answer:
      "Η λειτουργία browser inference έχει προβλεφθεί αρχιτεκτονικά, αλλά χρειάζεται μικρό ποσοτικοποιημένο μοντέλο και WebGPU runtime όπως WebLLM ή Transformers.js για να ενεργοποιηθεί.",
    citations: [
      {
        label: "Browser mode note",
        excerpt: "Χρησιμοποιήστε μικρό checkpoint και εξωτερικό retrieval για ακριβείς παραπομπές.",
      },
    ],
    mode: "browser",
  };
}

export async function infer(prompt: string): Promise<InferenceResult> {
  const mode = (import.meta.env.VITE_INFERENCE_MODE || "stub") as "stub" | "api" | "browser";

  if (mode === "api") {
    return runApi(prompt);
  }
  if (mode === "browser") {
    return runBrowser(prompt);
  }
  return runStub(prompt);
}
