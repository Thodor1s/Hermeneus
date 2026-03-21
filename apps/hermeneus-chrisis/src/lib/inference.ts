import { isMostlyGreek } from "./greek";

export type Citation = {
  label: string;
  excerpt: string;
};

export type RequestType = "citations" | "interpretation" | "translation";

export type GreekForm =
  | "Αρχαϊκή"
  | "Κλασική"
  | "Κοινή"
  | "Μεσαιωνική"
  | "Καθαρεύουσα"
  | "Δημοτική";

export type InferenceRequest = {
  prompt: string;
  requestType: RequestType;
  targetForm?: GreekForm | null;
};

export type InferenceResult = {
  citations: Citation[];
  mode: "stub" | "api" | "browser";
  requestType: RequestType;
  targetForm?: GreekForm | null;
};

function buildStubCitations(request: InferenceRequest): Citation[] {
  const suffix = request.requestType === "translation" && request.targetForm ? ` προς ${request.targetForm}` : "";

  return [
    {
      label: `Αίτημα ${request.requestType}${suffix}`,
      excerpt: "Το σύστημα επιστρέφει μόνο παραπομπές. Το παραγωγικό retrieval endpoint δεν έχει συνδεθεί ακόμη.",
    },
    {
      label: "Πηγή corpus",
      excerpt: "Συνδέστε εδώ το πραγματικό χωρίο από το ευρετήριο του corpus και το passage_id από το hermeneus-genesis.",
    },
    {
      label: "Σημείωση διεπαφής",
      excerpt: "Η ερμηνεία και η μετάφραση αντιμετωπίζονται ως λειτουργίες αναζήτησης χωρίων και όχι ως ελεύθερη παραγωγή κειμένου.",
    },
  ];
}

async function runStub(request: InferenceRequest): Promise<InferenceResult> {
  if (!isMostlyGreek(request.prompt)) {
    throw new Error("Το αίτημα πρέπει να δοθεί στα ελληνικά.");
  }

  return {
    citations: buildStubCitations(request),
    mode: "stub",
    requestType: request.requestType,
    targetForm: request.targetForm ?? null,
  };
}

async function runApi(request: InferenceRequest): Promise<InferenceResult> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing VITE_API_BASE_URL for API inference mode.");
  }

  const response = await fetch(`${baseUrl}/infer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Inference request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as InferenceResult;
  return {
    ...data,
    mode: "api",
    requestType: data.requestType ?? request.requestType,
    targetForm: data.targetForm ?? request.targetForm ?? null,
  };
}

async function runBrowser(request: InferenceRequest): Promise<InferenceResult> {
  if (!isMostlyGreek(request.prompt)) {
    throw new Error("Το αίτημα πρέπει να δοθεί στα ελληνικά.");
  }

  return {
    citations: [
      {
        label: "Browser mode note",
        excerpt:
          "Η λειτουργία browser inference δεν είναι ακόμη συνδεδεμένη. Για ακριβείς παραπομπές χρειάζεται εξωτερικό retrieval API.",
      },
    ],
    mode: "browser",
    requestType: request.requestType,
    targetForm: request.targetForm ?? null,
  };
}

export async function infer(request: InferenceRequest): Promise<InferenceResult> {
  const mode = (import.meta.env.VITE_INFERENCE_MODE || "stub") as "stub" | "api" | "browser";

  if (mode === "api") {
    return runApi(request);
  }
  if (mode === "browser") {
    return runBrowser(request);
  }
  return runStub(request);
}
