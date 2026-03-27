"use client";
import React, { useState, useCallback, FC, useContext, useEffect } from "react";
import dynamic from "next/dynamic";
import { UserContext } from "@/app/Dashboard/Context/ManageUserContext";
import styles from "./Main.module.scss";
import { NewsItem } from "@/app/hooks/NewsApi";

// Lazy-load sub-components to optimize initial bundle size
const NewsManager = dynamic(() => import("./components/NewsManager"), {
  loading: () => <div className={styles.loading}>Loading News Manager...</div>
});
const AdManager = dynamic(() => import("./components/AdManager"), {
  loading: () => <div className={styles.loading}>Loading Ad Manager...</div>
});
const UserManager = dynamic(() => import("./components/UserManager"), {
  loading: () => <div className={styles.loading}>Loading User Manager...</div>
});
const AnalyticsDashboard = dynamic(() => import("./components/AnalyticsDashboard"), {
  loading: () => <div className={styles.loading}>Loading Analytics...</div>
});
const FacebookManager = dynamic(() => import("./components/FacebookManager"), {
  loading: () => <div className={styles.loading}>Loading Facebook Settings...</div>
});
const LinkedInManager = dynamic(() => import("./components/LinkedInManager"), {
  loading: () => <div className={styles.loading}>Loading LinkedIn Settings...</div>
});
const TwitterManager = dynamic(() => import("./components/TwitterManager"), {
  loading: () => <div className={styles.loading}>Loading Twitter Settings...</div>
});
const BreakingNewsManager = dynamic(() => import("./components/BreakingNewsManager"), {
  loading: () => <div className={styles.loading}>Loading Breaking News...</div>
});
const CricketManager = dynamic(() => import("./components/CricketManager"), {
  loading: () => <div className={styles.loading}>Loading Cricket Manager...</div>
});
const InternationalProgramManager = dynamic(() => import("./components/InternationalProgramManager"), {
  loading: () => <div className={styles.loading}>Loading International Program Manager...</div>
});

interface MainSectionProps {
  section: 'news_management' | 'ad_management' | 'previous_news' | 'analytics' | 'user_management' | 'facebook_settings' | 'linkedin_settings' | 'twitter_settings' | 'breaking_news' | 'cricket_management' | 'international_programs';
  initialDraft?: NewsItem | null;
}

const MainSection: FC<MainSectionProps> = ({ section, initialDraft }) => {
  const { UserAuthData } = useContext(UserContext) as any;
  const userPermissions = UserAuthData?.permissions || {};
  const userRole = UserAuthData?.role || "USER";
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  const canCreate = userPermissions.create !== false;
  const canRead = userPermissions.read !== false;
  const canUpdate = userPermissions.update !== false;
  const canDelete = userPermissions.delete !== false;

  const [showToast, setShowToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = useCallback((message: string, type: "success" | "error") => {
    setShowToast({ message, type });
    // Auto-hide toast after 3 seconds
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  if (!canRead) {
    return (
      <div className={styles.noPermission}>
        <div className={styles.noPermissionIcon}>🔒</div>
        <h3>Access Denied</h3>
        <p>You don't have permission to view this section.</p>
        <p className={styles.roleInfo}>Role: {userRole}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {showToast && (
        <div className={`${styles.toast} ${styles[showToast.type]}`}>
          <span className={styles.toastIcon}>{showToast.type === "success" ? "✓" : "✕"}</span>
          <span>{showToast.message}</span>
        </div>
      )}
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.mainHeading}>
                <span className={styles.icon}>
                  {section === 'news_management' ? '📝' :
                    section === 'ad_management' ? '📢' :
                      section === 'analytics' ? '📊' :
                        section === 'user_management' ? '👥' :
                          section === 'breaking_news' ? '🔥' :
                          section === 'facebook_settings' ? '📱' :
                            section === 'linkedin_settings' ? '🔗' :
                              section === 'twitter_settings' ? '🐦' :
                                section === 'cricket_management' ? '🏏' :
                                  section === 'international_programs' ? '🌐' : '📁'}
                </span>
                {section === 'news_management' ? 'News Management' :
                  section === 'ad_management' ? 'Ad Management' :
                    section === 'analytics' ? 'Analytics' :
                      section === 'user_management' ? 'User Management' :
                        section === 'breaking_news' ? 'Breaking News' :
                          section === 'facebook_settings' ? 'Facebook Settings' :
                      section === 'linkedin_settings' ? 'LinkedIn Settings' :
                        section === 'twitter_settings' ? 'Twitter Settings' :
                          section === 'cricket_management' ? 'Cricket Management' :
 'Previous News'}
              </h1>
              <p className={styles.headerSubtitle}>
                {section === 'news_management' ? 'Add new articles to any category' :
                  section === 'ad_management' ? 'Manage advertisements across the platform' :
                    section === 'analytics' ? 'Platform overview and performance' :
                      section === 'user_management' ? 'Manage administrators and permissions' :
                        section === 'breaking_news' ? 'Manage live breaking news headlines' :
                          section === 'facebook_settings' ? 'Configure auto-posting to Facebook' :
                            section === 'linkedin_settings' ? 'Configure auto-posting to LinkedIn' :
                              section === 'twitter_settings' ? 'Configure auto-posting to Twitter' :
                                section === 'cricket_management' ? 'Manage cricket tournaments and tracking' :
                              section === 'international_programs' ? 'Manage links in the Awards dropdown' :
                                'View and manage previously published news'}
                {userRole !== "USER" && <span className={styles.roleBadge}> • {userRole}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Modular Sections */}
        {(section === 'news_management' || section === 'previous_news') && (
          <NewsManager
            section={section}
            initialDraft={initialDraft}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            userAuthData={UserAuthData}
            showNotification={showNotification}
          />
        )}

        {section === 'ad_management' && (
          <AdManager
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            showNotification={showNotification}
          />
        )}

        {section === 'user_management' && (
          <UserManager
            isSuperAdmin={isSuperAdmin}
            showNotification={showNotification}
          />
        )}

        {section === 'analytics' && (
          <AnalyticsDashboard
            isSuperAdmin={isSuperAdmin}
          />
        )}

        {section === 'facebook_settings' && (
          <FacebookManager
            showNotification={(msg, type) => setShowToast({ message: msg, type })}
          />
        )}

        {section === 'linkedin_settings' && (
          <LinkedInManager
            showNotification={(msg, type) => setShowToast({ message: msg, type })}
          />
        )}

        {section === 'twitter_settings' && (
          <TwitterManager
            showNotification={(msg, type) => setShowToast({ message: msg, type })}
          />
        )}
        {section === 'breaking_news' && (
          <BreakingNewsManager />
        )}
        {section === 'cricket_management' && (
          <CricketManager />
        )}
        {section === 'international_programs' && (
          <InternationalProgramManager />
        )}
      </div>
    </div>
  );
};

export default MainSection;

