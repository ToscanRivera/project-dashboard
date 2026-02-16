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

interface GitHubPR {
  number: number;
  title: string;
  state: 'open' | 'closed';
  user: {
    login: string;
  };
  created_at: string;
  files_changed?: number;
  review_status: 'none' | 'requested' | 'approved' | 'merged';
}

interface Article {
  id: string;
  title: string;
  author: string;
  filesChanged: number;
  status: "draft" | "review" | "approved" | "published";
  createdDate: string;
  prNumber: number;
}

const statusConfig = {
  draft: { label: "Draft", icon: "📝", color: "#64748b" },
  review: { label: "Review", icon: "🔍", color: "#f59e0b" },
  approved: { label: "Approved", icon: "✅", color: "#10b981" },
  published: { label: "Published", icon: "🚀", color: "#3b82f6" },
};

/**
 * Map GitHub PR review status to content pipeline status
 */
function mapPRToContentStatus(pr: GitHubPR): "draft" | "review" | "approved" | "published" {
  if (pr.state === 'closed' || pr.review_status === 'merged') return 'published';
  
  switch (pr.review_status) {
    case 'approved':
      return 'approved';
    case 'requested':
      return 'review';
    default:
      return 'draft';
  }
}

/**
 * Convert GitHub PR to Article format
 */
function prToArticle(pr: GitHubPR): Article {
  return {
    id: `pr-${pr.number}`,
    title: pr.title,
    author: pr.user.login,
    filesChanged: pr.files_changed || 0,
    status: mapPRToContentStatus(pr),
    createdDate: new Date(pr.created_at).toISOString().split('T')[0],
    prNumber: pr.number,
  };
}

export default function ContentPipeline() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch content PRs from GitHub
  const fetchContentPRs = async () => {
    try {
      const res = await fetch('/api/github/content');
      const prs: GitHubPR[] = await res.json();
      const articleData = prs.map(prToArticle);
      setArticles(articleData);
    } catch (error) {
      console.error('Error fetching content PRs:', error);
    }
  };

  useEffect(() => {
    fetchContentPRs();
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as Article["status"];
    const articleId = result.draggableId;

    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, status: newStatus }
        : article
    ));
  };

  const handleApprove = async (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (!article || article.status !== "review") return;

    // Optimistic update
    setArticles(prev => prev.map(a => 
      a.id === articleId ? { ...a, status: "approved" } : a
    ));

    try {
      const res = await fetch('/api/github/content/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prNumber: article.prNumber }),
      });

      if (!res.ok) {
        throw new Error('Failed to approve PR');
      }
    } catch (error) {
      console.error('Error approving PR:', error);
      // Revert optimistic update on error
      setArticles(prev => prev.map(a => 
        a.id === articleId ? { ...a, status: "review" } : a
      ));
    }
  };

  const handleRequestChanges = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId && article.status === "review"
        ? { ...article, status: "draft" }
        : article
    ));
  };

  const openPreview = (article: Article) => {
    setSelectedArticle(article);
    setShowPreview(true);
  };

  const ArticleCard = ({ article }: { article: Article }) => (
    <div 
      className="p-4 rounded-lg cursor-pointer transition-all hover:opacity-90 mb-3"
      style={{ background: "#1e293b", border: "1px solid #334155" }}
      onClick={() => openPreview(article)}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded flex items-center justify-center text-2xl" style={{ background: "#334155" }}>
          📝
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-tight mb-1" style={{ color: "#f1f5f9" }}>
            {article.title}
          </h3>
          <p className="text-xs" style={{ color: "#94a3b8" }}>by {article.author}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs mb-2" style={{ color: "#64748b" }}>
        <span>PR #{article.prNumber}</span>
        <span>{article.filesChanged} files</span>
        <span>{new Date(article.createdDate).toLocaleDateString()}</span>
      </div>

      {article.status === "review" && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(article.id);
            }}
            className="px-3 py-1.5 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRequestChanges(article.id);
            }}
            className="px-3 py-1.5 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Changes
          </button>
        </div>
      )}
    </div>
  );

  const getArticlesByStatus = (status: Article["status"]) => 
    articles.filter(article => article.status === status);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>
          Content Pipeline
        </h2>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
        >
          + New Article
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status}>
              <div className="flex items-center gap-2 mb-4">
                <span>{config.icon}</span>
                <h3 className="font-semibold text-sm" style={{ color: config.color }}>
                  {config.label}
                </h3>
                <span 
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ 
                    background: `${config.color}20`,
                    color: config.color 
                  }}
                >
                  {getArticlesByStatus(status as Article["status"]).length}
                </span>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[400px] p-2 rounded-lg transition-colors"
                    style={{
                      background: snapshot.isDraggingOver ? "#334155" : "#0f172a",
                      border: `1px solid ${snapshot.isDraggingOver ? "#475569" : "#1e293b"}`,
                    }}
                  >
                    {getArticlesByStatus(status as Article["status"]).map((article, index) => (
                      <Draggable key={article.id} draggableId={article.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <ArticleCard article={article} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Article Preview Modal */}
      {showPreview && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl"
            style={{ background: "#1e293b" }}
          >
            <div className="p-6 border-b" style={{ borderColor: "#334155" }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
                    {selectedArticle.title}
                  </h2>
                  <div className="flex gap-4 text-sm" style={{ color: "#94a3b8" }}>
                    <span>by {selectedArticle.author}</span>
                    <span>PR #{selectedArticle.prNumber}</span>
                    <span>{selectedArticle.filesChanged} files changed</span>
                    <span>{new Date(selectedArticle.createdDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      {statusConfig[selectedArticle.status].icon}
                      {statusConfig[selectedArticle.status].label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  style={{ color: "#94a3b8" }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3" style={{ color: "#f1f5f9" }}>🔗 Pull Request Details</h3>
                <div 
                  className="p-4 rounded-lg text-sm space-y-2"
                  style={{ background: "#0f172a", color: "#cbd5e1", border: "1px solid #334155" }}
                >
                  <p><strong>PR Number:</strong> #{selectedArticle.prNumber}</p>
                  <p><strong>Title:</strong> {selectedArticle.title}</p>
                  <p><strong>Author:</strong> {selectedArticle.author}</p>
                  <p><strong>Files Changed:</strong> {selectedArticle.filesChanged}</p>
                  <p><strong>Created:</strong> {new Date(selectedArticle.createdDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> {statusConfig[selectedArticle.status].label}</p>
                  <a 
                    href={`https://github.com/ToscanRivera/the-door/pull/${selectedArticle.prNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    🔗 View on GitHub
                  </a>
                </div>
              </div>

              {selectedArticle.status === "review" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleApprove(selectedArticle.id);
                      setShowPreview(false);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    ✅ Approve PR
                  </button>
                  <button
                    onClick={() => {
                      handleRequestChanges(selectedArticle.id);
                      setShowPreview(false);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    📝 Request Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}