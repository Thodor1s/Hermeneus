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
import { infer, type InferenceResult } from "./lib/inference";

type ScriptSample = {
  label: string;
  period: string;
  gif: string;
  prompt: string;
};

const scriptSamples: ScriptSample[] = [
  {
    label: "Αρχαϊκή",
    period: "8ος-6ος αι. π.Χ.",
    gif: archaicGif,
    prompt: "Δώστε σύντομη ερμηνεία μίας αρχαϊκής επιγραφής και εξηγήστε το ιστορικό της πλαίσιο.",
  },
  {
    label: "Κλασική",
    period: "5ος-4ος αι. π.Χ.",
    gif: classicalGif,
    prompt: "Σε ποιο σημείο της Οδύσσειας η Αθηνά ανακόπτει τη σύγκρουση και ποια είναι η σημασία της σκηνής;",
  },
  {
    label: "Κοινή",
    period: "Ελληνιστική περίοδος",
    gif: koineGif,
    prompt: "Εξηγήστε με ένα παράδειγμα πώς μεταβάλλεται η σύνταξη από την κλασική ελληνική στην Ελληνιστική Κοινή.",
  },
  {
    label: "Μεσαιωνική",
    period: "Βυζαντική περίοδος",
    gif: byzantineGif,
    prompt: "Συγκρίνετε τη διοικητική ορολογία της Μεσαιωνικής Ελληνικής με την πολιτική ορολογία της κλασικής ελληνικής.",
  },
  {
    label: "Καθαρεύουσα",
    period: "19ος αι.",
    gif: katharevousaGif,
    prompt: "Αποδώστε ένα σύντομο απόσπασμα καθαρεύουσας στη σύγχρονη νέα ελληνική χωρίς να χαθεί το ύφος του.",
  },
  {
    label: "Δημοτική",
    period: "Σύγχρονη περίοδος",
    gif: demoticGif,
    prompt: "Απαντήστε στη σύγχρονη νέα ελληνική με σαφή και τεκμηριωμένη διατύπωση για κάθε βασικό ισχυρισμό.",
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
  onSelect: (prompt: string) => void;
}) {
  return (
    <button className="script-chip" type="button" onClick={() => onSelect(sample.prompt)}>
      <HoverGif src={sample.gif} alt={`Δείγμα γραφής για ${sample.label}`} />
      <span className="script-chip-copy">
        <strong>{sample.label}</strong>
        <small>{sample.period}</small>
      </span>
    </button>
  );
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setBusy(true);
    setError(null);
    try {
      setResult(await infer(prompt));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Άγνωστο σφάλμα κατά την επεξεργασία του αιτήματος");
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
                    <h1 className="brand-title">ἑρμηνεύς (Hermeneus)</h1>
                    <p className="brand-subtitle">Διεπαφή ερευνητικής ανάλυσης της ελληνικής γλώσσας</p>
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
                  <p className="eyebrow">Από τα έπη του Ομήρου έως τα Νέα ελληνικά</p>
                  <h2>Ερμηνεία και μετάφραση</h2>
                  <p className="lead">
                    Η διεπαφή οργανώνει το ερώτημα, την απάντηση και τις παραπομπές με έμφαση στην ελληνική
                    γλώσσα, στις ιστορικές περιόδους της και στην ακριβή τεκμηρίωση.
                  </p>

                  <div className="hero-metrics">
                    <article>
                      <span>6</span>
                      <p>γλωσσικές περίοδοι ως σημεία ταχείας εκκίνησης</p>
                    </article>
                    <article>
                      <span>GR</span>
                      <p>σχεδιασμένο για ελληνική εισαγωγή και ερευνητικά ερωτήματα</p>
                    </article>
                    <article>
                      <span>RAG</span>
                      <p>έτοιμο για απαντήσεις με χωρία και παραπομπές</p>
                    </article>
                  </div>
                </div>

                <aside className="hero-aside">
                  <p className="eyebrow">Περίοδοι της Ελληνικής Γλώσσας</p>
                  <div className="script-grid">
                    {scriptSamples.map((sample) => (
                      <ScriptChip key={sample.label} sample={sample} onSelect={setPrompt} />
                    ))}
                  </div>
                </aside>
              </div>
            </section>

            <section className="panel composer-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Αίτημα</p>
                  <h2>Ερώτημα ή κείμενο προς ερμηνεία</h2>
                </div>
                <p className="panel-note"></p>
              </div>

              <label className="field">
                <span>Εισαγωγή</span>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Γράψτε στα ελληνικά. Π.χ. Πώς μεταβάλλεται η γλώσσα από την αττική πεζογραφία έως τη σύγχρονη χρήση;"
                  rows={10}
                />
              </label>

              <div className="actions">
                <button className="primary-button" disabled={busy || !prompt.trim()} onClick={() => void handleSubmit()}>
                  {busy ? "Επεξεργασία..." : "Υποβολή αιτήματος"}
                </button>
                <p className="action-hint">Τα λευκά κουμπιά των περιόδων συμπληρώνουν το πεδίο με έτοιμα ερωτήματα.</p>
              </div>

              {error ? <p className="error">{error}</p> : null}
            </section>

            <section className="panel result-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Απάντηση</p>
                  <h2>{result ? `Λειτουργία: ${result.mode}` : "Η απάντηση θα εμφανιστεί εδώ"}</h2>
                </div>
                <div className="result-status">{result ? "Έτοιμη" : "Σε αναμονή αιτήματος"}</div>
              </div>

              <div className="response-box">
                {result?.answer || "Υποβάλετε ένα ερώτημα στα ελληνικά, ώστε να εμφανιστεί εδώ η απάντηση του μοντέλου."}
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
                  <p className="empty-state">Δεν υπάρχουν ακόμη παραπομπές.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </AuthGate>
    </main>
  );
}
