import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/Interview.css";
import { api } from "../lib/api";

export default function Interview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const listRef = useRef(null);

  const [messages, setMessages] = useState(() =>
    location.state?.firstQuestion
      ? [{ sender: "ai", content: location.state.firstQuestion }]
      : []
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending || ended) return;

    const candidateMessage = input.trim();
    setMessages((m) => [...m, { sender: "candidate", content: candidateMessage }]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const { data } = await api.answerInterview(id, candidateMessage);
      setMessages((m) => [...m, { sender: "ai", content: data.question }]);
      if (data.interviewEnded) {
        setEnded(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleEndEarly() {
    if (!window.confirm("End the interview now and generate your report?")) return;
    setSending(true);
    try {
      await api.endInterview(id);
      setEnded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mmi">
      <header className="mmi__header">
        <span className="mmi__brand">MockMate</span>
        {!ended && (
          <button className="mmi__end-btn" type="button" onClick={handleEndEarly}>
            End interview
          </button>
        )}
      </header>

      <main className="mmi__chat" ref={listRef}>
        {messages.length === 0 && (
          <p className="mmi__muted">Connecting to your interviewer...</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`mmi__bubble mmi__bubble--${m.sender}`}>
            <span className="mmi__bubble-label">
              {m.sender === "ai" ? "Interviewer" : "You"}
            </span>
            <p>{m.content}</p>
          </div>
        ))}
        {sending && (
          <div className="mmi__bubble mmi__bubble--ai mmi__bubble--typing">
            <span className="mmi__bubble-label">Interviewer</span>
            <p className="mmi__typing-dots">
              <span /> <span /> <span />
            </p>
          </div>
        )}
      </main>

      {error && (
        <div className="mmi__alert" role="alert">
          {error}
        </div>
      )}

      {ended ? (
        <div className="mmi__ended">
          <p>Interview complete. Your report is being generated.</p>
          <button
            type="button"
            className="mmi__report-btn"
            onClick={() => navigate(`/interview/${id}/report`)}
          >
            View report
          </button>
        </div>
      ) : (
        <form className="mmi__composer" onSubmit={handleSend}>
          <textarea
            placeholder="Type your answer..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            rows={2}
          />
          <button type="submit" disabled={sending || !input.trim()}>
            Send
          </button>
        </form>
      )}
    </div>
  );
}
