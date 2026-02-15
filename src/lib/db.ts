import bcrypt from "bcryptjs";

// Simple in-memory store that works on both local and Vercel
// Data persists within a single server instance (resets on cold start for serverless)

interface User {
  id: number;
  email: string;
  password: string;
  name: string;
}

interface Board {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
}

interface Project {
  id: number;
  board_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  github_url: string;
  position: number;
  updated_at: string;
  created_at: string;
}

let users: User[] = [];
let boards: Board[] = [];
let projects: Project[] = [];
let nextUserId = 1;
let nextBoardId = 1;
let nextProjectId = 1;
let seeded = false;

function seed() {
  if (seeded) return;
  seeded = true;

  const hash = bcrypt.hashSync("TestPass123!", 10);
  const userId = nextUserId++;
  users.push({ id: userId, email: "toscan@renerivera.net", password: hash, name: "René Rivera" });

  const boardId = nextBoardId++;
  boards.push({ id: boardId, user_id: userId, name: "All Projects", created_at: new Date().toISOString() });

  const seedProjects = [
    { title: "FidelTrad", description: "MVP complete, v2 PR pending", status: "onhold", priority: "high", github: "https://github.com/Rene-Rivera/Fideltrad", pos: 0 },
    { title: "SecondBrain", description: "Personal knowledge management system", status: "onhold", priority: "medium", github: "https://github.com/Rene-Rivera/SecondBrain", pos: 1 },
    { title: "The Door", description: "Creative project in active development", status: "inprogress", priority: "high", github: "https://github.com/ToscanRivera/the-door", pos: 0 },
    { title: "LinkedIn Content", description: "Content pipeline and publishing system", status: "inprogress", priority: "medium", github: "https://github.com/ToscanRivera/linkedin-content", pos: 1 },
    { title: "Author Platform", description: "René Rivera author website", status: "inprogress", priority: "medium", github: "https://github.com/ToscanRivera/renerivera-author", pos: 2 },
    { title: "Value Investing", description: "Investment research and analysis tools", status: "todo", priority: "low", github: "https://github.com/ToscanRivera/value-investing", pos: 0 },
    { title: "Agentic CPMS", description: "Research phase — AI-powered project management", status: "todo", priority: "medium", github: "https://github.com/ToscanRivera/agentic-cpms", pos: 1 },
    { title: "Digital Archive", description: "Proton Drive migration", status: "todo", priority: "low", github: "", pos: 2 },
    { title: "Project Dashboard", description: "This dashboard — executive project overview", status: "inprogress", priority: "high", github: "https://github.com/ToscanRivera/project-dashboard", pos: 3 },
  ];

  for (const p of seedProjects) {
    const id = nextProjectId++;
    const now = new Date().toISOString();
    projects.push({ id, board_id: boardId, title: p.title, description: p.description, status: p.status, priority: p.priority, github_url: p.github, position: p.pos, updated_at: now, created_at: now });
  }
}

export const db = {
  getUser(email: string): User | undefined {
    seed();
    return users.find(u => u.email === email);
  },

  getBoards(userId: number): Board[] {
    seed();
    return boards.filter(b => b.user_id === userId);
  },

  createBoard(userId: number, name: string): Board {
    seed();
    const id = nextBoardId++;
    const board: Board = { id, user_id: userId, name, created_at: new Date().toISOString() };
    boards.push(board);
    return board;
  },

  deleteBoard(boardId: number, userId: number) {
    seed();
    projects = projects.filter(p => p.board_id !== boardId);
    boards = boards.filter(b => !(b.id === boardId && b.user_id === userId));
  },

  getProjects(boardId: number, userId: number): Project[] {
    seed();
    const board = boards.find(b => b.id === boardId && b.user_id === userId);
    if (!board) return [];
    return projects.filter(p => p.board_id === boardId).sort((a, b) => a.position - b.position);
  },

  createProject(data: { board_id: number; title: string; description?: string; status?: string; priority?: string; github_url?: string }): Project {
    seed();
    const maxPos = Math.max(-1, ...projects.filter(p => p.board_id === data.board_id && p.status === (data.status || "todo")).map(p => p.position));
    const id = nextProjectId++;
    const now = new Date().toISOString();
    const project: Project = {
      id, board_id: data.board_id, title: data.title, description: data.description || "",
      status: data.status || "todo", priority: data.priority || "medium",
      github_url: data.github_url || "", position: maxPos + 1, updated_at: now, created_at: now,
    };
    projects.push(project);
    return project;
  },

  updateProject(projectId: number, data: Partial<Project>) {
    seed();
    const idx = projects.findIndex(p => p.id === projectId);
    if (idx === -1) return;
    projects[idx] = { ...projects[idx], ...data, updated_at: new Date().toISOString() };
  },

  reorderProject(projectId: number, status: string, position: number) {
    seed();
    const idx = projects.findIndex(p => p.id === projectId);
    if (idx === -1) return;
    projects[idx] = { ...projects[idx], status, position, updated_at: new Date().toISOString() };
  },

  deleteProject(projectId: number) {
    seed();
    projects = projects.filter(p => p.id !== projectId);
  },
};
