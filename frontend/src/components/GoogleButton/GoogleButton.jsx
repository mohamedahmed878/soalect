import { useEffect, useRef, useState } from "react";
import "./googleButton.css";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Renders Google's own "Sign in with Google" button via the Google
 * Identity Services script (loaded in index.html). Silently renders
 * nothing if VITE_GOOGLE_CLIENT_ID isn't configured, so the rest of the
 * auth pages keep working normally without it.
 *
 * Calls onCredential(idToken) and lets the PARENT decide how to log in
 * (through AuthContext) — this component never talks to the API/context
 * directly, so the app's auth state always updates correctly.
 */
export default function GoogleButton({ onCredential }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    let poll;

    function init() {
      if (cancelled || !window.google?.accounts?.id || !containerRef.current) return;

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => onCredential(response.credential),
      });

      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "center",
        width: 360,
      });

      setReady(true);
    }

    if (window.google?.accounts?.id) {
      init();
    } else {
      poll = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(poll);
          init();
        }
      }, 200);
    }

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="google-btn-block">
      <div className="auth-divider"><span>أو</span></div>
      <div ref={containerRef} className="google-btn-mount" />
      {!ready && <p className="google-btn-loading">جاري تحميل تسجيل الدخول بجوجل...</p>}
    </div>
  );
}
