"use client";
import React, { useState, useEffect, useCallback, ChangeEvent, FC, useContext, useMemo } from "react";
import { UserContext } from "@/app/Dashboard/Context/ManageUserContext";
import { baseURL } from "@/Utils/Utils";
import {
  newsService,
  NewsItem,
  useNewsBySection,
  useAddNews,
  useUpdateNews,
  useDeleteNews,
  useSetNewsFlags,
  useNewsVisibilityStats,
} from "@/app/hooks/NewsApi";
import { Ad, useAllAds, useAddAd } from "@/app/hooks/useAds";
import styles from "./Main.module.scss";

interface MainSectionProps {
  section:
    | "india"
    | "sports"
    | "business"
    | "technology"
    | "entertainment"
    | "lifestyle"
    | "world"
    | "health"
    | "awards";
}

const MainSection: FC<MainSectionProps> = ({ section }) => {
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
  const { mutate: setFlags, loading: flagsLoading } = useSetNewsFlags(section);

  const { data: adsData, loading: adsLoading, error: adsError, refetch: refetchAds } = useAllAds();
  const { mutate: addAd, loading: addAdLoading } = useAddAd();

  const [activeTab, setActiveTab] = useState<"articles" | "ads">("articles");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published" | "archived">("all");
  const [filterVisibility, setFilterVisibility] = useState<"all" | "visible" | "hidden">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showToast, setShowToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [adFormState, setAdFormState] = useState<Partial<Ad>>({
    title: "",
    link: "",
    imageUrl: "",
    isActive: true,
  });
  const [adImagePreview, setAdImagePreview] = useState<string | null>(null);

  const [formState, setFormState] = useState<Partial<NewsItem>>({
    title: "",
    slug: "",
    category: "",
    content: "",
    tags: [],
    status: "draft",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(false);

  const processedNewsData = useMemo<NewsItem[]>(() => newsData ?? [], [newsData]);
  const processedAdsData = useMemo<Ad[]>(() => adsData ?? [], [adsData]);

  const visibilityStats = useNewsVisibilityStats(processedNewsData);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 2800);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    if (activeTab === "articles" && !editingSlug) {
      setFormState((prev) => ({
        ...prev,
        category: section.charAt(0).toUpperCase() + section.slice(1),
      }));
    }
  }, [activeTab, section, editingSlug]);

  useEffect(() => {
    if (fetchError) {
      showNotification(fetchError, "error");
    }
  }, [fetchError]);

  const showNotification = useCallback((message: string, type: "success" | "error") => {
    setShowToast({ message, type });
  }, []);

  const resetForm = useCallback(() => {
    setFormState({
      title: "",
      slug: "",
      category: section.charAt(0).toUpperCase() + section.slice(1),
      content: "",
      tags: [],
      status: "draft",
    });
    setImagePreview(null);
    setShowImage(false);
    setEditingSlug(null);
  }, [section]);

  const resetAdForm = useCallback(() => {
    setAdFormState({
      title: "",
      link: "",
      imageUrl: "",
      isActive: true,
    });
    setAdImagePreview(null);
    setEditingAdId(null);
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

  const handleAdChange = useCallback(
    (field: keyof Ad) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = field === "isActive" ? e.target.value === "true" : e.target.value;
        setAdFormState((prev) => ({ ...prev, [field]: value }));
      },
    []
  );

  const handleAdImageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showNotification("Please select an image file", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification("Image too large (max 5MB)", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAdFormState((prev) => ({ ...prev, imageUrl: dataUrl }));
        setAdImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);

      e.target.value = "";
    },
    [showNotification]
  );

  const handleAddAd = useCallback(async () => {
    if (!canCreate) {
      showNotification("No permission to create ads", "error");
      return;
    }
    if (!adFormState.title || !adFormState.link || !adFormState.imageUrl) {
      showNotification("Title, Link, and Image are required", "error");
      return;
    }
    try {
      await addAd(adFormState as Omit<Ad, "_id" | "createdAt" | "updatedAt">);
      showNotification("Ad created successfully", "success");
      resetAdForm();
      refetchAds();
    } catch (err: any) {
      showNotification(err.message || "Failed to create ad", "error");
    }
  }, [canCreate, adFormState, addAd, resetAdForm, refetchAds, showNotification]);

  const handleUpdateAd = useCallback(async () => {
    if (!canUpdate || !editingAdId) return;
    try {
      const response = await fetch(`${baseURL}/ads/update/${editingAdId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adFormState),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.msg);
      showNotification("Ad updated successfully", "success");
      resetAdForm();
      refetchAds();
    } catch (err: any) {
      showNotification(err.message || "Failed to update ad", "error");
    }
  }, [canUpdate, editingAdId, adFormState, resetAdForm, refetchAds, showNotification]);

  const handleDeleteAd = useCallback(
    async (id: string) => {
      if (!canDelete) {
        showNotification("No permission to delete ads", "error");
        return;
      }
      if (!confirm("Delete this ad permanently?")) return;
      try {
        const response = await fetch(`${baseURL}/ads/delete/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.msg);
        showNotification("Ad deleted successfully", "success");
        refetchAds();
      } catch (err: any) {
        showNotification(err.message || "Failed to delete ad", "error");
      }
    },
    [canDelete, refetchAds, showNotification]
  );

  const startEditAd = useCallback(
    (ad: Ad) => {
      if (!canUpdate) {
        showNotification("No permission to edit ads", "error");
        return;
      }
      setEditingAdId(ad._id!);
      setAdFormState({ ...ad });
      setAdImagePreview(ad.imageUrl || null);
      window.scrollTo({ top: 120, behavior: "smooth" });
    },
    [canUpdate, showNotification]
  );

  const handleTagsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setFormState((prev) => ({ ...prev, tags }));
  }, []);

  const handleImageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showNotification("Please select an image file", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification("Image too large (max 5MB)", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormState((prev) => ({ ...prev, image: dataUrl }));
        setImagePreview(dataUrl);
        setShowImage(true);
      };
      reader.readAsDataURL(file);

      e.target.value = "";
    },
    [showNotification]
  );

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
      setImagePreview(item.image || null);
      setShowImage(!!item.image);
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

  const handleToggleFlag = useCallback(
    async (slug: string, field: "isLatest" | "isTrending" | "isHidden", newValue: boolean) => {
      if (flagsLoading) return;
      try {
        await setFlags({ slug, [field]: newValue });
        showNotification(
          `Article ${newValue ? "marked as" : "removed from"} ${
            field === "isLatest" ? "Latest" : field === "isTrending" ? "Trending" : "Hidden"
          }`,
          "success"
        );
        refetch();
      } catch (err: any) {
        showNotification(err.message || "Failed to update flag", "error");
      }
    },
    [setFlags, flagsLoading, showNotification, refetch]
  );

  const handleToggleVisibility = useCallback(
    (slug: string, currentHiddenState: boolean) => {
      handleToggleFlag(slug, "isHidden", !currentHiddenState);
    },
    [handleToggleFlag]
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
      setImagePreview(item.image || null);
      setShowImage(!!item.image);
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

    if (filterVisibility !== "all") {
      if (filterVisibility === "hidden") {
        result = result.filter((item) => item.isHidden === true);
      } else if (filterVisibility === "visible") {
        result = result.filter((item) => !item.isHidden);
      }
    }

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime());
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [processedNewsData, searchQuery, filterStatus, filterVisibility, sortBy]);

  if (fetchLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading {section} news...</p>
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
  const isEditingAd = editingAdId !== null;

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
                Manage {section} articles and advertisements
                {userRole !== "USER" && <span className={styles.roleBadge}> • {userRole}</span>}
              </p>
            </div>
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>{processedNewsData.length}</span>
                <span className={styles.statLabel}>Articles</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>
                  {processedNewsData.filter((i) => i.status === "published").length}
                </span>
                <span className={styles.statLabel}>Published</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>{processedAdsData.length}</span>
                <span className={styles.statLabel}>Ads</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tabContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "articles" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("articles")}
            >
              <span className={styles.tabIcon}>📄</span>
              <span>Articles</span>
              <span className={styles.tabBadge}>{processedNewsData.length}</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === "ads" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("ads")}
            >
              <span className={styles.tabIcon}>📢</span>
              <span>Advertisements</span>
              <span className={styles.tabBadge}>{processedAdsData.length}</span>
            </button>
          </div>
        </div>

        {activeTab === "articles" && (
          <>
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
                    <label className={styles.label}>Featured Image</label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className={styles.hidden}
                      onChange={handleImageChange}
                    />
                    <div
                      className={styles.imageUploadArea}
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      {showImage || imagePreview || formState.image ? (
                        <div className={styles.previewContainer}>
                          <img
                            src={imagePreview || formState.image || ""}
                            alt="Preview"
                            className={styles.imagePreview}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/fallback-image.jpg";
                            }}
                          />
                          <button
                            type="button"
                            className={styles.removeImageBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormState((prev) => ({ ...prev, image: "" }));
                              setImagePreview(null);
                              setShowImage(false);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <span className={styles.uploadIcon}>📸</span>
                          <p>Click to upload image</p>
                          <small>PNG, JPG, max 5MB</small>
                        </div>
                      )}
                    </div>
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
                      {(formState.content?.length || 0)} chars • {Math.ceil((formState.content?.length || 0) / 500)}{" "}
                      min read
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
                        Cancel Edit
                      </button>
                    </>
                  ) : (
                    <button onClick={handleAdd} className={styles.primaryBtn} disabled={!canCreate || addLoading}>
                      {addLoading ? "Creating..." : "Create Article"}
                    </button>
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
                      type="text"
                      className={styles.searchInput}
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className={styles.filters}>
                    <select
                      className={styles.filterSelect}
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                    <select
                      className={styles.filterSelect}
                      value={filterVisibility}
                      onChange={(e) => setFilterVisibility(e.target.value as any)}
                    >
                      <option value="all">All Visibility ({visibilityStats.total})</option>
                      <option value="visible">👁️ Visible ({visibilityStats.visible})</option>
                      <option value="hidden">🙈 Hidden ({visibilityStats.hidden})</option>
                    </select>
                    <select
                      className={styles.filterSelect}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="title">By Title</option>
                    </select>
                  </div>
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

              {filteredAndSortedItems.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📄</div>
                  <h3>No articles found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className={`${styles.grid} ${viewMode === "list" ? styles.listView : ""}`}>
                  {filteredAndSortedItems.map((item) => (
                    <article key={item.slug} className={`${styles.card} ${item.isHidden ? styles.hiddenCard : ""}`}>
                      <div className={styles.cardImage}>
                        {item.image ? (
                          <img src={item.image} alt={item.title} loading="lazy" />
                        ) : (
                          <div
                            style={{
                              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
                              height: "100%",
                            }}
                          />
                        )}
                        <span className={`${styles.statusBadge} ${styles[item.status || "draft"]}`}>
                          {item.status || "draft"}
                        </span>
                      </div>
                      <div className={styles.cardContent}>
                        <div className={styles.cardMeta}>
                          <span className={styles.categoryBadge}>{item.category}</span>
                          {item.subCategory && <span className={styles.subCategoryBadge}>{item.subCategory}</span>}
                        </div>
                        <h3 className={styles.cardTitle}>{item.title}</h3>
                        {item.summary && <p className={styles.cardSummary}>{item.summary}</p>}
                        {item.tags && item.tags.length > 0 && (
                          <div className={styles.tags}>
                            {item.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className={styles.tag}>
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className={styles.tagMore}>+{item.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                        <div className={styles.cardFooter}>
                          <div className={styles.cardInfo}>
                            <span className={styles.infoItem}>
                              <span className={styles.infoIcon}>📅</span>
                              {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "No date"}
                            </span>
                            <span className={styles.infoItem}>
                              <span className={styles.infoIcon}>🔗</span>
                              {item.slug}
                            </span>
                          </div>
                          <div className={styles.cardActions}>
                            <button
                              onClick={() => handleToggleVisibility(item.slug, item.isHidden || false)}
                              className={styles.visibilityBtn}
                              disabled={!canUpdate || flagsLoading}
                              title={item.isHidden ? "Unhide" : "Hide"}
                            >
                              {item.isHidden ? "👁️" : "🙈"}
                            </button>
                            <button
                              onClick={() => handleDuplicate(item)}
                              className={styles.duplicateBtn}
                              disabled={!canCreate}
                              title="Duplicate"
                            >
                              📋
                            </button>
                            <button
                              onClick={() => startEdit(item)}
                              className={styles.editBtn}
                              disabled={!canUpdate}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(item.slug)}
                              className={styles.deleteBtn}
                              disabled={!canDelete}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                          <button
                            onClick={() => handleToggleFlag(item.slug, "isLatest", !item.isLatest)}
                            className={`${styles.flagBtn} ${item.isLatest ? styles.flagActive : ""}`}
                            disabled={!canUpdate || flagsLoading}
                          >
                            ⭐ {item.isLatest ? "Latest" : "Mark Latest"}
                          </button>
                          <button
                            onClick={() => handleToggleFlag(item.slug, "isTrending", !item.isTrending)}
                            className={`${styles.flagBtn} ${item.isTrending ? styles.flagActive : ""}`}
                            disabled={!canUpdate || flagsLoading}
                          >
                            🔥 {item.isTrending ? "Trending" : "Mark Trending"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "ads" && (
          <>
            {(canCreate || canUpdate) && (
              <div className={styles.editor}>
                <div className={styles.editorHeader}>
                  <h2 className={styles.editorTitle}>
                    {isEditingAd ? (
                      <>
                        <span className={styles.editorIcon}>✏️</span> Edit Advertisement
                      </>
                    ) : (
                      <>
                        <span className={styles.editorIcon}>📢</span> Create Advertisement
                      </>
                    )}
                  </h2>
                  {isEditingAd && (
                    <button onClick={resetAdForm} className={styles.closeBtn}>
                      ✕
                    </button>
                  )}
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Ad Title <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      value={adFormState.title ?? ""}
                      onChange={handleAdChange("title")}
                      placeholder="Enter ad title..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Target Link <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="url"
                      className={styles.input}
                      value={adFormState.link ?? ""}
                      onChange={handleAdChange("link")}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Status</label>
                    <select
                      value={adFormState.isActive ? "true" : "false"}
                      onChange={handleAdChange("isActive")}
                      className={styles.select}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>
                      Ad Image <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="ad-file-upload"
                      type="file"
                      accept="image/*"
                      className={styles.hidden}
                      onChange={handleAdImageChange}
                    />
                    <div
                      className={styles.imageUploadArea}
                      onClick={() => document.getElementById("ad-file-upload")?.click()}
                    >
                      {adImagePreview || adFormState.imageUrl ? (
                        <div className={styles.previewContainer}>
                          <img
                            src={adImagePreview || adFormState.imageUrl || ""}
                            alt="Preview"
                            className={styles.imagePreview}
                          />
                          <button
                            type="button"
                            className={styles.removeImageBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setAdFormState((prev) => ({ ...prev, imageUrl: "" }));
                              setAdImagePreview(null);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <span className={styles.uploadIcon}>📸</span>
                          <p>Click to upload ad image</p>
                          <small>PNG, JPG, max 5MB</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.formActions}>
                  {isEditingAd ? (
                    <>
                      <button onClick={handleUpdateAd} className={styles.primaryBtn} disabled={!canUpdate}>
                        Update Advertisement
                      </button>
                      <button onClick={resetAdForm} className={styles.secondaryBtn}>
                        Cancel Edit
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddAd}
                      className={styles.primaryBtn}
                      disabled={!canCreate || addAdLoading}
                    >
                      {addAdLoading ? "Creating..." : "Create Advertisement"}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className={styles.articlesSection}>
              <div className={styles.articlesSectionHeader}>
                <h2 className={styles.sectionTitle}>Advertisements ({processedAdsData.length})</h2>
              </div>
              {adsLoading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <p>Loading ads...</p>
                </div>
              ) : processedAdsData.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📢</div>
                  <h3>No advertisements found</h3>
                  <p>Create your first advertisement to get started</p>
                </div>
              ) : (
                <div className={styles.grid}>
                  {processedAdsData.map((ad) => (
                    <article key={ad._id} className={styles.card}>
                      <div className={styles.cardImage}>
                        {ad.imageUrl ? (
                          <img src={ad.imageUrl} alt={ad.title} loading="lazy" />
                        ) : (
                          <div
                            style={{
                              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(251, 146, 60, 0.1))",
                              height: "100%",
                            }}
                          />
                        )}
                        <span className={`${styles.statusBadge} ${ad.isActive ? styles.published : styles.draft}`}>
                          {ad.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className={styles.cardContent}>
                        <h3 className={styles.cardTitle}>{ad.title}</h3>
                        <p className={styles.cardSummary}>
                          <a href={ad.link} target="_blank" rel="noopener noreferrer" className={styles.adLink}>
                            {ad.link}
                          </a>
                        </p>
                        <div className={styles.cardFooter}>
                          <div className={styles.cardActions}>
                            <button
                              onClick={() => startEditAd(ad)}
                              className={styles.editBtn}
                              disabled={!canUpdate}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad._id!)}
                              className={styles.deleteBtn}
                              disabled={!canDelete}
                              title="Delete"
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
          </>
        )}
      </div>
    </div>
  );
};

export default MainSection;
