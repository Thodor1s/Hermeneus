import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import archaicGif from "./assets/archaic.gif";
import byzantineGif from "./assets/byzantine.gif";
import classicalGif from "./assets/classical.gif";
import demoticGif from "./assets/demotic.gif";
import katharevousaGif from "./assets/katharevousa.gif";
import koineGif from "./assets/koine.gif";
import logo from "./assets/logo.png";
import { AuthGate } from "./components/AuthGate";
import { auth } from "./lib/firebase";
import { infer, type GreekForm, type InferenceResult, type RequestType } from "./lib/inference";

type ScriptSample = {
  label: GreekForm;
  period: string;
  gif: string;
  prompt: string;
};

const DEMOTIC_FORM: GreekForm = "Δημοτική";
const greekForms: GreekForm[] = ["Αρχαϊκή", "Κλασική", "Κοινή", "Μεσαιωνική", "Καθαρεύουσα", DEMOTIC_FORM];

const scriptSamples: ScriptSample[] = [
  {
    label: "Αρχαϊκή",
    period: "8ος-6ος αι. π.Χ.",
    gif: archaicGif,
    prompt: "Εντόπισε παραπομπές για αρχαϊκή επιγραφή και το ιστορικό της πλαίσιο.",
  },
  {
    label: "Κλασική",
    period: "5ος-4ος αι. π.Χ.",
    gif: classicalGif,
    prompt: "Βρες παραπομπές για τη σκηνή της Αθηνάς στην Οδύσσεια και τη σημασία της.",
  },
  {
    label: "Κοινή",
    period: "Ελληνιστική περίοδος",
    gif: koineGif,
    prompt: "Δώσε παραπομπές για τη μετάβαση από την κλασική ελληνική στην Ελληνιστική Κοινή.",
  },
  {
    label: "Μεσαιωνική",
    period: "Βυζαντινή περίοδος",
    gif: byzantineGif,
    prompt: "Βρες χωρία για τη διοικητική ορολογία της μεσαιωνικής ελληνικής.",
  },
  {
    label: "Καθαρεύουσα",
    period: "19ος αι.",
    gif: katharevousaGif,
    prompt: "Εντόπισε παραπομπές για ύφος και σύνταξη της καθαρεύουσας.",
  },
  {
    label: "Δημοτική",
    period: "Σύγχρονη περίοδος",
    gif: demoticGif,
    prompt: "Ποιός ήταν ο Αριστοτέλης;",
  },
];

