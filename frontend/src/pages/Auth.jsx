import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

const API_BASE = "http://localhost:5000/api/auth";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Auth({ passmode }) {
  const [mode, setMode] = useState(passmode); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setServerError(err.message || "Something went wrong.");
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
      <header className="mma__topbar">
        <a
          className="mma__brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <span className="mma__brand-mark" aria-hidden="true" />
          MockMate
        </a>
      </header>

      <main className="mma__main">
        <div className="mma__card">
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

          <h1 className="mma__card-title">{isSignup ? "Create your account" : "Log in"}</h1>

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
                New here?{" "}
                <button type="button" className="mma__switch-link" onClick={() => switchMode("signup")}>
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>
      </main>

      <footer className="mma__footer">
        <div className="mma__footer-inner">
          <span className="mma__brand mma__footer-brand">
            <span className="mma__brand-mark" aria-hidden="true" />
            MockMate
          </span>
          <p>&copy; {new Date().getFullYear()} MockMate.</p>
        </div>
      </footer>
    </div>
  );
}