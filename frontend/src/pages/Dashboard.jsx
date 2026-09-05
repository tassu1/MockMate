import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { api, logout } from "../lib/api";

const LEVELS = [
  { value: "intern", label: "Intern" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("mid");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    refreshResumes();
  }, []);

  async function refreshResumes() {
    setLoadingResumes(true);
    try {
      const { data } = await api.listResumes();
      setResumes(data.resumes || []);
      if (data.resumes?.length && !selectedResumeId) {
        setSelectedResumeId(data.resumes[0].id || data.resumes[0]._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingResumes(false);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const { data } = await api.uploadResume(file);
      await refreshResumes();
      setSelectedResumeId(data.resume.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleStartInterview(e) {
    e.preventDefault();
    setError("");

    if (!selectedResumeId) {
      setError("Upload or select a resume first.");
      return;
    }
    if (!role.trim()) {
      setError("Enter the role you're interviewing for.");
      return;
    }

    setStarting(true);
    try {
      const { data } = await api.startInterview({
        resumeId: selectedResumeId,
        role: role.trim(),
        experienceLevel: level,
      });
      navigate(`/interview/${data.interviewId}`, {
        state: { firstQuestion: data.question, role: role.trim() },
      });
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="mmd">
      <header className="mmd__header">
        <div className="mmd__header-inner">
          <span className="mmd__brand">
            <span className="mmd__brand-mark" aria-hidden="true" />
            MockMate
          </span>
          <button className="mmd__logout" onClick={handleLogout} type="button">
            Log out
          </button>
        </div>
      </header>

      <main className="mmd__main">
        <div className="mmd__intro">
          <h1>Set up your next mock interview</h1>
          <p>
            Upload your resume once, then start as many practice interviews
            as you want against any role.
          </p>
        </div>

        {error && (
          <div className="mmd__alert" role="alert">
            {error}
          </div>
        )}

        <div className="mmd__grid">
          <section className="mmd__panel">
            <h2 className="mmd__panel-title">Your resumes</h2>

            {loadingResumes ? (
              <p className="mmd__muted">Loading...</p>
            ) : resumes.length === 0 ? (
              <p className="mmd__muted">No resumes uploaded yet.</p>
            ) : (
              <ul className="mmd__resume-list">
                {resumes.map((r) => {
                  const id = r.id || r._id;
                  const active = selectedResumeId === id;
                  return (
                    <li key={id}>
                      <label className={`mmd__resume-item ${active ? "is-active" : ""}`}>
                        <input
                          type="radio"
                          name="resume"
                          checked={active}
                          onChange={() => setSelectedResumeId(id)}
                        />
                        <span className="mmd__resume-icon">
                          <IconDoc />
                        </span>
                        <span className="mmd__resume-name">{r.filename}</span>
                        <span className="mmd__resume-dot" aria-hidden="true" />
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              type="button"
              className="mmd__upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <span className="mmd__upload-icon">
                <IconUpload />
              </span>
              {uploading ? "Uploading..." : "Upload a resume (PDF)"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              hidden
            />
          </section>

          <section className="mmd__panel">
            <h2 className="mmd__panel-title">Start an interview</h2>

            <form className="mmd__form" onSubmit={handleStartInterview}>
              <div className="mmd__field">
                <label htmlFor="role">Role</label>
                <input
                  id="role"
                  type="text"
                  placeholder="e.g. Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              <div className="mmd__field">
                <label>Experience level</label>
                <div className="mmd__level-picker" role="radiogroup" aria-label="Experience level">
                  {LEVELS.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      role="radio"
                      aria-checked={level === l.value}
                      className={`mmd__level-pill ${level === l.value ? "is-active" : ""}`}
                      onClick={() => setLevel(l.value)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="mmd__start-btn" disabled={starting}>
                {starting ? "Starting..." : "Start interview"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}