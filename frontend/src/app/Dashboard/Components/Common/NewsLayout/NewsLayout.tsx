"use client";
import React, { useState } from "react";
import styles from "./NewsLayout.module.scss";

interface NewsLayoutProps {
  children?: React.ReactNode;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const NewsLayout: React.FC<NewsLayoutProps> = ({ 
  children, 
  tabs = [], 
  activeTab = tabs[0] || "",
  onTabChange 
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "content", label: "Content", icon: "📝" },
    { id: "image-branding", label: "Image Branding", icon: "🖼️" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const handleTabClick = (tab: string) => {
    onTabChange?.(tab);
  };

  return (
    <div className={styles.appShell}>
      {/* ========== NAVBAR ========== */}
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <div className={styles.logo}>
            <span className={styles.logoDot} />
            <span className={styles.logoText}>News Admin</span>
          </div>
          <span className={styles.versionBadge}>v2.0</span>
        </div>

        <div className={styles.navCenter}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navButton} ${
                activeNav === item.id ? styles.navButtonActive : ""
              }`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.navRight}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search news, articles..."
              className={styles.searchInput}
            />
          </div>
          
          <button 
            className={styles.notificationBtn}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            <span className={styles.notificationBadge}>3</span>
          </button>
          
          <div className={styles.userSection}>
            <div className={styles.userAvatar}>JD</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>John Doe</div>
              <div className={styles.userRole}>Admin</div>
            </div>
          </div>
        </div>
      </header>

      {/* ========== SIDEBAR TABS ========== */}
      {tabs.length > 0 && (
        <div className={`${styles.sidebarTabs} ${isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}>
          <div className={styles.sidebarHeader}>
            <span>Sections</span>
            <button 
              className={styles.collapseBtn}
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? "→" : "←"}
            </button>
          </div>
          
          <nav className={styles.sidebarNav}>
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`${styles.sidebarItem} ${
                  activeTab === tab ? styles.sidebarItemActive : ""
                }`}
                onClick={() => handleTabClick(tab)}
              >
                <span className={styles.sidebarIcon}>
                  {tab === 'India' ? '🇮🇳' : 
                   tab === 'Sports' ? '⚽' :
                   tab === 'Business' ? '📈' :
                   tab === 'Entertainment' ? '🎬' :
                   tab === 'Lifestyle' ? '💅' : '📰'}
                </span>
                <div className={styles.sidebarContent}>
                  <span className={styles.sidebarLabel}>{tab}</span>
                </div>
                {activeTab === tab && <span className={styles.activeIndicator} />}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className={styles.notificationsDropdown}>
          <div className={styles.notificationsHeader}>
            <h3>Notifications</h3>
            <button onClick={() => setShowNotifications(false)}>✕</button>
          </div>
          <div className={styles.notificationsList}>
            <div className={styles.notificationItem}>
              <span className={styles.notificationIcon}>✅</span>
              <div className={styles.notificationContent}>
                <div className={styles.notificationTitle}>Article published</div>
                <div className={styles.notificationTime}>2 mins ago</div>
              </div>
            </div>
            <div className={styles.notificationItem}>
              <span className={styles.notificationIcon}>💬</span>
              <div className={styles.notificationContent}>
                <div className={styles.notificationTitle}>New comment received</div>
                <div className={styles.notificationTime}>1 hour ago</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={styles.mainContentArea}>
        {children}
      </main>
    </div>
  );
};

export default NewsLayout;
