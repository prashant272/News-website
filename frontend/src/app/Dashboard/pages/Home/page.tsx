"use client";

import React, { useState, useContext } from 'react';
import ProtectedRoute from "../../ProtectedRoute/ProtectedRoute";
import MainSection from '@/app/Dashboard/Components/Home/MainSection/Main';
import styles from './Page.module.scss';
import { UserContext } from "@/app/Dashboard/Context/ManageUserContext";

const sections = [
  { id: 'india' as const, label: 'India', icon: '🇮🇳' },
  { id: 'sports' as const, label: 'Sports', icon: '⚽' },
  { id: 'business' as const, label: 'Business', icon: '📈' },
  { id: 'technology' as const, label: 'Tech', icon: '💻' },
  { id: 'entertainment' as const, label: 'Entertainment', icon: '🎬' },
  { id: 'lifestyle' as const, label: 'Lifestyle', icon: '✨' },
  { id: 'world' as const, label: 'World', icon: '🌍' },
  { id: 'health' as const, label: 'Health', icon: '🏥' },
  { id: 'state' as const, label: 'State', icon: '📰' },
] as const;

type SectionId = typeof sections[number]['id'];

export default function NewsAdminPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('india');
  const userCtx = useContext(UserContext);
  const activeSectionData = sections.find(s => s.id === activeSection);

  const handleLogout = () => {
    userCtx?.logout();
  };

  return (
    <ProtectedRoute>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.mobileTabs}>
            <div className={styles.mobileTabsContainer}>
              <div className={styles.tabsList}>
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`${styles.tabButton} ${activeSection === section.id ? styles.active : ''}`}
                  >
                    <span className={styles.tabIcon}>{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className={styles.desktopSidebar}>
            <h1 className={styles.sidebarTitle}>Sections</h1>
            <nav className={styles.sidebarNav}>
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`${styles.sidebarButton} ${activeSection === section.id ? styles.active : ''}`}
                >
                  <span className={styles.sidebarIcon}>{section.icon}</span>
                  <span>{section.label}</span>
                  {activeSection === section.id && (
                    <div className={styles.activeIndicator} />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          <main className={styles.mainContent}>
            <div className={styles.headerCard}>
              <div className={styles.headerContent}>
                <div className={styles.headerMain}>
                  <span className={styles.headerIcon}>
                    {activeSectionData?.icon}
                  </span>
                  <div className={styles.headerText}>
                    <h2 className={styles.pageTitle}>
                      {activeSectionData?.label} News
                    </h2>
                    <p className={styles.subtitle}>
                      Manage articles • {activeSection}
                    </p>
                  </div>
                </div>
                <div className={styles.activeBadge}>
                  Active: <span>{activeSection}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className={styles.logoutBtn}
                  type="button"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className={styles.contentCard}>
              <MainSection section={activeSection} />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
