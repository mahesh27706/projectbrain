import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./styles.css";

const SAMPLES = ["https://github.com/pallets/click", "https://github.com/sindresorhus/is"];
const LEVELS = ["Beginner", "Standard", "Expert"];

async function callApi(body) {
  const r = await fetch("/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

export default function App() {
  const [repo, setRepo] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);
  const [chat, setChat] = useState([]);
  const [question, setQuestion] = useState("");

  async function analyse(url = repo) {
    setRepo(url);
    setBusy(true);
    setError("");
    setOverview(null);
    setChat([]);
    try {
      setOverview(await callApi({ repo: url, level }));
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  async function ask(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q || busy) return;
    setQuestion("");
    setChat((c) => [...c, { role: "you", text: q }]);
    setBusy(true);
    setError("");
    try {
      const d = await callApi({ repo, level, question: q });
      setChat((c) => [...c, { role: "ai", text: d.answer }]);
    } catch (e2) {
      setError(e2.message);
    }
    setBusy(false);
  }

  return (
    <main className="wrap">
      <header>
        <h1>ProjectBrain</h1>
        <p className="sub">Paste a public GitHub link. Get a plain explanation, then ask about any file.</p>
      </header>

      <form className="row" onSubmit={(e) => { e.preventDefault(); analyse(); }}>
        <input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="https://github.com/owner/repo" aria-label="GitHub repository link" />
        <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Learning level">
          {LEVELS.map((l) => <option key={l}>{l}</option>)}
        </select>
        <button disabled={busy || !repo.trim()}>{busy && !overview ? "Reading the code..." : "Explain this repo"}</button>
      </form>

      {!overview && !busy && (
        <p className="hint">
          No link handy? Try{" "}
          {SAMPLES.map((s) => (
            <button key={s} className="link" onClick={() => analyse(s)}>{s.replace("https://github.com/", "")}</button>
          ))}
        </p>
      )}

      {busy && !overview && <p className="hint">Fetching files and writing the explanation. This takes 10 to 30 seconds.</p>}
      {error && <p className="error" role="alert">{error}</p>}

      {overview && (
        <>
          <section className="card">
            <p className="meta">Based on {overview.filesUsed} of {overview.totalFiles} files. Anything marked Inferred is a guess from names or structure.</p>
            <ReactMarkdown>{overview.answer}</ReactMarkdown>
          </section>

          <section className="card">
            <h2>Ask about this project</h2>
            {chat.map((m, i) => (
              <div key={i} className={"msg " + m.role}>
                {m.role === "ai" ? <ReactMarkdown>{m.text}</ReactMarkdown> : <p>{m.text}</p>}
              </div>
            ))}
            {busy && <p className="hint">Looking through the files...</p>}
            <form className="row" onSubmit={ask}>
              <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="How does the login work? What does main.py do?" aria-label="Your question" />
              <button disabled={busy || !question.trim()}>Ask</button>
            </form>
          </section>
        </>
      )}
      <footer>Public repositories only. Answers come from the files shown and may be wrong; check the cited lines.</footer>
    </main>
  );
}
