import React, { useEffect, useRef, useState } from "react";
import "../styles/Landing.css";

const ROLES = [
  {
    id: "se",
    name: "Software Engineering",
    track: "SE-01",
    detail: "Data structures, system design, your GitHub repos under real questioning.",
  },
  {
    id: "sales",
    name: "Sales",
    track: "SL-02",
    detail: "Pitch pressure, objection handling, closing scenarios that feel like the room.",
  },
  {
    id: "marketing",
    name: "Marketing",
    track: "MK-03",
    detail: "Campaign reasoning, positioning calls, metrics you have to defend live.",
  },
  {
    id: "finance",
    name: "Finance",
    track: "FN-04",
    detail: "Valuation logic, case math, judgment calls under a ticking clock.",
  },
];

const PIPELINE = [
  {
    label: "Profile",
    title: "Upload resume, LinkedIn, GitHub",
    body: "MockMate reads your background the way a hiring panel would \u2014 resume PDF, LinkedIn history, GitHub commits \u2014 before you ever say a word.",
  },
  {
    label: "Generate",
    title: "AI builds your interview",
    body: "Questions are written from your actual projects and experience level, not a generic bank. Two candidates never get the same interview.",
  },
  {
    label: "Converse",
    title: "Voice interview, live follow-ups",
    body: "A conversational AI agent asks, listens, and follows up in real time \u2014 the way a real interviewer redirects when an answer is thin.",
  },
  {
    label: "Review",
    title: "Get a full assessment report",
    body: "Score, strengths, weaknesses, and a study plan land in your dashboard minutes after you hang up.",
  },
];

const REPORT_METRICS = [
  { k: "Overall Score", v: "8.2", u: "/10" },
  { k: "Communication", v: "87", u: "%" },
  { k: "Technical Depth", v: "79", u: "%" },
  { k: "Problem-Solving", v: "84", u: "%" },
  { k: "Confidence & Clarity", v: "91", u: "%" },
];

const TRANSCRIPT_LINES = [
  { who: "ai", text: "Walk me through the caching layer in your last project." },
  { who: "you", text: "We used Redis with a write-through policy, mainly to cut..." },
  { who: "ai", text: "What happened when Redis itself went down?" },
];

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function WaveformBars({ active = true }) {
  const bars = new Array(28).fill(0);
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

function TypedTranscript() {
  const [shown, setShown] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (shown >= TRANSCRIPT_LINES.length) return;
    const line = TRANSCRIPT_LINES[shown];
    if (charCount < line.text.length) {
      const t = setTimeout(() => setCharCount((c) => c + 1), 18);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setShown((s) => s + 1);
      setCharCount(0);
    }, 900);
    return () => clearTimeout(t);
  }, [shown, charCount]);

  return (
    <div className="transcript" role="log" aria-label="Sample interview exchange">
      {TRANSCRIPT_LINES.slice(0, shown).map((l, i) => (
        <p className={`transcript__line transcript__line--${l.who}`} key={i}>
          <span className="transcript__tag">{l.who === "ai" ? "AI" : "YOU"}</span>
          {l.text}
        </p>
      ))}
      {shown < TRANSCRIPT_LINES.length && (
        <p className={`transcript__line transcript__line--${TRANSCRIPT_LINES[shown].who}`}>
          <span className="transcript__tag">
            {TRANSCRIPT_LINES[shown].who === "ai" ? "AI" : "YOU"}
          </span>
          {TRANSCRIPT_LINES[shown].text.slice(0, charCount)}
          <span className="transcript__cursor" />
        </p>
      )}
    </div>
  );
}

