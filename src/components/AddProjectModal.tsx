"use client";

import { useState } from "react";

export default function AddProjectModal({
  boardId,
  onClose,
  onAdded,
}: {
  boardId: number;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board_id: boardId, title, description, status, priority, github_url: githubUrl }),
    });
    setLoading(false);
    onAdded();
  };

  const inputStyle = { background: "#0f172a", color: "#f1f5f9", border: "1px solid #334155" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="w-full max-w-lg rounded-2xl p-6" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: "#f1f5f9" }}>Add Project</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: "#cbd5e1" }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "#cbd5e1" }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "#cbd5e1" }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                <option value="todo">To-Do</option>
                <option value="inprogress">In Progress</option>
                <option value="onhold">On Hold</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "#cbd5e1" }}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "#cbd5e1" }}>GitHub URL (optional)</label>
            <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} placeholder="https://github.com/..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm" style={{ background: "#334155", color: "#94a3b8" }}>Cancel</button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
              {loading ? "Adding..." : "Add Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
