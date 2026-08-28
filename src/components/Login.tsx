import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Portal = "student" | "admin" | "dev";

const PORTALS: { id: Portal; name: string; blurb: string }[] = [
  { id: "student", name: "Student", blurb: "Play as an Eco Guardian" },
  { id: "admin", name: "Admin", blurb: "Campus staff access" },
  { id: "dev", name: "Dev", blurb: "Build & debug tools" },
];

export default function Login() {
  const [portal, setPortal] = useState<Portal>("student");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (signUpError) throw signUpError;

        if (portal !== "student") {
          if (!signUpData.session) {
            setInfo("Account created. Confirm your email, then sign in and enter your access code.");
            return;
          }
          const { error: codeError } = await supabase.rpc("redeem_role_code", { _code: accessCode });
          if (codeError) {
            await supabase.auth.signOut();
            setError("That access code isn't valid. Ask your admin for the current one.");
            return;
          }
        }
        setInfo("Account created. If sign-in doesn't start automatically, confirm your email and log in.");
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // Server-side role check: has_role() runs in the database, not the browser.
      let { data: allowed, error: roleError } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: portal,
      });
      if (roleError) throw roleError;

      // Existing account upgrading with a staff/dev access code.
      if (!allowed && portal !== "student" && accessCode.trim()) {
        const { error: codeError } = await supabase.rpc("redeem_role_code", { _code: accessCode });
        if (!codeError) allowed = true;
      }

      if (!allowed) {
        await supabase.auth.signOut();
        setError(
          portal === "student"
            ? "This account doesn't have student access. Try a different portal."
            : `This account doesn't have ${portal} access yet. Enter your ${portal} access code above.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }


  async function google() {
    setError(null);
    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (result.error) setError("Google sign-in failed. Try email instead.");
  }

  return (
    <div className="eq-login">
      <div className="eq-login-card">
        <div className="eq-brand">
          <span className="eq-brand-mark">◈</span>
          <div>
            <h1>EcoQuest</h1>
            <p>Learn. Explore. Restore.</p>
          </div>
        </div>

        <div className="eq-portals" role="tablist" aria-label="Choose a portal">
          {PORTALS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={portal === p.id}
              className={`eq-portal ${portal === p.id ? "is-active" : ""}`}
              onClick={() => setPortal(p.id)}
            >
              <strong>{p.name}</strong>
              <span>{p.blurb}</span>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="eq-form">
          {mode === "signup" && (
            <label>
              Guardian name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rowan" />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guardian@ecoquest.dev"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>
          {portal !== "student" && (
            <label>
              {portal === "admin" ? "Staff access code" : "Dev team access code"}
              <input
                required={mode === "signup"}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder={portal === "admin" ? "ECOQUEST-STAFF-…" : "ECOQUEST-DEVTEAM-…"}
              />
              <span className="eq-hint">
                {portal === "admin"
                  ? "Issued to school/college staff."
                  : "Internal build & map tooling access."}
              </span>
            </label>
          )}



          {error && <p className="eq-error">{error}</p>}
          {info && <p className="eq-info">{info}</p>}

          <button className="eq-primary" disabled={busy} type="submit">
            {busy ? "…" : mode === "login" ? `Enter as ${portal}` : "Create guardian"}
          </button>
        </form>

        <button className="eq-google" type="button" onClick={google}>
          Continue with Google
        </button>

        <p className="eq-switch">
          {mode === "login" ? "New here?" : "Already a Guardian?"}{" "}
          <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
