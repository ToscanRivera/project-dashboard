"use client";

import dynamic from "next/dynamic";
import type { DropResult } from "@hello-pangea/dnd";

const DragDropContext = dynamic(
  () => import("@hello-pangea/dnd").then((mod) => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import("@hello-pangea/dnd").then((mod) => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import("@hello-pangea/dnd").then((mod) => mod.Draggable),
  { ssr: false }
);

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  github_url: string;
  position: number;
  updated_at: string;
}

const COLUMNS = [
  { id: "todo", label: "To-Do", icon: "📋", color: "#94a3b8" },
  { id: "inprogress", label: "In Progress", icon: "🔵", color: "#3b82f6" },
  { id: "onhold", label: "On Hold", icon: "⏸️", color: "#f59e0b" },
  { id: "done", label: "Done", icon: "✅", color: "#22c55e" },
];

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: "#dc2626", text: "#fff" },
  medium: { bg: "#f59e0b", text: "#000" },
  low: { bg: "#334155", text: "#94a3b8" },
};

export default function KanbanBoard({
  projects,
  onReorder,
  onDelete,
}: {
  projects: Project[];
  onReorder: (projectId: number, newStatus: string, newPosition: number) => void;
  onDelete: (projectId: number) => void;
}) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const projectId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;
    const newPosition = result.destination.index;
    onReorder(projectId, newStatus, newPosition);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-5" style={{ minHeight: "calc(100vh - 250px)" }}>
        {COLUMNS.map(col => {
          const colProjects = projects
            .filter(p => p.status === col.id)
            .sort((a, b) => a.position - b.position);

          return (
            <div key={col.id} className="rounded-xl" style={{ background: "#151d2e", border: "1px solid #1e293b" }}>
              <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: "#1e293b" }}>
                <div className="flex items-center gap-2">
                  <span>{col.icon}</span>
                  <span className="font-semibold text-sm" style={{ color: col.color }}>{col.label}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#1e293b", color: "#64748b" }}>
                  {colProjects.length}
                </span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-3 space-y-3 min-h-[200px] transition-colors"
                    style={{
                      background: snapshot.isDraggingOver ? "rgba(59,130,246,0.05)" : "transparent",
                      borderRadius: "0 0 12px 12px",
                    }}
                  >
                    {colProjects.map((project, index) => (
                      <Draggable key={project.id} draggableId={String(project.id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="rounded-lg p-4 transition-shadow"
                            style={{
                              background: snapshot.isDragging ? "#253352" : "#1e293b",
                              border: `1px solid ${snapshot.isDragging ? "#3b82f6" : "#334155"}`,
                              boxShadow: snapshot.isDragging ? "0 8px 32px rgba(0,0,0,0.3)" : "none",
                              ...provided.draggableProps.style,
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-sm" style={{ color: "#f1f5f9" }}>{project.title}</h3>
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide"
                                style={{
                                  background: PRIORITY_COLORS[project.priority]?.bg || "#334155",
                                  color: PRIORITY_COLORS[project.priority]?.text || "#94a3b8",
                                }}
                              >
                                {project.priority}
                              </span>
                            </div>
                            {project.description && (
                              <p className="text-xs mb-3 leading-relaxed" style={{ color: "#94a3b8" }}>
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {project.github_url && (
                                  <a
                                    href={project.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs hover:underline"
                                    style={{ color: "#64748b" }}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    🔗 GitHub
                                  </a>
                                )}
                              </div>
                              <button
                                onClick={() => onDelete(project.id)}
                                className="text-xs opacity-0 hover:opacity-100 transition-opacity"
                                style={{ color: "#ef4444" }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
