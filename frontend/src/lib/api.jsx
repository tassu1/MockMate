const API_ROOT = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("mockmate_token");
}

export function isAuthed() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem("mockmate_token");
}

/**
 * Thin fetch wrapper: prefixes API_ROOT, attaches the auth token,
 * and normalizes error handling so callers just get back parsed JSON
 * or a thrown Error with a readable message.
 */
async function request(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm && body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_ROOT}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok && res.status !== 202) {
    throw new Error((data && data.message) || `Request failed (${res.status})`);
  }

  return { data, status: res.status };
}

export const api = {
  // resumes
  uploadResume: (file) => {
    const form = new FormData();
    form.append("resume", file);
    return request("/resume/upload", { method: "POST", body: form, isForm: true });
  },
  listResumes: () => request("/resume"),

  // interview
  startInterview: (payload) =>
    request("/interview/start", { method: "POST", body: payload }),
  answerInterview: (id, message) =>
    request(`/interview/${id}/answer`, { method: "POST", body: { message } }),
  endInterview: (id) => request(`/interview/${id}/end`, { method: "POST" }),
  getReport: (id) => request(`/interview/${id}/report`),
};
