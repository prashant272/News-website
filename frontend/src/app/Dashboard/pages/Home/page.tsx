"use client";

import React, { useState, useContext, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from "../../ProtectedRoute/ProtectedRoute";
import MainSection from '@/app/Dashboard/Components/Home/MainSection/Main';
import AINewsManagement from "@/app/Dashboard/Components/Home/AINewsManagement/AINewsManagement";
import styles from './Page.module.scss';
import { UserContext } from "@/app/Dashboard/Context/ManageUserContext";

const sections = [
  { id: 'news_management' as const, label: 'News Management', icon: '📝' },
  { id: 'ai_news' as const, label: 'AI News', icon: '🤖' },
  { id: 'ad_management' as const, label: 'Ad Management', icon: '📢' },
  { id: 'previous_news' as const, label: 'Previous News', icon: '📁' },
  { id: 'analytics' as const, label: 'Analytics', icon: '📊' },
  { id: 'facebook_settings' as const, label: 'Facebook Post', icon: '📱' },
  { id: 'user_management' as const, label: 'User Management', icon: '👥' },
] as const;

type SectionId = typeof sections[number]['id'];

export default function NewsAdminPage() {
  const userCtx = useContext(UserContext);
  const userRole = userCtx?.UserAuthData?.role;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const searchParams = useSearchParams();

  // Filter sections based on role
  const availableSections = sections.filter(s => {
    if (s.id === 'analytics' || s.id === 'user_management') {
      return isSuperAdmin;
    }
    return true;
  });

  // Read initial section from URL params (used by Facebook OAuth callback redirect)
  const urlSection = searchParams.get('section') as SectionId | null;
  const validSection = urlSection && sections.find(s => s.id === urlSection) ? urlSection : null;

  const [activeSection, setActiveSection] = useState<SectionId>(validSection || 'news_management');
  const activeSectionData = sections.find(s => s.id === activeSection);
  const [draftToEdit, setDraftToEdit] = useState<any>(null);

  // Update section if URL param changes (e.g. FB OAuth redirect arrives)
  useEffect(() => {
    if (validSection) {
      setActiveSection(validSection);
    }
  }, [validSection]);


  const handleLogout = () => {
    userCtx?.logout();
  };

  const handleEditDraft = (draft: any) => {
    setDraftToEdit(draft);
    setActiveSection('news_management');
  };

  return (
    <ProtectedRoute>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.mobileTabs}>
            <div className={styles.mobileTabsContainer}>
              <div className={styles.tabsList}>
                {availableSections.map(section => (
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
              {availableSections.map(section => (
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

            <div className={styles.sidebarUserInfo}>
              <div className={styles.userAvatar}>
                {userCtx?.UserAuthData?.profilepic ? (
                  <img src={userCtx?.UserAuthData?.profilepic} alt="Profile" />
                ) : (
                  <span className={styles.avatarPlaceholder}>
                    {userCtx?.UserAuthData?.name?.[0] || 'U'}
                  </span>
                )}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>
                  {userCtx?.UserAuthData?.name || 'Logged User'}
                </span>
                <span className={styles.userRole}>
                  {userCtx?.UserAuthData?.role?.replace('_', ' ') || 'User'}
                </span>
              </div>
            </div>
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
              {activeSection === 'ai_news' ? (
                <AINewsManagement onEdit={handleEditDraft} />
              ) : (
                <MainSection section={activeSection as any} initialDraft={activeSection === 'news_management' ? draftToEdit : null} />
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
