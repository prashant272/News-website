"use client";
import LatestNewsSection from "@/app/Dashboard/Components/Home/LatestNewsSection/Main";
import React, { useState } from "react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 p-6 flex gap-6">
      {/* Sidebar Tabs */}
      <div className="w-72 bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 shadow-2xl sticky top-6 h-fit max-h-[80vh] overflow-y-auto">
        <div className="mb-8 pb-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2 tracking-tight">
            News Sections
          </h1>
          <p className="text-sm text-slate-400">Manage your news content</p>
        </div>

        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`
                w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200 group
                ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-slate-100 shadow-lg shadow-emerald-500/25 border-2 border-emerald-400/50 transform scale-[1.02]"
                    : "bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-slate-100 hover:shadow-md hover:border-slate-500/50 border border-slate-700/50"
                }
                hover:-translate-x-1 hover:shadow-emerald-500/20
              `}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="text-2xl flex-shrink-0">{section.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{section.label}</div>
                <div className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {activeSection === section.id ? "Active" : "Click to edit"}
                </div>
              </div>
              {activeSection === section.id && (
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping ml-auto" />
              )}
            </button>
          ))}
        </div>

        {/* Sidebar Toggle */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <button
            className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-600 text-slate-400 hover:text-slate-200 rounded-2xl transition-all duration-200"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <span className="text-xl">{isSidebarCollapsed ? "➤" : "⬅"}</span>
            <span>{isSidebarCollapsed ? "Expand" : "Collapse"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">

        {/* Content */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl min-h-[70vh]">
          <LatestNewsSection section={activeSection} />
        </div>

        {/* Footer Stats */}
        <div className="bg-slate-800/70 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 text-sm grid grid-cols-4 gap-6 md:grid-cols-5">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">9</div>
            <div className="text-slate-400">Active Sections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">248</div>
            <div className="text-slate-400">Total Articles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">12.4k</div>
            <div className="text-slate-400">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">47</div>
            <div className="text-slate-400">Drafts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsAdminPage;
