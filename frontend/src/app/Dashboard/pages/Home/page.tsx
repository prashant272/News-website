"use client";
import LatestNewsSection from "@/app/Dashboard/Components/Home/MainSection/Main";
import React, { useState } from "react";
import ProtectedRoute from "../../ProtectedRoute/ProtectedRoute";

const sections = [
  { id: "india" as const, label: "India News", icon: "🇮🇳" },
  { id: "sports" as const, label: "Sports", icon: "⚽" },
  { id: "business" as const, label: "Business", icon: "📈" },
  { id: "technology" as const, label: "Technology", icon: "💻" },
  { id: "entertainment" as const, label: "Entertainment", icon: "🎬" },
  { id: "lifestyle" as const, label: "Lifestyle", icon: "💅" },
  { id: "world" as const, label: "World", icon: "🌍" },
  { id: "health" as const, label: "Health", icon: "🏥" },
  { id: "state" as const, label: "State News", icon: "🏛️" },
] as const;

type SectionId = typeof sections[number]["id"];

const NewsAdminPage = () => {
  const [activeSection, setActiveSection] = useState<SectionId>("india");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
   <>
   <ProtectedRoute>
     <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto flex gap-4 md:gap-6">
        {/* Sidebar */}
        <aside
          className={`
            transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? "w-20" : "w-72"}
            bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 
            rounded-2xl p-4 shadow-xl sticky top-4 h-fit max-h-[calc(100vh-2rem)]
            overflow-hidden flex flex-col
          `}
        >
          {/* Header */}
          <div className={`mb-6 pb-4 border-b border-slate-700/50 ${isSidebarCollapsed ? "text-center" : ""}`}>
            {!isSidebarCollapsed ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    News Sections
                  </h1>
                  <button
                    onClick={() => setIsSidebarCollapsed(true)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-all duration-200"
                    title="Collapse sidebar"
                  >
                    ⬅
                  </button>
                </div>
                <p className="text-xs text-slate-400">Manage your content</p>
              </>
            ) : (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-12 h-12 mx-auto flex items-center justify-center rounded-xl hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-all duration-200 text-xl"
                title="Expand sidebar"
              >
                ➤
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200
                  ${
                    activeSection === section.id
                      ? "bg-blue-500/20 text-blue-100 border border-blue-400/40 shadow-lg shadow-blue-500/10"
                      : "hover:bg-slate-700/50 text-slate-300 hover:text-slate-100 border border-transparent"
                  }
                  ${isSidebarCollapsed ? "justify-center" : ""}
                `}
                title={isSidebarCollapsed ? section.label : ""}
              >
                <span className={`text-2xl flex-shrink-0 ${isSidebarCollapsed ? "" : ""}`}>
                  {section.icon}
                </span>
                {!isSidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{section.label}</div>
                  </div>
                )}
                {!isSidebarCollapsed && activeSection === section.id && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                )}
              </button>
            ))}
          </nav>

          {/* Footer Info */}
          {!isSidebarCollapsed && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="text-xs text-slate-500 text-center">
                <div className="font-semibold text-slate-400 mb-1">Quick Stats</div>
                <div className="flex justify-between px-2">
                  <span>9 Sections</span>
                  <span className="text-blue-400">•</span>
                  <span>248 Articles</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* Active Section Header */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">
                  {sections.find((s) => s.id === activeSection)?.icon}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">
                    {sections.find((s) => s.id === activeSection)?.label}
                  </h2>
                  <p className="text-sm text-slate-400">
                    Manage and organize your {activeSection} articles
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-400/30 rounded-lg text-sm">
                  <span className="text-slate-400">Section:</span>
                  <span className="text-blue-400 font-semibold ml-2 capitalize">
                    {activeSection}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-lg overflow-hidden">
            <LatestNewsSection section={activeSection} />
          </div>

          {/* Stats Footer */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-700/20 rounded-xl border border-slate-600/30 hover:border-blue-400/30 transition-all duration-200">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                  9
                </div>
                <div className="text-xs text-slate-400 font-medium">Active Sections</div>
              </div>
              
              <div className="text-center p-4 bg-slate-700/20 rounded-xl border border-slate-600/30 hover:border-emerald-400/30 transition-all duration-200">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-1">
                  248
                </div>
                <div className="text-xs text-slate-400 font-medium">Total Articles</div>
              </div>
              
              <div className="text-center p-4 bg-slate-700/20 rounded-xl border border-slate-600/30 hover:border-purple-400/30 transition-all duration-200">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                  12.4k
                </div>
                <div className="text-xs text-slate-400 font-medium">Total Views</div>
              </div>
              
              <div className="text-center p-4 bg-slate-700/20 rounded-xl border border-slate-600/30 hover:border-orange-400/30 transition-all duration-200">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-1">
                  47
                </div>
                <div className="text-xs text-slate-400 font-medium">Draft Articles</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
   </ProtectedRoute>
   </>
  );
};

export default NewsAdminPage;