function HoverGif({ src, alt }: { src: string; alt: string }) {
  const [poster, setPoster] = useState<string>(src);

  useEffect(() => {
    let active = true;
    const image = new Image();
    image.src = src;
    image.onload = () => {
      if (!active) {
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || 96;
      canvas.height = image.naturalHeight || 96;
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.drawImage(image, 0, 0);
      setPoster(canvas.toDataURL("image/png"));
    };

    return () => {
      active = false;
    };
  }, [src]);

  return (
    <span className="script-chip-media" aria-hidden="true">
      <img className="script-chip-poster" src={poster} alt="" />
      <img className="script-chip-gif" src={src} alt={alt} />
    </span>
  );
}

function ScriptChip({
  sample,
  onSelect,
}: {
  sample: ScriptSample;
  onSelect: (prompt: string, form: GreekForm) => void;
}) {
  const enabled = sample.label === DEMOTIC_FORM;

  return (
    <button
      className={`script-chip ${enabled ? "" : "script-chip-disabled"}`.trim()}
      type="button"
      disabled={!enabled}
      onClick={() => onSelect(sample.prompt, sample.label)}
    >
      <HoverGif src={sample.gif} alt={`Δείγμα γραφής για ${sample.label}`} />
      <span className="script-chip-copy">
        <strong>{sample.label}</strong>
        <small>{enabled ? sample.period : `${sample.period} · σύντομα`}</small>
      </span>
    </button>
  );
}

const requestTypeLabels: Record<RequestType, string> = {
  citations: "Παραπομπές",
  interpretation: "Ερμηνεία",
  translation: "Μετάφραση",
};

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [targetForm, setTargetForm] = useState<GreekForm>(DEMOTIC_FORM);
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(requestType: RequestType) {
    setBusy(true);
    setError(null);
    try {
      setResult(
        await infer({
          prompt,
          requestType,
          targetForm: requestType === "translation" ? targetForm : null,
        }),
      );
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Άγνωστο σφάλμα κατά την αναζήτηση παραπομπών.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="ambient ambient-c" />
      <AuthGate>
        {({ user }) => (
          <div className="layout">
            <section className="hero">
              <div className="hero-topbar">
                <div className="brand">
                  <span className="brand-mark">
                    <img src={logo} alt="Λογότυπο του Hermeneus" />
                  </span>
                  <div className="brand-copy">
                    <h1 className="brand-title">Hermeneus</h1>
                    <p className="brand-subtitle">Το ελληνόγλωσσο RAG </p>
                  </div>
                </div>
                <div className="session-pill">
                  <span>{user.email}</span>
                  <button className="secondary-button" onClick={() => void signOut(auth)}>
                    Αποσύνδεση
                  </button>
                </div>
              </div>

              <div className="hero-grid">
                <div className="hero-copy">
                  <p className="eyebrow">Citations needed</p>
                  <h2>Το ελληνικό σύστημα αναζήτησης παραπομπών</h2>
                  <p className="lead">
                    Το εργαλείο Hermeneus λειτουργεί ως μηχανή αναζήτησης τεκμηρίων. Κάθε λειτουργία επιστρέφει παραπομπές από το διαθέσιμο ευρετήριο χωρίς να παράγει ελεύθερο κείμενο. Η ερμηνεία και η μετάφραση αντιμετωπίζονται ως λειτουργίες αναζήτησης χωρίων και όχι ως ελεύθερη παραγωγή κειμένου.
                  </p>

                  <div className="hero-metrics">
                    <article>
                      <span>3</span>
                      <p>λειτουργίες αναζήτησης: παραπομπές, ερμηνεία, μετάφραση</p>
                    </article>
                    <article>
                      <span>6</span>
                      <p>μορφές της ελληνικής γλώσσας για στοχευμένη μετάφραση</p>
                    </article>
                    <article>
                      <span>RAG</span>
                      <p>αναζήτηση πηγών τεκμηρίωσης συμβατή με μοντέλα AI</p>
                    </article>
                  </div>
                </div>

                <aside className="hero-aside">
                  <p className="eyebrow">Μορφές Ελληνικής Γλώσσας</p>
                  <div className="script-grid">
                    {scriptSamples.map((sample) => (
                      <ScriptChip
                        key={sample.label}
                        sample={sample}
                        onSelect={(nextPrompt, form) => {
                          setPrompt(nextPrompt);
                          setTargetForm(form);
                        }}
                      />
                    ))}
                  </div>
                </aside>
              </div>
            </section>

            <section className="panel composer-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Αίτημα</p>
                  <h2>Ερώτημα ή κείμενο προς αναζήτηση παραπομπών</h2>
                </div>
              </div>

              <label className="field">
                <span>Εισαγωγή</span>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Γράψτε στα ελληνικά. Π.χ. Βρες παραπομπές για τη γλώσσα της Οδύσσειας ή για τη χρήση της καθαρεύουσας."
                  rows={10}
                />
              </label>

              <div className="request-toolbar">
                <div className="translation-picker">
                  <label className="field compact-field">
                    <span>Μετάφραση σε</span>
                    <select value={targetForm} onChange={(event) => setTargetForm(event.target.value as GreekForm)}>
                      {greekForms.map((form) => (
                        <option key={form} value={form} disabled={form !== DEMOTIC_FORM}>
                          {form}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <p className="action-hint">Κάθε λειτουργία επιστρέφει μόνο παραπομπές. Προς το παρόν είναι ενεργή μόνο η Δημοτική.</p>
              </div>

              <div className="actions action-stack">
                <button className="primary-button mode-button" disabled={busy || !prompt.trim()} onClick={() => void handleSubmit("citations")}>
                  {busy ? "Αναζήτηση..." : "Παραπομπές"}
                </button>
                <button className="primary-button mode-button" disabled={busy || !prompt.trim()} onClick={() => void handleSubmit("interpretation")}>
                  {busy ? "Αναζήτηση..." : "Ερμηνεία"}
                </button>
                <button className="primary-button mode-button translation-button" disabled={busy || !prompt.trim()} onClick={() => void handleSubmit("translation")}>
                  {busy ? "Αναζήτηση..." : `Μετάφραση σε ${targetForm}`}
                </button>
              </div>

              {error ? <p className="error">{error}</p> : null}
            </section>

            <section className="panel result-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Αποτέλεσμα</p>
                  <h2>{result ? `Λειτουργία: ${requestTypeLabels[result.requestType]}` : "Οι παραπομπές θα εμφανιστούν εδώ"}</h2>
                </div>
                <div className="result-status">{result ? "Έτοιμο" : "Σε αναμονή αιτήματος"}</div>
              </div>

              <div className="request-summary">
                <article className="summary-card">
                  <span>Τύπος</span>
                  <strong>{result ? requestTypeLabels[result.requestType] : "Χωρίς αίτημα"}</strong>
                </article>
                <article className="summary-card">
                  <span>Στόχος</span>
                  <strong>{result?.targetForm ?? "Δεν ορίστηκε"}</strong>
                </article>
                <article className="summary-card">
                  <span>Engine</span>
                  <strong>{result?.mode ?? "stub"}</strong>
                </article>
              </div>

              <div className="citations">
                <div className="citations-header">
                  <p className="eyebrow">Παραπομπές</p>
                  <span>{result?.citations.length ?? 0}</span>
                </div>
                {result?.citations.length ? (
                  result.citations.map((citation) => (
                    <article key={`${citation.label}-${citation.excerpt}`} className="citation-card">
                      <h3>{citation.label}</h3>
                      <p>{citation.excerpt}</p>
                    </article>
                  ))
                ) : (
                  <p className="empty-state">Υποβάλετε αίτημα για να εμφανιστούν μόνο παραπομπές από το corpus.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </AuthGate>
    </main>
  );
}
