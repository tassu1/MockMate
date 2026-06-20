import React, { useState } from "react";
import "../styles/Auth.css";

const API_BASE = "http://localhost:5000/api/auth";

function WaveformBars({ active = true }) {
  const bars = new Array(20).fill(0);
  return (
    <div className={"waveform" + (active ? " is-active" : "")} aria-hidden="true">
      {bars.map((_, i) => (
        <span
          className="waveform__bar"
          key={i}
          style={{
            animationDelay: `${(i % 7) * 0.09}s`,
            "--h": `${18 + ((i * 37) % 60)}%`,
          }}
        />
      ))}
    </div>
  );
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const next = {};
    if (isSignup && !form.name.trim()) {
      next.name = "Enter your name.";
    }
    if (!form.email.trim()) {
      next.email = "Enter your email.";
    } else if (!validateEmail(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!form.password) {
      next.password = "Enter your password.";
    } else if (isSignup && form.password.length < 8) {
      next.password = "Use at least 8 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const endpoint = isSignup ? `${API_BASE}/register` : `${API_BASE}/login`;
      const payload = isSignup
        ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || data.success === false) {
        setServerError(
          (data && data.message) ||
            "Something went wrong on our end. Try again in a moment."
        );
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("mockmate_token", data.token);
      }

      setLoading(false);
      if (onAuthSuccess) onAuthSuccess(data);
    } catch (err) {
      setServerError("Can't reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setErrors({});
    setServerError("");
  }

  return (
    <div className="mma">
      <div className="mma__grid">
        {/* Panel: brand + live waveform */}
        <aside className="mma__panel">
          <a className="mma__brand" href="#top">
            <span className="mma__brand-mark" aria-hidden="true" />
            MockMate
          </a>

          <div className="mma__panel-body">
            <p className="mma__eyebrow">
              {isSignup ? "First session starts after this" : "Welcome back"}
            </p>
            <h1 className="mma__panel-title">
              {isSignup ? (
                <>
                  Build the profile
                  <br />
                  <span className="mma__panel-accent">your interview is built from.</span>
                </>
              ) : (
                <>
                  Pick up where
                  <br />
                  <span className="mma__panel-accent">you left off.</span>
                </>
              )}
            </h1>

            <div className="listen-card">
              <div className="listen-card__top">
                <span className="listen-card__status">
                  <span className="pulse-dot" /> Mic ready
                </span>
              </div>
              <WaveformBars active={!loading} />
              <p className="listen-card__caption">
                Your next mock interview is one sign-in away.
              </p>
            </div>
          </div>

          <p className="mma__panel-foot">
            Software Engineering &middot; Sales &middot; Marketing &middot; Finance
          </p>
        </aside>

        {/* Form side */}
        <main className="mma__form-side">
          <div className="mma__form-wrap">
            <div className="mma__tabs" role="tablist" aria-label="Choose login or sign up">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={`mma__tab ${mode === "login" ? "is-active" : ""}`}
                onClick={() => switchMode("login")}
              >
                Log in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                className={`mma__tab ${mode === "signup" ? "is-active" : ""}`}
                onClick={() => switchMode("signup")}
              >
                Sign up
              </button>
            </div>

            <h2 className="mma__form-title">
              {isSignup ? "Create your account" : "Log in to MockMate"}
            </h2>
            <p className="mma__form-sub">
              {isSignup
                ? "Takes under a minute. You'll add your resume and profiles next."
                : "Enter your details to continue to your dashboard."}
            </p>

            {serverError && (
              <div className="mma__alert" role="alert">
                {serverError}
              </div>
            )}

            <form className="mma__form" onSubmit={handleSubmit} noValidate>
              {isSignup && (
                <div className="field">
                  <label className="field__label" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={`field__input ${errors.name ? "has-error" : ""}`}
                    placeholder="Your full name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p className="field__error" id="name-error">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div className="field">
                <label className="field__label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`field__input ${errors.email ? "has-error" : ""}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p className="field__error" id="email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="field">
                <div className="field__label-row">
                  <label className="field__label" htmlFor="password">
                    Password
                  </label>
                  {!isSignup && (
                    <a className="field__hint-link" href="#forgot">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="field__input-group">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`field__input ${errors.password ? "has-error" : ""}`}
                    placeholder={isSignup ? "At least 8 characters" : "Your password"}
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    className="field__toggle"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="field__error" id="password-error">
                    {errors.password}
                  </p>
                )}
              </div>

              <button type="submit" className="mma__submit" disabled={loading}>
                {loading ? (
                  <span className="mma__submit-loading">
                    <span className="spinner" aria-hidden="true" />
                    {isSignup ? "Creating account..." : "Logging in..."}
                  </span>
                ) : isSignup ? (
                  "Create account"
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            <p className="mma__switch">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <button type="button" className="mma__switch-link" onClick={() => switchMode("login")}>
                    Log in
                  </button>
                </>
              ) : (
                <>
                  New to MockMate?{" "}
                  <button type="button" className="mma__switch-link" onClick={() => switchMode("signup")}>
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}