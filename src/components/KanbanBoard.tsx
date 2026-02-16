"use client";

import { useState, useEffect } from "react";
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

interface GitHubProject {
  id: string;
  title: string;
  body: string;
  status: string;
  repository?: string;
  description?: string;
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
  projects: GitHubProject[];
  onReorder: (projectId: string, newStatus: string, newPosition: number) => void;
  onDelete: (projectId: string) => void;
}) {
  const [activeColumn, setActiveColumn] = useState<string>("inprogress");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const projectId = result.draggableId;
    const newStatus = result.destination.droppableId;
    const newPosition = result.destination.index;
    onReorder(projectId, newStatus, newPosition);
  };

  const renderColumn = (col: typeof COLUMNS[0]) => {
    const colProjects = projects
      .filter(p => p.status === col.id)
      .sort((a, b) => a.title.localeCompare(b.title)); // Sort by title for GitHub projects

    return (
      <div 
        key={col.id} 
        className={`rounded-xl ${isMobile ? 'w-full' : ''}`} 
        style={{ background: "#151d2e", border: "1px solid #1e293b" }}
      >
        <div 
          className={`px-4 py-3 flex items-center justify-between border-b ${isMobile ? 'sticky top-0 z-10' : ''}`} 
          style={{ 
            borderColor: "#1e293b", 
            background: isMobile ? "#151d2e" : "transparent"
          }}
        >
          <div className="flex items-center gap-2">
            <span>{col.icon}</span>
            <span className="font-semibold text-sm" style={{ color: col.color }}>{col.label}</span>
          </div>
          <span 
            className="text-xs px-2 py-0.5 rounded-full" 
            style={{ 
              background: "#1e293b", 
              color: "#64748b" 
            }}
          >
            {colProjects.length}
          </span>
        </div>
        <Droppable droppableId={col.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-3 space-y-3 transition-colors ${isMobile ? 'min-h-[400px]' : 'min-h-[200px]'}`}
              style={{
                background: snapshot.isDraggingOver ? "rgba(59,130,246,0.05)" : "transparent",
                borderRadius: "0 0 12px 12px",
              }}
            >
              {colProjects.map((project, index) => (
                <Draggable key={project.id} draggableId={project.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`rounded-lg p-4 transition-shadow ${isMobile ? 'w-full' : ''}`}
                      style={{
                        background: snapshot.isDragging ? "#253352" : "#1e293b",
                        border: `1px solid ${snapshot.isDragging ? "#3b82f6" : "#334155"}`,
                        boxShadow: snapshot.isDragging ? "0 8px 32px rgba(0,0,0,0.3)" : "none",
                        ...provided.draggableProps.style,
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm" style={{ color: "#f1f5f9" }}>{project.title}</h3>
                        <span className="text-[10px] text-xs px-2 py-0.5 rounded-full" style={{ background: "#334155", color: "#94a3b8" }}>
                          GitHub
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-xs mb-3 leading-relaxed" style={{ color: "#94a3b8" }}>
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {project.repository && (
                            <a
                              href={project.repository}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs hover:underline"
                              style={{ color: "#64748b" }}
                              onClick={e => e.stopPropagation()}
                            >
                              🔗 Repo
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
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* Mobile: Tab/accordion view */}
      <div className="lg:hidden">
        {/* Column tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {COLUMNS.map(col => {
            const colProjects = projects.filter(p => p.status === col.id);
            return (
              <button
                key={col.id}
                onClick={() => setActiveColumn(col.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 min-w-fit"
                style={{
                  background: activeColumn === col.id ? col.color + "20" : "#1e293b",
                  color: activeColumn === col.id ? col.color : "#94a3b8",
                  border: `1px solid ${activeColumn === col.id ? col.color : "#334155"}`,
                }}
              >
                <span>{col.icon}</span>
                <span>{col.label}</span>
                <span 
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ 
                    background: activeColumn === col.id ? col.color + "40" : "#334155",
                    color: activeColumn === col.id ? col.color : "#64748b"
                  }}
                >
                  {colProjects.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active column content */}
        <div className="space-y-4" style={{ minHeight: "calc(100vh - 350px)" }}>
          {renderColumn(COLUMNS.find(col => col.id === activeColumn)!)}
        </div>
      </div>

      {/* Desktop: Grid view */}
      <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-5" style={{ minHeight: "calc(100vh - 250px)" }}>
        {COLUMNS.map(renderColumn)}
      </div>
    </DragDropContext>
  );
}