function Section({ id, eyebrow, title, sub, children, className = "" }) {
  const [ref, inView] = useInView(0.12);
  return (
    <section
      id={id}
      ref={ref}
      className={`section ${className} ${inView ? "is-visible" : ""}`}
    >
      <div className="section__head">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h2 className="section__title">{title}</h2>}
        {sub && <p className="section__sub">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

export default function Landing({ onAuthClick }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="mm">
      <header className="nav">
        <div className="nav__inner">
          <a className="nav__brand" href="#top">
            <span className="nav__brand-mark" aria-hidden="true" />
            MockMate
          </a>

          <nav className={`nav__links ${navOpen ? "is-open" : ""}`}>
            <a href="#how" onClick={() => setNavOpen(false)}>How it works</a>
            <a href="#roles" onClick={() => setNavOpen(false)}>Roles</a>
            <a href="#report" onClick={() => setNavOpen(false)}>Report</a>
            <a href="#stack" onClick={() => setNavOpen(false)}>Tech</a>
          </nav>

          <div className="nav__actions">
            <button type="button" onClick={() => onAuthClick('login')} className="btn btn--ghost">Log in</button>
            <button type="button" onClick={() => onAuthClick('signup')} className="btn btn--primary">Sign up free</button>
          </div>

          <button
            type="button"
            className="nav__toggle"
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="hero__inner">
            <div className="hero__copy">
              <p className="eyebrow eyebrow--hero">Voice-based AI mock interviews</p>
              <h1 className="hero__title">
                Practice the interview
                <br />
                <span className="hero__title-accent">before it practices you.</span>
              </h1>
              <p className="hero__sub">
                MockMate reads your resume, LinkedIn, and GitHub, then runs a live
                voice interview built around your actual experience &mdash; and
                follows up like a real interviewer would.
              </p>
              <div className="hero__cta-row">
                <button type="button" className="btn btn--primary btn--lg">
                  Start a mock interview
                </button>
                <a href="#how" className="link-cta">
                  See how it works <span aria-hidden="true">&darr;</span>
                </a>
              </div>
              <div className="hero__trust">
                <span>Software Engineering</span>
                <span className="dot" />
                <span>Sales</span>
                <span className="dot" />
                <span>Marketing</span>
                <span className="dot" />
                <span>Finance</span>
              </div>
            </div>

            <div className="hero__panel" aria-hidden="false">
              <div className="call-card">
                <div className="call-card__top">
                  <span className="call-card__status">
                    <span className="pulse-dot" /> Live session
                  </span>
                  <span className="call-card__timer">04:12</span>
                </div>
                <WaveformBars />
                <TypedTranscript />
              </div>
              <div className="floaty-chip floaty-chip--score">
                <span className="floaty-chip__label">Confidence &amp; Clarity</span>
                <span className="floaty-chip__value">91%</span>
              </div>
              <div className="floaty-chip floaty-chip--role">
                <span className="floaty-chip__label">Track</span>
                <span className="floaty-chip__value">SE&#8209;01</span>
              </div>
            </div>
          </div>
        </section>

        {/* ROLES */}
        <Section
          id="roles"
          eyebrow="Choose your track"
          title="Four roles, one adaptive interviewer"
          sub="Pick a track and MockMate tunes the entire interview &mdash; question style, depth, and pacing &mdash; to match it."
        >
          <div className="roles-grid">
            {ROLES.map((r) => (
              <article className="role-card" key={r.id}>
                <span className="role-card__track">{r.track}</span>
                <h3 className="role-card__name">{r.name}</h3>
                <p className="role-card__detail">{r.detail}</p>
                <span className="role-card__go">Select track &rarr;</span>
              </article>
            ))}
          </div>
        </Section>

        {/* HOW IT WORKS */}
        <Section
          id="how"
          eyebrow="The pipeline"
          title="From upload to assessment, one continuous flow"
          className="section--dark"
        >
          <div className="pipeline">
            {PIPELINE.map((step, i) => (
              <div className="pipeline__step" key={step.label}>
                <div className="pipeline__rail" aria-hidden="true">
                  <span className="pipeline__node" />
                  {i < PIPELINE.length - 1 && <span className="pipeline__line" />}
                </div>
                <div className="pipeline__content">
                  <span className="pipeline__label">{step.label}</span>
                  <h3 className="pipeline__title">{step.title}</h3>
                  <p className="pipeline__body">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* PROFILE INPUTS */}
        <Section
          eyebrow="What MockMate reads"
          title="Built from what's already true about you"
          sub="No generic question banks. Every prompt traces back to something in your background."
        >
          <div className="inputs-row">
            <div className="input-card">
              <span className="input-card__icon" aria-hidden="true">&#128196;</span>
              <h3>Resume</h3>
              <p>PDF upload, parsed for roles, skills, and achievements.</p>
            </div>
            <div className="input-card">
              <span className="input-card__icon" aria-hidden="true">&#128279;</span>
              <h3>LinkedIn</h3>
              <p>Profile URL analyzed for experience and career trajectory.</p>
            </div>
            <div className="input-card">
              <span className="input-card__icon" aria-hidden="true">&#9881;&#65039;</span>
              <h3>GitHub</h3>
              <p>Repos and contributions, when relevant to the track.</p>
            </div>
          </div>
        </Section>

        {/* REPORT */}
        <Section
          id="report"
          eyebrow="After the call"
          title="A report you can actually act on"
          sub="Every session ends with a scorecard, not just a transcript."
        >
          <div className="report-panel">
            <div className="report-panel__scores">
              {REPORT_METRICS.map((m) => (
                <div className="score-row" key={m.k}>
                  <span className="score-row__label">{m.k}</span>
                  <div className="score-row__bar">
                    <span
                      className="score-row__fill"
                      style={{ width: `${m.u === "/10" ? Number(m.v) * 10 : Number(m.v)}%` }}
                    />
                  </div>
                  <span className="score-row__value">
                    {m.v}<span className="score-row__unit">{m.u}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="report-panel__notes">
              <div className="note-block note-block--strength">
                <h4>Strengths</h4>
                <p>Clear structuring of answers; strong ownership of project decisions.</p>
              </div>
              <div className="note-block note-block--weakness">
                <h4>Weaknesses</h4>
                <p>Under-explains trade-offs until prompted by a follow-up.</p>
              </div>
              <div className="note-block note-block--rec">
                <h4>Recommendation</h4>
                <p>Practice leading with trade-offs before being asked.</p>
              </div>
            </div>
          </div>
        </Section>

        {/* STACK */}
        <Section
          id="stack"
          eyebrow="Under the hood"
          title="Built for real-time, voice-first interviews"
          className="section--dark"
        >
          <div className="stack-grid">
            {[
              "MERN Stack",
              "OpenRouter LLMs",
              "WebRTC Voice",
              "Socket.IO",
              "Resume Parsing",
              "GitHub & LinkedIn Data",
            ].map((s) => (
              <span className="stack-pill" key={s}>{s}</span>
            ))}
          </div>
        </Section>

        {/* FINAL CTA */}
        <section className="final-cta">
          <div className="final-cta__inner">
            <h2>Your next interview shouldn't be the first time you say this out loud.</h2>
            <button type="button" className="btn btn--primary btn--lg">
              Start your first mock interview
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <span className="nav__brand footer__brand">
            <span className="nav__brand-mark" aria-hidden="true" />
            MockMate
          </span>
          <p>&copy; {new Date().getFullYear()} MockMate. Practice out loud.</p>
        </div>
      </footer>
    </div>
  );
}