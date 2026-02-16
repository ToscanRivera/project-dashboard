"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Article {
  id: string;
  title: string;
  author: string;
  wordCount: number;
  status: "draft" | "review" | "approved" | "published";
  createdDate: string;
  coverImage?: string;
  content: string;
  companionPost: string;
}

const mockArticles: Article[] = [
  {
    id: "1",
    title: "Building AI-Powered Dashboards with Next.js",
    author: "John Doe",
    wordCount: 1245,
    status: "draft",
    createdDate: "2024-02-15",
    content: "This is the main article content...",
    companionPost: "Just finished my latest article on AI dashboards! Key insights inside. 🧵"
  },
  {
    id: "2",
    title: "The Future of Content Management Systems",
    author: "Jane Smith",
    wordCount: 2100,
    status: "review",
    createdDate: "2024-02-14",
    content: "Content management has evolved significantly...",
    companionPost: "Exploring the evolution of CMS platforms and what's next. Thoughts? 💭"
  },
  {
    id: "3",
    title: "Authentication Patterns in Modern Web Apps",
    author: "Mike Johnson",
    wordCount: 1890,
    status: "approved",
    createdDate: "2024-02-13",
    content: "Security is paramount in modern applications...",
    companionPost: "Security first! Breaking down modern auth patterns in my latest piece. 🔐"
  },
  {
    id: "4",
    title: "React Performance Optimization Tips",
    author: "Sarah Wilson",
    wordCount: 1650,
    status: "published",
    createdDate: "2024-02-12",
    content: "Performance optimization is crucial for user experience...",
    companionPost: "5 React optimization techniques that made our app 3x faster ⚡"
  },
];

const statusConfig = {
  draft: { label: "Draft", icon: "📝", color: "#64748b" },
  review: { label: "Review", icon: "🔍", color: "#f59e0b" },
  approved: { label: "Approved", icon: "✅", color: "#10b981" },
  published: { label: "Published", icon: "🚀", color: "#3b82f6" },
};

export default function ContentPipeline() {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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

  const handleApprove = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId && article.status === "review"
        ? { ...article, status: "approved" }
        : article
    ));
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
        {article.coverImage && (
          <img 
            src={article.coverImage} 
            alt="" 
            className="w-12 h-12 rounded object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-tight mb-1" style={{ color: "#f1f5f9" }}>
            {article.title}
          </h3>
          <p className="text-xs" style={{ color: "#94a3b8" }}>by {article.author}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs" style={{ color: "#64748b" }}>
        <span>{article.wordCount} words</span>
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
                    <span>{selectedArticle.wordCount} words</span>
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

            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3" style={{ color: "#f1f5f9" }}>📄 Article Content</h3>
                <div 
                  className="p-4 rounded-lg text-sm leading-relaxed"
                  style={{ background: "#0f172a", color: "#cbd5e1", border: "1px solid #334155" }}
                >
                  {selectedArticle.content}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3" style={{ color: "#f1f5f9" }}>🐦 Companion Post</h3>
                <div 
                  className="p-4 rounded-lg text-sm"
                  style={{ background: "#0f172a", color: "#cbd5e1", border: "1px solid #334155" }}
                >
                  {selectedArticle.companionPost}
                </div>

                {selectedArticle.status === "review" && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {
                        handleApprove(selectedArticle.id);
                        setShowPreview(false);
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      ✅ Approve
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
        </div>
      )}
    </>
  );
}