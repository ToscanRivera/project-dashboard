# Project Dashboard

A modern, real-time project management dashboard built with Next.js 15 and React 19. Manage tasks with a Kanban board, support multiple projects, and collaborate with real-time updates.

[![Live Demo](https://img.shields.io/badge/live-demo-blue?style=flat-square)](https://project-dashboard-pi-ten.vercel.app)
[![Deploy Status](https://img.shields.io/badge/deploy-vercel-black?style=flat-square)](https://vercel.com)

## 🚀 Features

- **Kanban Board** — Drag-and-drop task management with visual workflow
- **Multi-Board Support** — Create and manage multiple project boards independently
- **Authentication** — Secure user login with session management (GitHub SSO coming soon)
- **Real-time Updates** — Live collaboration across connected clients
- **Content Pipeline** — In-progress content workflow management
- **Responsive Design** — Works seamlessly on desktop and tablet

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | App Router, server components, API routes |
| **React 19** | Modern UI component framework |
| **TypeScript** | Type-safe development |
| **Tailwind CSS v4** | Utility-first styling |
| **Vercel** | Deployment and hosting |
| **next-auth** | Authentication & sessions |
| **@hello-pangea/dnd** | Drag-and-drop functionality |

## 📦 Getting Started

### Prerequisites

- Node.js 18+ (v22 recommended)
- npm or yarn

### Installation

```bash
git clone https://github.com/ToscanRivera/project-dashboard.git
cd project-dashboard
npm install
```

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Deploy

```bash
npm run build
npm run start
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
# GitHub OAuth (for upcoming SSO feature)
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
```

## 📂 Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── lib/              # Utilities and helpers
└── styles/           # Global styles and theme
```

## 🎯 Roadmap

- ✅ Kanban board core functionality
- ✅ Multi-board support
- ✅ Basic authentication
- 🔄 GitHub SSO integration (in progress)
- 🔄 Content Pipeline feature (in progress)
- ⏳ Team collaboration features
- ⏳ Export/import functionality
- ⏳ Analytics and reporting

## 📝 License

MIT — Feel free to use, modify, and distribute.

## 🤝 Contributing

Pull requests welcome! Please open an issue first to discuss any changes.

---

**Live Demo:** [https://project-dashboard-pi-ten.vercel.app](https://project-dashboard-pi-ten.vercel.app)
