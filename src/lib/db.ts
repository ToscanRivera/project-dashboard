import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "dashboard.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initDb(_db);
  }
  return _db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      github_url TEXT DEFAULT '',
      position INTEGER NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    );
  `);

  // Seed if no users exist
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    seed(db);
  }
}

function seed(db: Database.Database) {
  const hash = bcrypt.hashSync("TestPass123!", 10);
  const result = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(
    "toscan@renerivera.net",
    hash,
    "René Rivera"
  );
  const userId = result.lastInsertRowid;

  const boardResult = db.prepare("INSERT INTO boards (user_id, name) VALUES (?, ?)").run(userId, "All Projects");
  const boardId = boardResult.lastInsertRowid;

  const projects = [
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

  const stmt = db.prepare(
    "INSERT INTO projects (board_id, title, description, status, priority, github_url, position) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  for (const p of projects) {
    stmt.run(boardId, p.title, p.description, p.status, p.priority, p.github, p.pos);
  }
}
