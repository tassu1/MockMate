import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Report.css";
import { api } from "../lib/api";

const CATEGORY_LABELS = {
  technicalKnowledge: "Technical knowledge",
  communication: "Communication",
  problemSolving: "Problem solving",
  resumeAlignment: "Resume alignment",
};

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const { data, status } = await api.getReport(id);
        if (cancelled) return;

        if (status === 202) {
          pollRef.current = setTimeout(poll, 3000);
          return;
        }
        setReport(data.report);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(pollRef.current);
    };
  }, [id]);

  if (error) {
    return (
      <div className="mmr mmr--center">
        <div className="mmr__state-card">
          <p className="mmr__alert">{error}</p>
          <button
            type="button"
            className="mmr__dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mmr mmr--center">
        <div className="mmr__state-card">
          <span className="mmr__spinner" aria-hidden="true" />
          <p className="mmr__loading-title">Analyzing your interview...</p>
          <p className="mmr__muted">This usually takes under a minute.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mmr">
      <header className="mmr__header">
        <div className="mmr__header-inner">
          <span className="mmr__brand">
            <span className="mmr__brand-mark" aria-hidden="true" />
            MockMate
          </span>
          <button
            type="button"
            className="mmr__dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            Back to dashboard
          </button>
        </div>
      </header>

      <main className="mmr__main">
        <div className="mmr__top">
          <div className="mmr__score-card">
            <span className="mmr__score-label">Overall score</span>
            <span className="mmr__score-value">
              {report.overallScore}
              <span className="mmr__score-unit">/10</span>
            </span>
          </div>
          <p className="mmr__summary">{report.summary}</p>
        </div>

        <section className="mmr__panel">
          <h2 className="mmr__panel-title">Category breakdown</h2>
          <div className="mmr__categories">
            {Object.entries(report.categoryScores || {}).map(([key, value]) => (
              <div className="mmr__category" key={key}>
                <div className="mmr__category-top">
                  <span>{CATEGORY_LABELS[key] || key}</span>
                  <span>{value}%</span>
                </div>
                <div className="mmr__bar">
                  <div className="mmr__bar-fill" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mmr__lists">
          <div className="mmr__list-block mmr__list-block--strength">
            <h3>Strengths</h3>
            <ul>
              {report.strengths?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="mmr__list-block mmr__list-block--weakness">
            <h3>Weaknesses</h3>
            <ul>
              {report.weaknesses?.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>

          <div className="mmr__list-block mmr__list-block--suggestion">
            <h3>Suggestions</h3>
            <ul>
              {report.suggestions?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}