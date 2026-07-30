import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    browser.storage.local.get("apiToken").then((res) => {
      if (res.apiToken) setToken(res.apiToken);
    });
  }, []);

  const saveToken = () => {
    browser.storage.local.set({ apiToken: token });
    setStatus("Token saved.");
    setTimeout(() => setStatus(""), 2000);
  };

  const saveCurrentPage = async () => {
    setLoading(true);
    setStatus("");
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      if (!currentTab?.url) throw new Error("No URL found");

      const apiUrl = process.env.WXT_PUBLIC_API_URL || "http://localhost:3000/api/bookmarks";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ url: currentTab.url })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setStatus("Bookmark saved!");
    } catch (e: any) {
      setStatus(`Failed: ${e.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 2000);
    }
  };

  return (
    <div style={{ padding: "1rem", minWidth: "300px" }}>
      <h2>memoire extension</h2>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="API Token from Dashboard"
          style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
        />
        <button onClick={saveToken} style={{ width: "100%" }}>Save Token</button>
      </div>
      <button
        onClick={saveCurrentPage}
        disabled={loading || !token}
        style={{ width: "100%", padding: "1rem", background: "#000", color: "#fff" }}
      >
        {loading ? "Saving..." : "Save Current Tab"}
      </button>
      {status && <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>{status}</p>}
    </div>
  );
}

export default App;
