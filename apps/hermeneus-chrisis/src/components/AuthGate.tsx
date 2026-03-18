import { type ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { accessCollection, auth, db, googleProvider } from "../lib/firebase";

type AuthGateProps = {
  children: (context: { user: User; allowed: boolean }) => ReactNode;
};

function AccessDenied({ user }: { user: User }) {
  return (
    <section className="card">
      <p className="eyebrow">Πρόσβαση</p>
      <h2>Ο λογαριασμός σας δεν έχει ενεργοποιηθεί.</h2>
      <p>
        Συνδεθήκατε ως <strong>{user.email}</strong>, αλλά η εγγραφή σας στο Firestore δεν έχει
        πεδίο <code>allowed: true</code>.
      </p>
      <button className="secondary-button" onClick={() => void signOut(auth)}>
        Αποσύνδεση
      </button>
    </section>
  );
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setLoading(true);
      setError(null);
      setUser(nextUser);

      if (!nextUser) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, accessCollection, nextUser.uid));
        setAllowed(Boolean(snapshot.data()?.allowed));
      } catch (accessError) {
        setAllowed(false);
        setError(accessError instanceof Error ? accessError.message : "Unknown Firebase error");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function handleGoogleSignIn() {
    setError(null);
    googleProvider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, googleProvider);
  }

  if (loading) {
    return (
      <section className="card">
        <p className="eyebrow">Hermeneus</p>
        <h2>Έλεγχος ταυτότητας και πρόσβασης...</h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card">
        <p className="eyebrow">Σφάλμα Firebase</p>
        <h2>Η πρόσβαση δεν μπόρεσε να επιβεβαιωθεί.</h2>
        <p>{error}</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="card">
        <p className="eyebrow">Hermeneus Chrisis</p>
        <h1>Ελληνικό ερευνητικό περιβάλλον γλωσσικού μοντέλου</h1>
        <p>Η χρήση προστατεύεται με Firebase Authentication και allow-list στο Firestore.</p>
        <button className="primary-button" onClick={() => void handleGoogleSignIn()}>
          Σύνδεση με Google
        </button>
      </section>
    );
  }

  if (!allowed) {
    return <AccessDenied user={user} />;
  }

  return <>{children({ user, allowed })}</>;
}
