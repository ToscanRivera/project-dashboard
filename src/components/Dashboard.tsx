"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import KanbanBoard from "./KanbanBoard";
import AddProjectModal from "./AddProjectModal";
import ContentPipeline from "./ContentPipeline";

interface Board {
  id: number;
  name: string;
}

interface GitHubProject {
  id: string;
  title: string;
  body: string;
  status: string;
  repository?: string;
  description?: string;
}

export default function Dashboard({ user }: { user: { name: string; email: string; id: string; image?: string; username?: string } }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [projects, setProjects] = useState<GitHubProject[]>([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [activeSection, setActiveSection] = useState<"projects" | "content">("projects");

  const fetchBoards = useCallback(async () => {
    const res = await fetch("/api/boards");
    const data = await res.json();
    setBoards(data);
    if (data.length > 0 && !activeBoard) setActiveBoard(data[0]);
  }, [activeBoard]);

  const fetchProjects = useCallback(async () => {
    // For GitHub integration, we don't need board-specific projects
    // All projects come from GitHub Project #1
    const res = await fetch(`/api/github/projects`);
    const data = await res.json();
    setProjects(data);
  }, []);

  useEffect(() => { fetchBoards(); }, [fetchBoards]);
  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createBoard = async () => {
    if (!newBoardName.trim()) return;
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBoardName }),
    });
    const board = await res.json();
    setBoards([...boards, board]);
    setActiveBoard(board);
    setNewBoardName("");
    setShowNewBoard(false);
  };

  const handleProjectAdded = () => {
    fetchProjects();
    setShowAddProject(false);
  };

  const handleReorder = async (projectId: string, newStatus: string, newPosition: number) => {
    // Optimistic update for UI responsiveness
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
    // TODO: Implement GitHub Project status update via GraphQL API
    console.log('TODO: Update GitHub Project item status', { projectId, newStatus, newPosition });
  };

  const handleDeleteProject = async (projectId: string) => {
    // GitHub Projects don't support deletion from this interface
    console.log('Project deletion not supported for GitHub Projects');
  };

  const statusCounts = {
    todo: projects.filter(p => p.status === "todo").length,
    inprogress: projects.filter(p => p.status === "inprogress").length,
    onhold: projects.filter(p => p.status === "onhold").length,
    done: projects.filter(p => p.status === "done").length,
  };

  return (
    <div className="min-h-screen" style={{ background: "#0f172a" }}>
      {/* Header */}
      <header className="border-b" style={{ background: "#1e293b", borderColor: "#334155" }}>
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl">📊</span>
            <div>
              <h1 className="text-lg font-bold" style={{ color: "#f1f5f9" }}>Project Dashboard</h1>
              <p className="text-xs" style={{ color: "#94a3b8" }}>Welcome, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-xs" style={{ color: "#94a3b8" }}>
              <span>📋 {projects.length} projects</span>
              <span>🔵 {statusCounts.inprogress} active</span>
              <span>⏸️ {statusCounts.onhold} on hold</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.image && (
                  <img 
                    src={user.image} 
                    alt={user.name || "User"} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>{user.name}</p>
                  {user.username && (
                    <p className="text-xs" style={{ color: "#64748b" }}>@{user.username}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                style={{ background: "#334155", color: "#94a3b8" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main navigation */}
      <div className="border-b" style={{ background: "#1e293b", borderColor: "#334155" }}>
        <div className="max-w-[1600px] mx-auto px-6 flex items-center">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveSection("projects")}
              className="px-6 py-4 text-sm font-semibold transition-all border-b-2"
              style={{
                color: activeSection === "projects" ? "#3b82f6" : "#94a3b8",
                borderColor: activeSection === "projects" ? "#3b82f6" : "transparent",
              }}
            >
              📋 Projects
            </button>
            <button
              onClick={() => setActiveSection("content")}
              className="px-6 py-4 text-sm font-semibold transition-all border-b-2"
              style={{
                color: activeSection === "content" ? "#3b82f6" : "#94a3b8",
                borderColor: activeSection === "content" ? "#3b82f6" : "transparent",
              }}
            >
              📝 Content
            </button>
          </div>
        </div>
      </div>

      {/* Board tabs - only show for projects section */}
      {activeSection === "projects" && (
        <div className="border-b" style={{ background: "#1e293b", borderColor: "#334155" }}>
          <div className="max-w-[1600px] mx-auto px-6 flex items-center gap-1 overflow-x-auto">
          {boards.map(board => (
            <button
              key={board.id}
              onClick={() => setActiveBoard(board)}
              className="px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap"
              style={{
                color: activeBoard?.id === board.id ? "#3b82f6" : "#94a3b8",
                borderColor: activeBoard?.id === board.id ? "#3b82f6" : "transparent",
              }}
            >
              {board.name}
            </button>
          ))}
          {showNewBoard ? (
            <div className="flex items-center gap-2 px-2 py-2">
              <input
                type="text"
                value={newBoardName}
                onChange={e => setNewBoardName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createBoard()}
                placeholder="Board name..."
                autoFocus
                className="px-3 py-1.5 rounded text-sm outline-none"
                style={{ background: "#0f172a", color: "#f1f5f9", border: "1px solid #334155", width: 160 }}
              />
              <button onClick={createBoard} className="text-blue-400 text-sm">✓</button>
              <button onClick={() => setShowNewBoard(false)} className="text-gray-500 text-sm">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewBoard(true)}
              className="px-3 py-3 text-sm transition-all hover:opacity-80"
              style={{ color: "#64748b" }}
            >
              + New Board
            </button>
          )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {activeSection === "projects" ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>
                {activeBoard?.name || "Select a board"}
              </h2>
              <button
                onClick={() => setShowAddProject(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
              >
                + Add Project
              </button>
            </div>

            {activeBoard && (
              <KanbanBoard
                projects={projects}
                onReorder={handleReorder}
                onDelete={handleDeleteProject}
              />
            )}
          </>
        ) : (
          <ContentPipeline />
        )}
      </div>

      {showAddProject && activeBoard && (
        <AddProjectModal
          boardId={activeBoard.id}
          onClose={() => setShowAddProject(false)}
          onAdded={handleProjectAdded}
        />
      )}
    </div>
  );
}
