import { useState } from "react";
import { signOut } from "firebase/auth";
import { AuthGate } from "./components/AuthGate";
import { auth } from "./lib/firebase";
import { infer, type InferenceResult } from "./lib/inference";

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
      setError(submissionError instanceof Error ? submissionError.message : "Unknown inference error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <div className="backdrop backdrop-left" />
      <div className="backdrop backdrop-right" />
      <AuthGate>
        {({ user }) => (
          <div className="layout">
            <section className="hero">
              <p className="eyebrow">Hermeneus</p>
              <h1>Γλωσσικό μοντέλο ελληνικών κειμένων από την αρχαιότητα έως σήμερα</h1>
              <p className="lead">
                Η διεπαφή είναι σχεδιασμένη για ελληνικό input, παραπομπές σε πηγές και ελεγχόμενη
                πρόσβαση ερευνητών.
              </p>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Σύνδεση</p>
                  <h2>{user.email}</h2>
                </div>
                <button className="secondary-button" onClick={() => void signOut(auth)}>
                  Αποσύνδεση
                </button>
              </div>

              <label className="field">
                <span>Ερώτημα ή κείμενο προς μετάφραση</span>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Γράψτε στα ελληνικά. Π.χ. Σε ποιο σημείο στην Οδύσσεια η Αθηνά σταματάει τη μάχη;"
                  rows={9}
                />
              </label>

              <div className="actions">
                <button className="primary-button" disabled={busy || !prompt.trim()} onClick={() => void handleSubmit()}>
                  {busy ? "Επεξεργασία..." : "Υποβολή"}
                </button>
              </div>

              {error ? <p className="error">{error}</p> : null}
            </section>

            <section className="panel result-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Απόκριση</p>
                  <h2>{result ? `Λειτουργία: ${result.mode}` : "Δεν υπάρχει ακόμη απόκριση"}</h2>
                </div>
              </div>

              <div className="response-box">
                {result?.answer || "Η απόκριση του μοντέλου θα εμφανιστεί εδώ."}
              </div>

              <div className="citations">
                <p className="eyebrow">Παραπομπές</p>
                {result?.citations.length ? (
                  result.citations.map((citation) => (
                    <article key={`${citation.label}-${citation.excerpt}`} className="citation-card">
                      <h3>{citation.label}</h3>
                      <p>{citation.excerpt}</p>
                    </article>
                  ))
                ) : (
                  <p>Δεν υπάρχουν ακόμη παραπομπές.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </AuthGate>
    </main>
  );
}
