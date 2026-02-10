"use client";

import React, { useState, useEffect, useCallback, ChangeEvent, FC, useContext, useMemo } from "react";
import { UserContext } from "@/app/Dashboard/Context/ManageUserContext";
import { newsService, NewsItem, useNewsBySection, useAddNews, useUpdateNews, useDeleteNews } from "@/app/Dashboard/hooks/NewsApi";
import styles from "./Main.module.scss";

interface LatestNewsSectionProps {
  section:
    | "india"
    | "sports"
    | "business"
    | "technology"
    | "entertainment"
    | "lifestyle"
    | "world"
    | "health"
    | "state";
}

const LatestNewsSection: FC<LatestNewsSectionProps> = ({ section }) => {
  const { UserAuthData } = useContext(UserContext) as any;
  const userPermissions = UserAuthData?.permissions || {};
  const userRole = UserAuthData?.role || "USER";

  const canCreate = userPermissions.create !== false;
  const canRead = userPermissions.read !== false;
  const canUpdate = userPermissions.update !== false;
  const canDelete = userPermissions.delete !== false;

  const { data: newsData, loading: fetchLoading, error: fetchError, refetch } = useNewsBySection(section);

  const { mutate: addNews, loading: addLoading } = useAddNews();
  const { mutate: updateNews } = useUpdateNews(section);
  const { mutate: deleteNews } = useDeleteNews(section);

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published" | "archived">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showToast, setShowToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formState, setFormState] = useState<Partial<NewsItem>>({
    title: "",
    slug: "",
    category: "",
    content: "",
    tags: [],
    status: "draft",
  });

  const processedNewsData = useMemo<NewsItem[]>(() => newsData ?? [], [newsData]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 2800);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const showNotification = useCallback((message: string, type: "success" | "error") => {
    setShowToast({ message, type });
  }, []);

  const resetForm = useCallback(() => {
    setFormState({
      title: "",
      slug: "",
      category: "",
      content: "",
      tags: [],
      status: "draft",
    });
    setEditingSlug(null);
  }, []);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const handleChange = useCallback(
    (field: keyof NewsItem) =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setFormState((prev) => {
          const updated = { ...prev, [field]: value };
          if (field === "title" && !editingSlug) {
            updated.slug = generateSlug(value);
          }
          return updated;
        });
      },
    [editingSlug]
  );

  const handleTagsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setFormState((prev) => ({ ...prev, tags }));
  }, []);

  const handleAdd = useCallback(async () => {
    if (!canCreate) {
      showNotification("No permission to create articles", "error");
      return;
    }

    if (!formState.title || !formState.slug || !formState.content) {
      showNotification("Title, Slug and Content are required", "error");
      return;
    }

    try {
      await addNews({
        ...formState,
        section,
        publishedAt: new Date().toISOString(),
      } as NewsItem & { section: string });

      showNotification("Article created", "success");
      resetForm();
      refetch();
    } catch (err: any) {
      showNotification(err.message || "Failed to create article", "error");
    }
  }, [canCreate, formState, addNews, section, resetForm, refetch, showNotification]);

  const startEdit = useCallback(
    (item: NewsItem) => {
      if (!canUpdate) {
        showNotification("No permission to edit articles", "error");
        return;
      }
      setEditingSlug(item.slug);
      setFormState({ ...item });
      window.scrollTo({ top: 120, behavior: "smooth" });
    },
    [canUpdate, showNotification]
  );

  const handleUpdate = useCallback(async () => {
    if (!canUpdate || !editingSlug) return;

    try {
      await updateNews({
        slug: editingSlug,
        news: formState,
      });

      showNotification("Article updated", "success");
      resetForm();
      refetch();
    } catch (err: any) {
      showNotification(err.message || "Update failed", "error");
    }
  }, [canUpdate, editingSlug, formState, updateNews, resetForm, refetch, showNotification]);

  const handleDelete = useCallback(
    async (slug: string) => {
      if (!canDelete) {
        showNotification("No permission to delete articles", "error");
        return;
      }
      if (!confirm("Delete this article permanently?")) return;

      try {
        await deleteNews({ slug });
        showNotification("Article deleted", "success");
        refetch();
      } catch (err: any) {
        showNotification(err.message || "Delete failed", "error");
      }
    },
    [canDelete, deleteNews, refetch, showNotification]
  );

  const handleDuplicate = useCallback(
    (item: NewsItem) => {
      if (!canCreate) {
        showNotification("No permission to duplicate articles", "error");
        return;
      }
      setEditingSlug(null);
      setFormState({
        ...item,
        title: `${item.title} (Copy)`,
        slug: `${item.slug}-copy-${Date.now().toString(36).slice(-4)}`,
        status: "draft",
      });
      window.scrollTo({ top: 120, behavior: "smooth" });
    },
    [canCreate, showNotification]
  );

  const filteredAndSortedItems = useMemo<NewsItem[]>(() => {
    let result = [...processedNewsData];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((item) => item.status === filterStatus);
    }

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime());
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [processedNewsData, searchQuery, filterStatus, sortBy]);

  if (fetchLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading {section} news...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={styles.errorState}>
        <h3>Failed to load articles</h3>
        <p>{fetchError}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

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

  const isEditing = editingSlug !== null;

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
                <span className={styles.icon}>📰</span>
                {section.charAt(0).toUpperCase() + section.slice(1)} News
              </h1>
              <p className={styles.headerSubtitle}>
                Manage {section} articles
                {userRole !== "USER" && <span className={styles.roleBadge}> • {userRole}</span>}
              </p>
            </div>

            <div className={styles.stats}>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>{processedNewsData.length}</span>
                <span className={styles.statLabel}>Total</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>
                  {processedNewsData.filter((i) => i.status === "published").length}
                </span>
                <span className={styles.statLabel}>Published</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>
                  {processedNewsData.filter((i) => i.status === "draft").length}
                </span>
                <span className={styles.statLabel}>Drafts</span>
              </div>
            </div>
          </div>
        </div>

        {(canCreate || canUpdate) && (
          <div className={styles.editor}>
            <div className={styles.editorHeader}>
              <h2 className={styles.editorTitle}>
                {isEditing ? (
                  <>
                    <span className={styles.editorIcon}>✏️</span> Edit Article
                  </>
                ) : (
                  <>
                    <span className={styles.editorIcon}>➕</span> Create Article
                  </>
                )}
              </h2>
              {isEditing && (
                <button onClick={resetForm} className={styles.closeBtn}>
                  ✕
                </button>
              )}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Title <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formState.title ?? ""}
                  onChange={handleChange("title")}
                  placeholder="Enter title..."
                  disabled={!(canCreate || canUpdate)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Slug <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={formState.slug ?? ""}
                  onChange={handleChange("slug")}
                  placeholder="article-slug"
                  disabled={!(canCreate || canUpdate)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Category *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formState.category ?? ""}
                  onChange={handleChange("category")}
                  placeholder="Politics, Cricket, ..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Sub-category</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formState.subCategory ?? ""}
                  onChange={handleChange("subCategory")}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Status</label>
                <select
                  value={formState.status ?? "draft"}
                  onChange={handleChange("status")}
                  className={styles.select}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Image URL</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formState.image ?? ""}
                  onChange={handleChange("image")}
                  placeholder="https://..."
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Summary</label>
                <textarea
                  className={styles.textarea}
                  value={formState.summary ?? ""}
                  onChange={handleChange("summary")}
                  rows={3}
                  placeholder="Short summary..."
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>
                  Content <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  value={formState.content ?? ""}
                  onChange={handleChange("content")}
                  rows={12}
                  placeholder="Write article content here..."
                />
                <div className={styles.charCount}>
                  {(formState.content?.length || 0)} chars •{" "}
                  {Math.ceil((formState.content?.length || 0) / 500)} min read
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Tags</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formState.tags?.join(", ") ?? ""}
                  onChange={handleTagsChange}
                  placeholder="comma, separated, tags"
                />
                <small className={styles.hint}>Separate with commas</small>
              </div>
            </div>

            <div className={styles.formActions}>
              {isEditing ? (
                <>
                  <button onClick={handleUpdate} className={styles.primaryBtn} disabled={!canUpdate}>
                    Update Article
                  </button>
                  <button onClick={resetForm} className={styles.secondaryBtn}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAdd}
                    className={styles.primaryBtn}
                    disabled={!canCreate || addLoading}
                  >
                    {addLoading ? "Publishing..." : "Publish"}
                  </button>
                  <button
                    onClick={() => {
                      setFormState((p) => ({ ...p, status: "draft" }));
                      handleAdd();
                    }}
                    className={styles.secondaryBtn}
                    disabled={!canCreate || addLoading}
                  >
                    Save Draft
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className={styles.articlesSection}>
          <div className={styles.articlesSectionHeader}>
            <h2 className={styles.sectionTitle}>Articles ({filteredAndSortedItems.length})</h2>

            <div className={styles.toolbar}>
              <div className={styles.searchBox}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, content, tags..."
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.filters}>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as "all" | "draft" | "published" | "archived")}
                  className={styles.filterSelect}
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "title")}
                  className={styles.filterSelect}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title">Title A–Z</option>
                </select>

                <div className={styles.viewToggle}>
                  <button
                    className={`${styles.viewBtn} ${viewMode === "grid" ? styles.viewBtnActive : ""}`}
                    onClick={() => setViewMode("grid")}
                  >
                    ▦
                  </button>
                  <button
                    className={`${styles.viewBtn} ${viewMode === "list" ? styles.viewBtnActive : ""}`}
                    onClick={() => setViewMode("list")}
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>
          </div>

          {filteredAndSortedItems.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📄</div>
              <h3>No articles found</h3>
              <p>
                {searchQuery || filterStatus !== "all"
                  ? "Try different search or filter"
                  : "Create your first article above"}
              </p>
            </div>
          ) : (
            <div className={`${styles.grid} ${viewMode === "list" ? styles.listView : ""}`}>
              {filteredAndSortedItems.map((item) => (
                <article key={item.slug} className={styles.card}>
                  {item.image && (
                    <div className={styles.cardImage}>
                      <img src={item.image} alt={item.title} loading="lazy" />
                      <span className={`${styles.statusBadge} ${styles[item.status ?? "draft"]}`}>
                        {item.status ?? "draft"}
                      </span>
                    </div>
                  )}

                  <div className={styles.cardContent}>
                    <div className={styles.cardMeta}>
                      <span className={styles.categoryBadge}>{item.category}</span>
                      {item.subCategory && (
                        <span className={styles.subCategoryBadge}>{item.subCategory}</span>
                      )}
                    </div>

                    <h3 className={styles.cardTitle}>{item.title}</h3>

                    <p className={styles.cardSummary}>
                      {item.summary || item.content.slice(0, 160)}
                      {(item.summary || item.content).length > 160 ? "..." : ""}
                    </p>

                    {!!item.tags?.length && (
                      <div className={styles.tags}>
                        {item.tags.slice(0, 5).map((tag) => (
                          <span key={tag} className={styles.tag}>
                            #{tag}
                          </span>
                        ))}
                        {item.tags.length > 5 && <span className={styles.tagMore}>+{item.tags.length - 5}</span>}
                      </div>
                    )}

                    <div className={styles.cardFooter}>
                      <div className={styles.cardInfo}>
                        <span className={styles.infoItem}>
                          <span className={styles.infoIcon}>🔗</span>
                          {item.slug}
                        </span>
                        {item.publishedAt && (
                          <span className={styles.infoItem}>
                            <span className={styles.infoIcon}>📅</span>
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className={styles.cardActions}>
                        <button
                          onClick={() => handleDuplicate(item)}
                          className={styles.duplicateBtn}
                          disabled={!canCreate}
                          title={!canCreate ? "No permission to duplicate" : "Duplicate"}
                        >
                          📋
                        </button>
                        <button
                          onClick={() => startEdit(item)}
                          className={styles.editBtn}
                          disabled={!canUpdate}
                          title={!canUpdate ? "No permission to edit" : "Edit"}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(item.slug)}
                          className={styles.deleteBtn}
                          disabled={!canDelete}
                          title={!canDelete ? "No permission to delete" : "Delete"}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LatestNewsSection;