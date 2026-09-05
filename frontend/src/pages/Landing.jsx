import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";

const ROLES = [
  {
    id: "se",
    name: "Software Engineering",
    track: "SE-01",
    detail:
      "Data structures, projects, system design, technical decisions, and real-world engineering scenarios.",
  },
  {
    id: "sales",
    name: "Sales",
    track: "SL-02",
    detail:
      "Pitching, objection handling, customer scenarios, communication, and closing strategies.",
  },
  {
    id: "marketing",
    name: "Marketing",
    track: "MK-03",
    detail:
      "Campaign strategy, positioning, analytics, decision-making, and marketing scenarios.",
  },
  {
    id: "finance",
    name: "Finance",
    track: "FN-04",
    detail:
      "Financial concepts, case-based questions, analytical thinking, and judgment calls.",
  },
];

const PIPELINE = [
  {
    label: "01",
    title: "Upload your resume",
    body:
      "Upload your resume and let MockMate understand your skills, projects, experience, and achievements before the interview begins.",
  },
  {
    label: "02",
    title: "Choose your role & level",
    body:
      "Tell MockMate what role you're preparing for and whether you're interviewing as an Intern, Junior, Mid-level, or Senior candidate.",
  },
  {
    label: "03",
    title: "Interview with AI",
    body:
      "Have a real-time chat conversation with an AI interviewer that asks questions based on your background and adapts its follow-ups to your answers.",
  },
  {
    label: "04",
    title: "Get your assessment",
    body:
      "When the interview ends, MockMate analyzes the entire conversation and generates a personalized report with strengths, weaknesses, focus areas, and recommendations.",
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
  { who: "ai", text: "Tell me about the most challenging project you've worked on." },
  { who: "you", text: "I worked on a school management system with multiple schools..." },
  { who: "ai", text: "What was the biggest technical challenge you faced?" },
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
    <div className="transcript">
      {TRANSCRIPT_LINES.slice(0, shown).map((line, i) => (
        <p className={`transcript__line transcript__line--${line.who}`} key={i}>
          <span className="transcript__tag">{line.who === "ai" ? "AI" : "YOU"}</span>
          {line.text}
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
    <section id={id} ref={ref} className={`section ${className} ${inView ? "is-visible" : ""}`}>
      <div className="section__inner">
        <div className="section__head">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && <h2 className="section__title">{title}</h2>}
          {sub && <p className="section__sub">{sub}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function IconDocument() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconLevel() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

export default function Landing() {
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();

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
            <button type="button" onClick={() => navigate("/login")} className="btn btn--primary">
              Log in
            </button>
            <button type="button" onClick={() => navigate("/signup")} className="btn btn--ghost">
              Sign up
            </button>
          </div>
          <button
            type="button"
            className="nav__toggle"
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__inner">
            <div className="hero__copy">
              <p className="eyebrow eyebrow--hero">AI-powered mock interviews</p>
              <h1 className="hero__title">
                Practice the interview
                <br />
                <span className="hero__title-accent">before it practices you.</span>
              </h1>
              <p className="hero__sub">
                Upload your resume, choose the role you're preparing for, and tell MockMate your
                experience level. Our AI conducts a personalized, real-time interview based on
                your background, projects, and the role you want.
              </p>
              <div className="hero__cta-row">
                <button type="button" className="btn btn--primary btn--lg" onClick={() => navigate("/login")}>
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
            <div className="hero__panel">
              <div className="call-card">
                <div className="call-card__top">
                  <span className="call-card__status">
                    <span className="pulse-dot" />
                    AI interview
                  </span>
                  <span className="call-card__timer">LIVE</span>
                </div>
                <TypedTranscript />
              </div>
              <div className="floaty-chip floaty-chip--score">
                <span className="floaty-chip__label">Adaptive follow-ups</span>
                <span className="floaty-chip__value">AI</span>
              </div>
              <div className="floaty-chip floaty-chip--role">
                <span className="floaty-chip__label">Experience</span>
                <span className="floaty-chip__value">Junior</span>
              </div>
            </div>
          </div>
        </section>

        <Section
          id="roles"
          eyebrow="Choose your track"
          title="One AI interviewer. Built around your role."
          sub="Pick the role you're preparing for and MockMate adapts the interview's questions, depth, and scenarios to match it."
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

        <Section
          id="how"
          eyebrow="How it works"
          title="From resume to interview report in one flow"
          className="section--dark"
        >
          <div className="pipeline">
            {PIPELINE.map((step, i) => (
              <div className="pipeline__step" key={step.label}>
                <div className="pipeline__rail">
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

        <Section
          eyebrow="What MockMate uses"
          title="Your interview starts with your background"
          sub="Give MockMate the context it needs to make the interview feel like an interview for you — not a random question bank."
        >
          <div className="inputs-row">
            <div className="input-card">
              <div className="input-card__icon">
                <IconDocument />
              </div>
              <h3>Resume</h3>
              <p>
                Upload your resume so the AI can understand your skills, projects, experience, and
                achievements.
              </p>
            </div>
            <div className="input-card">
              <div className="input-card__icon">
                <IconTarget />
              </div>
              <h3>Target Role</h3>
              <p>
                Choose the role you're interviewing for so questions stay relevant to your target
                position.
              </p>
            </div>
            <div className="input-card">
              <div className="input-card__icon">
                <IconLevel />
              </div>
              <h3>Experience Level</h3>
              <p>
                Select Intern, Junior, Mid-level, or Senior to control the expected depth of the
                interview.
              </p>
            </div>
          </div>
        </Section>

        <Section
          eyebrow="The interview"
          title="Not a question bank. A conversation."
          sub="Your answers influence what comes next. MockMate can dig deeper, challenge your reasoning, or change direction just like a real interviewer."
        >
          <div className="report-panel">
            <div className="report-panel__scores">
              <div className="note-block note-block--strength">
                <h4>AI</h4>
                <p>Tell me about the most challenging project you've worked on.</p>
              </div>
              <div className="note-block note-block--rec">
                <h4>YOU</h4>
                <p>I worked on a school management system where I had to handle data for multiple schools.</p>
              </div>
              <div className="note-block note-block--strength">
                <h4>AI</h4>
                <p>What was the biggest technical challenge you faced?</p>
              </div>
              <div className="note-block note-block--rec">
                <h4>YOU</h4>
                <p>Making sure one school's data couldn't accidentally be accessed by another.</p>
              </div>
            </div>
            <div className="report-panel__notes">
              <div className="note-block note-block--strength">
                <h4>Adaptive</h4>
                <p>Follow-up questions are generated from what you actually say.</p>
              </div>
              <div className="note-block note-block--weakness">
                <h4>Personalized</h4>
                <p>Questions are grounded in your resume, projects, role, and experience level.</p>
              </div>
              <div className="note-block note-block--rec">
                <h4>Real-time</h4>
                <p>The interview keeps moving as a natural back-and-forth conversation.</p>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="report"
          eyebrow="After the interview"
          title="Know exactly where you stand."
          sub="When your interview ends, MockMate analyzes the entire conversation and turns it into an actionable assessment."
          className="section--dark"
        >
          <div className="report-panel report-panel--dark">
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
                    {m.v}
                    <span className="score-row__unit">{m.u}</span>
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
                <h4>Focus Areas</h4>
                <p>Practice explaining technical decisions, trade-offs, and reasoning more clearly.</p>
              </div>
              <div className="note-block note-block--rec">
                <h4>Recommendations</h4>
                <p>Lead with the problem, explain your decision, and clearly communicate the trade-offs.</p>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="stack"
          eyebrow="Under the hood"
          title="Built around intelligent AI interviews"
          className="section--dark"
        >
          <div className="stack-grid">
            {["MERN Stack", "OpenRouter LLMs", "AI Interviewer", "Real-time Chat", "Resume Parsing", "Context-aware Follow-ups"].map((s) => (
              <span className="stack-pill" key={s}>{s}</span>
            ))}
          </div>
        </Section>

        <section className="final-cta">
          <div className="final-cta__inner">
            <h2>Your next interview shouldn't be the first time you practice.</h2>
            <button type="button" className="btn btn--primary btn--lg" onClick={() => navigate("/login")}>
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
          <p>&copy; {new Date().getFullYear()} MockMate. Practice smarter. Interview better.</p>
        </div>
      </footer>
    </div>
  );
}