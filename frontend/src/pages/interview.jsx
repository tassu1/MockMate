import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/Interview.css";
import { api } from "../lib/api";

// Adjust to match your actual backend base — inferred from Auth.jsx.
const API_BASE = "http://localhost:5000/api/interview";

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
  const [waitingReply, setWaitingReply] = useState(false);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, waitingReply]);

  // Reads the SSE stream from POST /interview/:id/answer, appending each
  // `{ content }` chunk into the last message live, and resolving once the
  // backend sends `{ done: true, interviewEnded }`.
  async function streamAnswer(candidateMessage) {
    const token = localStorage.getItem("mockmate_token");

    const res = await fetch(`${API_BASE}/${id}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message: candidateMessage }),
    });

    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => null);
      throw new Error((data && data.message) || "Something went wrong on our end.");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let interviewEnded = false;
    let sawFirstChunk = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop(); // keep the last, possibly incomplete, event

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = JSON.parse(line.slice(6));

        if (payload.error) {
          throw new Error(payload.error);
        }

        if (payload.content) {
          if (!sawFirstChunk) {
            sawFirstChunk = true;
            setWaitingReply(false);
            setMessages((m) => [...m, { sender: "ai", content: "", streaming: true }]);
          }
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, content: last.content + payload.content };
            return copy;
          });
        }

        if (payload.done) {
          interviewEnded = !!payload.interviewEnded;
        }
      }
    }

    setMessages((m) => {
      const copy = [...m];
      const last = copy[copy.length - 1];
      if (last?.streaming) copy[copy.length - 1] = { ...last, streaming: false };
      return copy;
    });

    return interviewEnded;
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending || ended) return;

    const candidateMessage = input.trim();
    setMessages((m) => [...m, { sender: "candidate", content: candidateMessage }]);
    setInput("");
    setSending(true);
    setWaitingReply(true);
    setError("");

    try {
      const interviewEnded = await streamAnswer(candidateMessage);
      if (interviewEnded) setEnded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
      setWaitingReply(false);
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
        <span className="mmi__brand">
          <span className="mmi__brand-mark" aria-hidden="true" />
          MockMate
        </span>
        {!ended && (
          <button className="mmi__end-btn" type="button" onClick={handleEndEarly}>
            End interview
          </button>
        )}
      </header>

      <main className="mmi__chat" ref={listRef}>
        <div className="mmi__chat-inner">
          {messages.length === 0 && (
            <p className="mmi__muted">Connecting to your interviewer...</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`mmi__bubble mmi__bubble--${m.sender}`}>
              <span className="mmi__bubble-label">
                {m.sender === "ai" ? "Interviewer" : "You"}
              </span>
              <p>
                {m.content}
                {m.streaming && <span className="mmi__cursor" />}
              </p>
            </div>
          ))}
          {waitingReply && (
            <div className="mmi__bubble mmi__bubble--ai mmi__bubble--typing">
              <span className="mmi__bubble-label">Interviewer</span>
              <p className="mmi__typing-dots">
                <span /> <span /> <span />
              </p>
            </div>
          )}
        </div>
      </main>

      {error && (
        <div className="mmi__alert" role="alert">
          {error}
        </div>
      )}

      {ended ? (
        <div className="mmi__ended">
          <div className="mmi__ended-card">
            <p>Interview complete. Your report is being generated.</p>
            <button
              type="button"
              className="mmi__report-btn"
              onClick={() => navigate(`/interview/${id}/report`)}
            >
              View report
            </button>
          </div>
        </div>
      ) : (
        <form className="mmi__composer" onSubmit={handleSend}>
          <div className="mmi__composer-inner">
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
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()}>
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}