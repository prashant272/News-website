"use client";
import React, { useState, useEffect, useCallback, ChangeEvent, FC, useContext, useMemo } from "react";
import { UserContext } from "@/app/Dashboard/Context/ManageUserContext";
import { API, baseURL } from "@/Utils/Utils";
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
import { FaFacebook, FaWhatsapp, FaShareAlt } from "react-icons/fa";

interface MainSectionProps {
  section: 'news_management' | 'ad_management' | 'previous_news' | 'analytics' | 'user_management' | 'facebook_settings';
  initialDraft?: NewsItem | null;
}

const CATEGORIES = [
  { id: 'india', label: 'India', icon: '🇮🇳' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'business', label: 'Business', icon: '📈' },
  { id: 'technology', label: 'Tech', icon: '💻' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '✨' },
  { id: 'world', label: 'World', icon: '🌍' },
  { id: 'health', label: 'Health', icon: '🏥' },
  { id: 'awards', label: 'Awards', icon: '🏆' },
] as const;

type NewsCategory = typeof CATEGORIES[number]['id'];

const MainSection: FC<MainSectionProps> = ({ section, initialDraft }) => {
  const { UserAuthData } = useContext(UserContext) as any;
  const userPermissions = UserAuthData?.permissions || {};
  const userRole = UserAuthData?.role || "USER";
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const canCreate = userPermissions.create !== false;
  const canRead = userPermissions.read !== false;
  const canUpdate = userPermissions.update !== false;
  const canDelete = userPermissions.delete !== false;

  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('india');

  const { data: newsData, loading: fetchLoading, error: fetchError, refetch } = useNewsBySection(selectedCategory, true);
  const { mutate: addNews, loading: addLoading } = useAddNews();
  const { mutate: updateNews } = useUpdateNews(selectedCategory);
  const { mutate: deleteNews } = useDeleteNews(selectedCategory);
  const { mutate: setFlags, loading: flagsLoading } = useSetNewsFlags(selectedCategory);

  const { data: adsData, loading: adsLoading, error: adsError, refetch: refetchAds } = useAllAds();
  const { mutate: addAd, loading: addAdLoading } = useAddAd();

  const [activeTab, setActiveTab] = useState<string>(section);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published" | "archived">("all");
  const [filterVisibility, setFilterVisibility] = useState<"all" | "visible" | "hidden">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showToast, setShowToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // User Management State
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'ADMIN', designation: '', ProfilePicture: '' });
  const [userProfilePreview, setUserProfilePreview] = useState<string | null>(null);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Facebook State
  const [fbPages, setFbPages] = useState<any[]>([]);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbStatus, setFbStatus] = useState<{ connected: boolean; facebook?: any } | null>(null);
  const [tempFbToken, setTempFbToken] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!isSuperAdmin) return;
    setUsersLoading(true);
    try {
      const res = await API.get(`/auth/all`);
      if (res.data.success) setUsers(res.data.users);
    } catch (err: any) {
      console.error("Fetch users error:", err);
    } finally {
      setUsersLoading(false);
    }
  }, [isSuperAdmin]);

  const fetchAnalytics = useCallback(async () => {
    if (!isSuperAdmin) return;
    setAnalyticsLoading(true);
    try {
      const res = await API.get(`/news/analytics`);
      if (res.data.success) setAnalyticsData(res.data.data);
    } catch (err: any) {
      console.error("Fetch analytics error:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [isSuperAdmin]);

  const fetchFacebookStatus = useCallback(async () => {
    try {
      const res = await API.get(`/fb/global-status`);
      if (res.data.success) setFbStatus(res.data);
    } catch (err) {
      console.error("Fetch FB status error:", err);
    }
  }, []);

  const handleFacebookConnect = async () => {
    setFbLoading(true);
    try {
      const res = await API.get("/fb/auth");
      if (res.data.url) {
        // Open in same window or new tab. User said "redirect_uri", so FB will redirect back.
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      setShowToast({ message: "Failed to connect Facebook", type: "error" });
    } finally {
      setFbLoading(false);
    }
  };

  const handleFacebookCallback = useCallback(async (code: string) => {
    setFbLoading(true);
    try {
      const res = await API.get(`/fb/callback?code=${code}`);
      if (res.data.success) {
        setFbPages(res.data.pages);
        setTempFbToken(res.data.longLivedToken);
        setShowToast({ message: "Select a Facebook Page to finish", type: "success" });
      }
    } catch (err) {
      setShowToast({ message: "Facebook connection failed", type: "error" });
    } finally {
      setFbLoading(false);
    }
  }, []);

  // Save the selected Facebook Page as the GLOBAL system page config
  const handleSaveFacebookPage = async (pageId: string, pageName: string, pageAccessToken: string) => {
    setFbLoading(true);
    try {
      const res = await API.post("/fb/save-global-page", {
        pageId,
        pageName,
        pageAccessToken
      });
      if (res.data.success) {
        setShowToast({ message: "✅ Facebook Page '" + pageName + "' connected! All news will auto-post here.", type: "success" });
        fetchFacebookStatus();
        setFbPages([]);
        setTempFbToken(null);
      }
    } catch (err) {
      setShowToast({ message: "Failed to save Page config", type: "error" });
    } finally {
      setFbLoading(false);
    }
  };

  const handleFacebookTestPost = async () => {
    setFbLoading(true);
    try {
      const res = await API.post("/fb/test-post", {});
      if (res.data.success) {
        setShowToast({ message: "✅ Test post successful on Facebook!", type: "success" });
      } else {
        setShowToast({ message: res.data.msg || "Test post failed", type: "error" });
      }
    } catch (err: any) {
      setShowToast({ message: err.response?.data?.msg || "Test post failed", type: "error" });
    } finally {
      setFbLoading(false);
    }
  };

  const handleDisconnectFacebook = async () => {
    if (!confirm("Disconnect Facebook? Auto-posting will stop.")) return;
    setFbLoading(true);
    try {
      await API.delete("/fb/disconnect");
      setFbStatus({ connected: false, facebook: null });
      setShowToast({ message: "Facebook disconnected.", type: "success" });
    } catch (err) {
      setShowToast({ message: "Failed to disconnect", type: "error" });
    } finally {
      setFbLoading(false);
    }
  };

  useEffect(() => {
    if (section === 'user_management') fetchUsers();
    if (section === 'analytics') fetchAnalytics();
    if (section === 'facebook_settings') fetchFacebookStatus();

    // Check for Facebook OAuth callback code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && section === 'facebook_settings') {
      handleFacebookCallback(code);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [section, fetchUsers, fetchAnalytics, fetchFacebookStatus, handleFacebookCallback]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post(`/auth/create`, userForm);
      if (res.data.success) {
        showNotification("User created successfully", "success");
        setUserForm({ name: '', email: '', password: '', role: 'ADMIN', designation: '', ProfilePicture: '' });
        setUserProfilePreview(null);
        fetchUsers();
      } else {
        showNotification(res.data.msg, "error");
      }
    } catch (err: any) {
      showNotification(err.response?.data?.msg || "Error creating user", "error");
    }
  };

  const handleToggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await API.put(`/auth/update/${id}`, { isActive: !currentStatus });
      if (res.data.success) {
        showNotification("User status updated", "success");
        fetchUsers();
      }
    } catch (err: any) {
      showNotification(err.response?.data?.msg || "Error updating user", "error");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await API.delete(`/auth/${id}`);
      if (res.data.success) {
        showNotification("User deleted", "success");
        fetchUsers();
      }
    } catch (err: any) {
      showNotification(err.response?.data?.msg || "Error deleting user", "error");
    }
  };

  const handleUserProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("Please select an image file", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showNotification("Image too large (max 2MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUserForm(prev => ({ ...prev, ProfilePicture: dataUrl }));
      setUserProfilePreview(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Rest of state and effects...

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
    targetLink: "",
    nominationLink: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(false);

  const processedNewsData = useMemo<NewsItem[]>(() => newsData ?? [], [newsData]);
  const processedAdsData = useMemo<Ad[]>(() => adsData ?? [], [adsData]);

  const visibilityStats = useNewsVisibilityStats(processedNewsData);

  useEffect(() => {
    setActiveTab(section === 'ad_management' ? 'ads' : 'articles');
  }, [section]);

  // Handle Initial Draft from AI News
  useEffect(() => {
    if (initialDraft) {
      // Find matching category ID
      const matchedCat = CATEGORIES.find(c => c.id === initialDraft.category.toLowerCase())?.id || 'india';
      setSelectedCategory(matchedCat);

      setFormState({
        ...initialDraft,
        status: 'draft', // Ensure it stays draft until published
        category: matchedCat.charAt(0).toUpperCase() + matchedCat.slice(1) // Capitalize for display/saving if needed
      });

      setEditingSlug(initialDraft.slug); // Treat as edit to update the existing draft
      setTagsInput(initialDraft.tags?.join(", ") || "");
      setActiveTab('articles');
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  }, [initialDraft]);

  useEffect(() => {
    if (activeTab === "articles" && !editingSlug) {
      setFormState((prev) => ({
        ...prev,
        category: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1),
      }));
    }
  }, [activeTab, selectedCategory, editingSlug]);

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
      category: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1),
      content: "",
      tags: [],
      status: "draft",
      targetLink: "",
      nominationLink: "",
    });
    setImagePreview(null);
    setShowImage(false);
    setEditingSlug(null);
    setTagsInput("");
  }, [selectedCategory]);

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
    const val = e.target.value;
    setTagsInput(val);
    const tags = val.split(",").map((t) => t.trim()).filter(Boolean);
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
      const authorName = UserAuthData?.name || "Prime Time News";
      const currentUserId = UserAuthData?.userId || UserAuthData?._id || UserAuthData?.id;

      console.log("Creating article with authorId:", currentUserId);

      await addNews({
        ...formState,
        section: selectedCategory,
        author: authorName,
        authorId: currentUserId || null,
        tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
        publishedAt: new Date().toISOString(),
      } as NewsItem & { section: string });
      showNotification(`Article created by ${authorName}`, "success");
      resetForm();
      refetch();
    } catch (err: any) {
      showNotification(err.message || "Failed to create article", "error");
    }
  }, [canCreate, formState, addNews, section, resetForm, refetch, showNotification, UserAuthData]);

  const startEdit = useCallback(
    (item: NewsItem) => {
      if (!canUpdate) {
        showNotification("No permission to edit articles", "error");
        return;
      }
      setEditingSlug(item.slug);
      setFormState({ ...item });
      setTagsInput(item.tags?.join(", ") || "");
      setImagePreview(item.image || null);
      setShowImage(!!item.image);
      window.scrollTo({ top: 120, behavior: "smooth" });
    },
    [canUpdate, showNotification]
  );

  const handleUpdate = useCallback(async () => {
    if (!canUpdate || !editingSlug) return;
    try {
      const authorName = UserAuthData?.name || "Prime Time News";
      const currentUserId = UserAuthData?.userId || UserAuthData?._id || UserAuthData?.id;

      console.log("Updating article with authorId:", currentUserId);

      await updateNews({
        slug: editingSlug,
        news: {
          ...formState,
          author: authorName,
          authorId: currentUserId || null,
          tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean)
        },
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
          `Article ${newValue ? "marked as" : "removed from"} ${field === "isLatest" ? "Latest" : field === "isTrending" ? "Trending" : "Hidden"
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

  const siteUrl = "https://www.primetimemedia.in";

  const getShareLink = (item: Partial<NewsItem>, platform: 'facebook' | 'whatsapp') => {
    if (!item.slug) return "#";

    const sectionSlug = selectedCategory.toLowerCase();
    const categorySlug = (item.category || selectedCategory).toLowerCase().replace(/\s+/g, '-');
    const fullUrl = `${siteUrl}/Pages/${sectionSlug}/${categorySlug}/${item.slug}`;
    const shareText = `${item.title} | View more news on Prime Time Media:`;

    if (platform === 'facebook') {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    }
    if (platform === 'whatsapp') {
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + fullUrl)}`;
    }
    return "#";
  };

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
                  {section === 'news_management' ? '📝' : section === 'ad_management' ? '📢' : '📁'}
                </span>
                {section === 'news_management' ? 'News Management' :
                  section === 'ad_management' ? 'Ad Management' : 'Previous News'}
              </h1>
              <p className={styles.headerSubtitle}>
                {section === 'news_management' ? 'Add new articles to any category' :
                  section === 'ad_management' ? 'Manage advertisements across the platform' :
                    'View and manage previously published news'}
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

        {section === 'previous_news' && (
          <div className={styles.categoryFilterContainer}>
            <label className={styles.label}>Select Category to View News:</label>
            <div className={styles.categoryPills}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.categoryPill} ${selectedCategory === cat.id ? styles.activePill : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className={styles.pillIcon}>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.tabContainer} style={{ display: 'none' }}>
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

        {section === 'news_management' && (
          <div className={styles.articlesTabContent}>
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
                    <label className={styles.label}>Category <span className={styles.required}>*</span></label>
                    <select
                      className={styles.select}
                      value={selectedCategory}
                      onChange={(e) => {
                        const newCat = e.target.value as NewsCategory;
                        setSelectedCategory(newCat);
                        setFormState(prev => ({
                          ...prev,
                          category: newCat.charAt(0).toUpperCase() + newCat.slice(1)
                        }));
                      }}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
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
                      value={tagsInput}
                      onChange={handleTagsChange}
                      placeholder="comma, separated, tags"
                    />
                    <small className={styles.hint}>Separate with commas</small>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Target Link (More Info)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formState.targetLink ?? ""}
                      onChange={handleChange("targetLink")}
                      placeholder="https://example.com/more-info"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nomination Link</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formState.nominationLink ?? ""}
                      onChange={handleChange("nominationLink")}
                      placeholder="https://example.com/nominate"
                    />
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

                {formState.slug && (
                  <div className={styles.shareSection}>
                    <div className={styles.shareLabel}>
                      <FaShareAlt /> Share this article
                    </div>
                    <div className={styles.shareButtons}>
                      <a
                        href={getShareLink(formState, 'facebook')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.shareBtn} ${styles.facebook}`}
                      >
                        <FaFacebook /> Facebook
                      </a>
                      <a
                        href={getShareLink(formState, 'whatsapp')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.shareBtn} ${styles.whatsapp}`}
                      >
                        <FaWhatsapp /> WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {section === 'previous_news' && (
          <div className={styles.articlesTabContent}>
            {isEditing && (canCreate || canUpdate) && (
              <div className={styles.editor}>
                <div className={styles.editorHeader}>
                  <h2 className={styles.editorTitle}>
                    <span className={styles.editorIcon}>✏️</span> Edit Article
                  </h2>
                  <button onClick={resetForm} className={styles.closeBtn}>
                    ✕
                  </button>
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
                    <label className={styles.label}>Category <span className={styles.required}>*</span></label>
                    <select
                      className={styles.select}
                      value={selectedCategory}
                      onChange={(e) => {
                        const newCat = e.target.value as NewsCategory;
                        setSelectedCategory(newCat);
                        setFormState(prev => ({
                          ...prev,
                          category: newCat.charAt(0).toUpperCase() + newCat.slice(1)
                        }));
                      }}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
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
                      id="prev-file-upload"
                      type="file"
                      accept="image/*"
                      className={styles.hidden}
                      onChange={handleImageChange}
                    />
                    <div
                      className={styles.imageUploadArea}
                      onClick={() => document.getElementById("prev-file-upload")?.click()}
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
                      value={tagsInput}
                      onChange={handleTagsChange}
                      placeholder="comma, separated, tags"
                    />
                    <small className={styles.hint}>Separate with commas</small>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Target Link (More Info)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formState.targetLink ?? ""}
                      onChange={handleChange("targetLink")}
                      placeholder="https://example.com/more-info"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nomination Link</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formState.nominationLink ?? ""}
                      onChange={handleChange("nominationLink")}
                      placeholder="https://example.com/nominate"
                    />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button onClick={handleUpdate} className={styles.primaryBtn}>Update Article</button>
                  <button onClick={resetForm} className={styles.secondaryBtn}>Cancel</button>
                </div>
              </div>
            )}

            <div className={styles.articlesSection}>
              <div className={styles.articlesSectionHeader}>
                <h2 className={styles.sectionTitle}>
                  Previous News: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} ({filteredAndSortedItems.length})
                </h2>
                <div className={styles.toolbar}>
                  {/* Toolbar content ... */}
                  <div className={styles.searchBox}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                      type="text"
                      className={styles.searchInput}
                      placeholder="Search archived articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className={styles.filters}>
                    <select className={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                    <select className={styles.filterSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredAndSortedItems.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📄</div>
                  <h3>No archived news found</h3>
                  <p>Select a different category or adjust search</p>
                </div>
              ) : (
                <div className={`${styles.grid} ${viewMode === "list" ? styles.listView : ""}`}>
                  {filteredAndSortedItems.map((item) => (
                    <article key={item.slug} className={`${styles.card} ${item.isHidden ? styles.hiddenCard : ""}`}>
                      <div className={styles.cardImage}>
                        {item.image ? (
                          <img src={item.image} alt={item.title} loading="lazy" />
                        ) : (
                          <div style={{ background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))", height: "100%" }} />
                        )}
                        <span className={`${styles.statusBadge} ${styles[item.status || "draft"]}`}>
                          {item.status || "draft"}
                        </span>
                      </div>
                      <div className={styles.cardContent}>
                        <div className={styles.cardMeta}>
                          <span className={styles.categoryBadge}>{item.category}</span>
                        </div>
                        <h3 className={styles.cardTitle}>{item.title}</h3>
                        <div className={styles.cardFooter}>
                          <div className={styles.cardActions}>
                            <button
                              onClick={() => handleToggleVisibility(item.slug, item.isHidden || false)}
                              className={styles.visibilityBtn}
                              disabled={!canUpdate || flagsLoading}
                              title={item.isHidden ? "Unhide" : "Hide"}
                            >
                              {item.isHidden ? "👁️" : "🙈"}
                            </button>
                            <button onClick={() => startEdit(item)} className={styles.editBtn} disabled={!canUpdate} title="Edit">✏️</button>
                            <button onClick={() => handleDelete(item.slug)} className={styles.deleteBtn} disabled={!canDelete} title="Delete">🗑️</button>
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
          </div>
        )}

        {section === 'ad_management' && (
          <div className={styles.adsTabContent}>
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
          </div>
        )}

        {section === 'analytics' && isSuperAdmin && (
          <div className={styles.analyticsSection}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>📈</span>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Total Articles</span>
                  <span className={styles.statValue}>{analyticsData?.totalNews || 0}</span>
                </div>
              </div>
            </div>

            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsCard}>
                <h3 className={styles.cardTitle}>Articles by Category</h3>
                <div className={styles.chartList}>
                  {Object.entries(analyticsData?.analyticsByCategory || {}).map(([cat, count]: any) => (
                    <div key={cat} className={styles.chartItem}>
                      <span className={styles.chartLabel}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                      <div className={styles.chartBarContainer}>
                        <div
                          className={styles.chartBar}
                          style={{ width: `${((count as number) / (analyticsData?.totalNews || 1)) * 100}%` }}
                        />
                      </div>
                      <span className={styles.chartCount}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.analyticsCard}>
                <h3 className={styles.cardTitle}>Contributor Performance</h3>
                <div className={styles.chartList}>
                  {Object.entries(analyticsData?.analyticsByAuthor || {}).map(([author, count]: any) => (
                    <div key={author} className={styles.chartItem}>
                      <span className={styles.chartLabel}>{author}</span>
                      <div className={styles.chartBarContainer}>
                        <div
                          className={styles.chartBar}
                          style={{ width: `${((count as number) / (analyticsData?.totalNews || 1)) * 100}%`, backgroundColor: '#4f46e5' }}
                        />
                      </div>
                      <span className={styles.chartCount}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {section === 'user_management' && isSuperAdmin && (
          <div className={styles.userManagementSection}>
            <div className={styles.editor}>
              <h2 className={styles.editorTitle}>Create New Admin/Sub-Admin</h2>
              <form onSubmit={handleCreateUser} className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={userForm.name}
                    onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    value={userForm.email}
                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={userForm.password}
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Role</label>
                  <select
                    className={styles.select}
                    value={userForm.role}
                    onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="USER">User (Editor)</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Distinction / Designation</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={userForm.designation}
                    onChange={e => setUserForm({ ...userForm, designation: e.target.value })}
                    placeholder="e.g. Senior Editor"
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Profile Picture (Photo)</label>
                  <input
                    id="user-profile-upload"
                    type="file"
                    accept="image/*"
                    className={styles.hidden}
                    onChange={handleUserProfilePicChange}
                  />
                  <div
                    className={styles.imageUploadArea}
                    onClick={() => document.getElementById("user-profile-upload")?.click()}
                    style={{ minHeight: '100px', padding: '1rem' }}
                  >
                    {userProfilePreview ? (
                      <div className={styles.previewContainer} style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto' }}>
                        <img
                          src={userProfilePreview}
                          alt="Profile Preview"
                          className={styles.imagePreview}
                          style={{ borderRadius: '50%' }}
                        />
                        <button
                          type="button"
                          className={styles.removeImageBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserForm(prev => ({ ...prev, ProfilePicture: '' }));
                            setUserProfilePreview(null);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <span className={styles.uploadIcon}>👤</span>
                        <p>Upload User Photo</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.formActions} style={{ gridColumn: 'span 2' }}>
                  <button type="submit" className={styles.primaryBtn}>Create User</button>
                </div>
              </form>
            </div>

            <div className={styles.userListCard}>
              <h3 className={styles.sectionTitle}>Manage Users</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.userTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Designation</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className={styles.userTableAvatar}>
                              {u.ProfilePicture ? (
                                <img src={u.ProfilePicture} alt={u.name} />
                              ) : (
                                <div className={styles.avatarPlaceholder}>{u.name.charAt(0)}</div>
                              )}
                            </div>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.designation || "Editor"}</td>
                        <td><span className={styles.roleBadge}>{u.role}</span></td>
                        <td>
                          <button
                            onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                            className={`${styles.statusToggle} ${u.isActive ? styles.active : styles.inactive}`}
                          >
                            {u.isActive ? "Active" : "Disabled"}
                          </button>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className={styles.deleteUserBtn}
                            disabled={u.role === 'SUPER_ADMIN'}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {section === 'facebook_settings' && (
          <div className={styles.facebookSection}>
            <div className={styles.headerCard} style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>📱</span>
                <div>
                  <h2 className={styles.pageTitle}>Facebook Auto-Post Settings</h2>
                  <p className={styles.subtitle}>Connect your page to automatically share news</p>
                </div>
              </div>
            </div>

            <div className={styles.userListCard}>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                {fbStatus?.connected ? (
                  <div className={styles.connectedState}>
                    <div style={{ fontSize: '3rem', color: '#1877F2', marginBottom: '1rem' }}>
                      <FaFacebook />
                    </div>
                    <h3 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>✓ System Connected</h3>
                    <p style={{ marginBottom: '1.5rem' }}>
                      Posting to: <strong>{fbStatus.facebook.pageName}</strong>
                    </p>
                    <button
                      onClick={handleFacebookTestPost}
                      disabled={fbLoading}
                      className={styles.primaryBtn}
                      style={{ backgroundColor: '#059669', border: 'none', marginBottom: '1rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto 1.5rem' }}
                    >
                      {fbLoading ? 'Processing...' : '🚀 Test Post to Facebook'}
                    </button>
                    <button
                      onClick={handleDisconnectFacebook}
                      className={styles.secondaryBtn}
                      style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      🔌 Disconnect Facebook
                    </button>
                  </div>
                ) : fbPages.length > 0 ? (
                  <div className={styles.pageSelection}>
                    <h3>Select Facebook Page</h3>
                    <p style={{ marginBottom: '1.5rem', color: '#666' }}>Choose the page where news should be posted</p>
                    <div className={styles.grid} style={{ maxWidth: '600px', margin: '0 auto' }}>
                      {fbPages.map(page => (
                        <div key={page.id} className={styles.card} style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => handleSaveFacebookPage(page.id, page.name, page.access_token)}>
                          <h4 style={{ marginBottom: '0.5rem' }}>{page.name}</h4>
                          <span style={{ fontSize: '0.8rem', color: '#888' }}>ID: {page.id}</span>
                          <div style={{ marginTop: '1rem' }}>
                            <button className={styles.primaryBtn} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>Select this Page</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.setupState}>
                    <div style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                      <FaFacebook />
                    </div>
                    <h3 style={{ marginBottom: '1rem' }}>Not Connected</h3>
                    <p style={{ marginBottom: '2rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 2rem' }}>
                      Authorize your Facebook account to enable automatic news sharing to your pages.
                    </p>
                    <button
                      onClick={handleFacebookConnect}
                      className={styles.primaryBtn}
                      disabled={fbLoading}
                      style={{ backgroundColor: '#1877F2', border: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 auto' }}
                    >
                      <FaFacebook /> {fbLoading ? 'Connecting...' : 'Connect Facebook Page'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.analyticsCard} style={{ marginTop: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>How it works?</h4>
              <ul style={{ textAlign: 'left', listStyleType: 'none', padding: 0, color: '#64748b' }}>
                <li style={{ marginBottom: '0.5rem' }}>✅ Once connected, every "Published" news will be shared automatically.</li>
                <li style={{ marginBottom: '0.5rem' }}>✅ No manual copy-pasting required.</li>
                <li style={{ marginBottom: '0.5rem' }}>✅ You can disconnect anytime from this settings panel.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainSection;
