import { type ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { accessCollection, auth, db, googleProvider } from "../lib/firebase";

type AuthGateProps = {
  children: (context: { user: User; allowed: boolean }) => ReactNode;
};

function AccessDenied({ user }: { user: User }) {
  return (
    <section className="card">
      <p className="eyebrow">Access</p>
      <h2>Your account has not been provisioned yet.</h2>
      <p>
        You signed in as <strong>{user.email}</strong>, but no matching document was found in the Firestore collection{" "}
        <code>{accessCollection}</code>.
      </p>
      <button className="secondary-button" onClick={() => void signOut(auth)}>
        Sign out
      </button>
    </section>
  );
}

async function isProvisioned(email: string | null): Promise<boolean> {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = collection(db, accessCollection);
  console.log(users);
  console.log(normalizedEmail)

  const byDocumentId = await getDoc(doc(db, accessCollection, normalizedEmail));
  console.log(byDocumentId);
  if (byDocumentId.exists()) {
    return true;
  }

  const byEmailField = await getDocs(query(users, where("email", "==", normalizedEmail), limit(1)));
    console.log(byEmailField);
  if (!byEmailField.empty) {
    return true;
  }

  const byIdField = await getDocs(query(users, where("id", "==", normalizedEmail), limit(1)));
      console.log(byIdField);
  return !byIdField.empty;
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
        setAllowed(await isProvisioned(nextUser.email));
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
        <h2>Checking identity and Firestore provisioning...</h2>
      </section>
    );
  }

  if (error) {
    console.log(error)
    return (
      <section className="card">
        <p className="eyebrow">Firebase Error</p>
        <h2>Access could not be verified.</h2>
        <p>{error}</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="card">
        <p className="eyebrow">Hermeneus</p>
        <h1>Greek research interface for provisioned users</h1>
        <p>
          Sign in with Google, then the app checks Firestore collection <code>{accessCollection}</code> for a matching
          email record.
        </p>
        <button className="primary-button" onClick={() => void handleGoogleSignIn()}>
          Sign in with Google
        </button>
      </section>
    );
  }

  if (!allowed) {
    return <AccessDenied user={user} />;
  }

  return <>{children({ user, allowed })}</>;
}
