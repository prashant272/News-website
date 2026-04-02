"use client";
import React, { useState, useEffect, useCallback, ChangeEvent, FC, useMemo } from "react";
import { FaFacebook, FaWhatsapp, FaShareAlt, FaClock } from "react-icons/fa";
import {
    NewsItem,
    useNewsBySection,
    useAddNews,
    useUpdateNews,
    useDeleteNews,
    useSetNewsFlags
} from "@/app/hooks/NewsApi";
import { compressImage } from "@/Utils/Utils";
import { useNewsContext } from "@/app/context/NewsContext";
import styles from "../Main.module.scss";

const CATEGORIES = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'india', label: 'India', icon: '🇮🇳' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'business', label: 'Business', icon: '📈' },
    { id: 'technology', label: 'Tech', icon: '💻' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '✨' },
    { id: 'world', label: 'World', icon: '🌍' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'awards', label: 'Awards', icon: '🏆' },
    { id: 'regional', label: 'Regional', icon: '📍' },
] as const;

const STATES = [
  
  { id: 'universal', label: 'Universal / National' },

  // States
  { id: 'andhra-pradesh', label: 'Andhra Pradesh' },
  { id: 'arunachal-pradesh', label: 'Arunachal Pradesh' },
  { id: 'assam', label: 'Assam' },
  { id: 'bihar', label: 'Bihar' },
  { id: 'gujarat', label: 'Gujarat' },
  { id: 'haryana', label: 'Haryana' },
  { id: 'himachal-pradesh', label: 'Himachal Pradesh' },
  { id: 'jharkhand', label: 'Jharkhand' },
  { id: 'madhya-pradesh', label: 'Madhya Pradesh' },
  { id: 'sikkim', label: 'Sikkim' },
  { id: 'uttar-pradesh', label: 'Uttar Pradesh' },
  { id: 'uttarakhand', label: 'Uttarakhand' },
  { id: 'west-bengal', label: 'West Bengal' },
  { id: 'others', label: 'Others' }

] as const;

type NewsCategory = typeof CATEGORIES[number]['id'];

interface NewsManagerProps {
    section: 'news_management' | 'previous_news';
    initialDraft?: NewsItem | null;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    userAuthData: any;
    showNotification: (message: string, type: "success" | "error") => void;
}

const NewsManager: FC<NewsManagerProps> = ({
    section,
    initialDraft,
    canCreate,
    canUpdate,
    canDelete,
    userAuthData,
    showNotification
}) => {
    const { openAwardPopup } = useNewsContext();
    const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('india');
    const [page, setPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published" | "archived" | "scheduled">("all");
    const [langFilter, setLangFilter] = useState<"all" | "en" | "hi">("all");
    const limit = 20;

    // Only fetch news list if we are in 'previous_news' section or editing
    const shouldFetchList = section === 'previous_news';
    const { data: newsData, loading: fetchLoading, error: fetchError, refetch } = useNewsBySection(
        selectedCategory,
        true,
        page,
        shouldFetchList ? limit : 1,
        filterStatus === 'all' ? undefined : filterStatus,
        langFilter === 'all' ? undefined : langFilter
    );

    const { mutate: addNews, loading: addLoading } = useAddNews();
    const { mutate: updateNews } = useUpdateNews(selectedCategory);
    const { mutate: deleteNews } = useDeleteNews(selectedCategory);
    const { mutate: setFlags, loading: flagsLoading } = useSetNewsFlags(selectedCategory);

    const [editingSlug, setEditingSlug] = useState<string | null>(null);
    const [formState, setFormState] = useState<Partial<NewsItem>>({
        title: "",
        slug: "",
        category: "India",
        content: "",
        tags: [],
        status: "draft",
        scheduledAt: "",
        targetLink: "",
        nominationLink: "",
        moreInfoLink: "",
        language: "en",
        state: "universal",
    });

    const [tagsInput, setTagsInput] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showImage, setShowImage] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Schedule time picker state (declared after formState)
    const [schedDate, setSchedDate] = useState("");
    const [schedHour, setSchedHour] = useState("12");
    const [schedMin, setSchedMin] = useState("00");
    const [schedAmPm, setSchedAmPm] = useState<"AM"|"PM">("AM");
    const [timeFormat, setTimeFormat] = useState<"12h"|"24h">("12h");

    const buildScheduledISO = useCallback((date: string, hour: string, min: string, ampm: "AM"|"PM", fmt: "12h"|"24h") => {
        if (!date) return "";
        let h = parseInt(hour, 10);
        if (fmt === "12h") {
            if (ampm === "AM" && h === 12) h = 0;
            if (ampm === "PM" && h !== 12) h = h + 12;
        }
        const localString = `${date}T${String(h).padStart(2, "0")}:${min}:00`;
        return new Date(localString).toISOString();
    }, []);

    // Sync schedule inputs → formState.scheduledAt
    useEffect(() => {
        if (formState.status === "scheduled" && schedDate) {
            const iso = buildScheduledISO(schedDate, schedHour, schedMin, schedAmPm, timeFormat);
            setFormState(prev => ({ ...prev, scheduledAt: iso }));
        }
    }, [schedDate, schedHour, schedMin, schedAmPm, timeFormat, formState.status, buildScheduledISO]);
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

    const resetForm = useCallback(() => {
        setFormState({
            title: "",
            slug: "",
            category: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1),
            content: "",
            tags: [],
            status: "draft",
            scheduledAt: "",
            targetLink: "",
            nominationLink: "",
            moreInfoLink: "",
            language: "en",
            state: "universal",
        });
        setImagePreview(null);
        setShowImage(false);
        setEditingSlug(null);
        setTagsInput("");
    }, [selectedCategory]);

    useEffect(() => {
        if (initialDraft) {
            const rawCategory = initialDraft.category?.toLowerCase() || 'india';
            const matchedCat = CATEGORIES.find(c => c.id === rawCategory)?.id || 'india';
            setSelectedCategory(matchedCat as NewsCategory);
            setFormState({
                ...initialDraft,
                status: initialDraft.status || 'draft',
                category: matchedCat.charAt(0).toUpperCase() + matchedCat.slice(1),
                scheduledAt: initialDraft.scheduledAt ? new Date(initialDraft.scheduledAt).toISOString().slice(0, 16) : "",
                targetLink: initialDraft.targetLink || "",
                nominationLink: initialDraft.nominationLink || "",
                moreInfoLink: initialDraft.moreInfoLink || "",
            });
            setEditingSlug(initialDraft.slug);
            setTagsInput(initialDraft.tags?.join(", ") || "");
            setImagePreview(initialDraft.image || null);
            setShowImage(!!initialDraft.image);
            window.scrollTo({ top: 120, behavior: "smooth" });
        }
    }, [initialDraft]);

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
            if (file.size > 10 * 1024 * 1024) { // Increased limit as we compress
                showNotification("Image too large (max 10MB)", "error");
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                const dataUrl = event.target?.result as string;

                // Compress image before setting to state
                const optimizedDataUrl = await compressImage(dataUrl, 1200, 0.6) as string;

                setFormState((prev) => ({ ...prev, image: optimizedDataUrl }));
                setImagePreview(optimizedDataUrl);
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
        if (formState.status === "scheduled" && !formState.scheduledAt) {
            showNotification("Please set a scheduled date and time", "error");
            return;
        }
        try {
            const authorName = userAuthData?.name || "Prime Time News";
            const currentUserId = userAuthData?.userId || userAuthData?._id || userAuthData?.id;

            // Convert datetime-local (local time) to UTC ISO string
            const scheduledAtISO = formState.scheduledAt
                ? new Date(formState.scheduledAt).toISOString()
                : undefined;

            await addNews({
                ...formState,
                scheduledAt: scheduledAtISO,
                section: selectedCategory,
                author: authorName,
                authorId: currentUserId || null,
                tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
                // Only set publishedAt for non-scheduled posts
                ...(formState.status !== "scheduled" && { publishedAt: new Date().toISOString() }),
            } as NewsItem & { section: string });
            showNotification(`Article created by ${authorName}`, "success");
            resetForm();
            refetch();
        } catch (err: any) {
            showNotification(err.message || "Failed to create article", "error");
        }
    }, [canCreate, formState, addNews, selectedCategory, resetForm, refetch, showNotification, userAuthData, tagsInput]);

    const startEdit = useCallback(
        (item: NewsItem) => {
            if (!canUpdate) {
                showNotification("No permission to edit articles", "error");
                return;
            }
            setEditingSlug(item.slug);
            
            // Format scheduledAt for datetime-local input (YYYY-MM-DDThh:mm)
            let formattedDate = "";
            if (item.scheduledAt) {
                const d = new Date(item.scheduledAt);
                if (!isNaN(d.getTime())) {
                    formattedDate = d.toISOString().slice(0, 16);
                }
            }

            setFormState({ 
                ...item,
                scheduledAt: formattedDate
            });
            setTagsInput(item.tags?.join(", ") || "");
            setImagePreview(item.image || null);
            setShowImage(!!item.image);
            window.scrollTo({ top: 120, behavior: "smooth" });
        },
        [canUpdate, showNotification]
    );


    const handleUpdate = useCallback(async () => {
        if (!canUpdate || !editingSlug) return;
        if (formState.status === "scheduled" && !formState.scheduledAt) {
            showNotification("Please set a scheduled date and time", "error");
            return;
        }
        try {
            const authorName = userAuthData?.name || "Prime Time News";
            const currentUserId = userAuthData?.userId || userAuthData?._id || userAuthData?.id;

            // Convert datetime-local (local time) to UTC ISO string
            const scheduledAtISO = formState.scheduledAt
                ? new Date(formState.scheduledAt).toISOString()
                : null;

            await updateNews({
                slug: editingSlug,
                news: {
                    ...formState,
                    scheduledAt: scheduledAtISO,
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
    }, [canUpdate, editingSlug, formState, updateNews, resetForm, refetch, showNotification, userAuthData, tagsInput]);

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
        async (slug: string, field: "isLatest" | "isTrending" | "isHidden" | "showInPopup" | "isFiftyWordEdit", newValue: boolean) => {
            if (flagsLoading) return;
            try {
                await setFlags({ slug, [field]: newValue });
                showNotification(
                    `Article ${newValue ? "marked as" : "removed from"} ${
                        field === "isLatest" ? "Latest" : 
                        field === "isTrending" ? "Trending" : 
                        field === "isFiftyWordEdit" ? "50W Edit" : 
                        field === "isHidden" ? "Hidden" : "Popup Rotation"
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

    const filteredAndSortedItems = useMemo<NewsItem[]>(() => {
        let result = [...(newsData ?? [])];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (item) =>
                    item.title.toLowerCase().includes(q) ||
                    item.content.toLowerCase().includes(q) ||
                    item.tags.some((t) => t.toLowerCase().includes(q))
            );
        }

        // Status filtering moved to backend hook above


        if (sortBy === "newest") {
            result.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
        } else if (sortBy === "oldest") {
            result.sort((a, b) => new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime());
        } else if (sortBy === "title") {
            result.sort((a, b) => a.title.localeCompare(b.title));
        }

        return result;
    }, [newsData, searchQuery, filterStatus, sortBy]);

    const getShareLink = (item: Partial<NewsItem>, platform: 'facebook' | 'whatsapp') => {
        if (!item.slug) return "#";
        const siteUrl = "https://www.primetimemedia.in";
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

    const isEditing = editingSlug !== null;

    return (
        <div className={styles.newsManagerWrapper}>
            {section === 'previous_news' && (
                <div className={styles.categoryFilterContainer}>
                    <label className={styles.label}>Select Category to View News:</label>
                    <div className={styles.categoryPills}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`${styles.categoryPill} ${selectedCategory === cat.id ? styles.activePill : ''}`}
                                onClick={() => {
                                    setSelectedCategory(cat.id);
                                    setPage(1); // Reset page on category change
                                }}
                            >
                                <span className={styles.pillIcon}>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {(section === 'news_management' || isEditing) && (
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
                            <button onClick={resetForm} className={styles.closeBtn}>✕</button>
                        )}
                    </div>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Title <span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formState.title ?? ""}
                                onChange={handleChange("title")}
                                placeholder="Enter title..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Slug <span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formState.slug ?? ""}
                                onChange={handleChange("slug")}
                                placeholder="article-slug"
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
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Language <span className={styles.required}>*</span></label>
                            <select
                                className={styles.select}
                                value={formState.language ?? "en"}
                                onChange={handleChange("language")}
                            >
                                <option value="en">🇺🇸 English</option>
                                <option value="hi">🇮🇳 Hindi</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>State / Region</label>
                            <select
                                className={styles.select}
                                value={formState.state ?? "universal"}
                                onChange={handleChange("state")}
                            >
                                {STATES.map(s => (
                                    <option key={s.id} value={s.id}>{s.label}</option>
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
                            <label className={styles.label}>Target Link (Redirect)</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formState.targetLink ?? ""}
                                onChange={handleChange("targetLink")}
                                placeholder="https://..."
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
                                <option value="scheduled">Scheduled</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        {formState.status === "scheduled" && (
                            <div className={styles.formGroup} style={{ background: 'rgba(10,102,194,0.08)', border: '1px solid rgba(10,102,194,0.3)', borderRadius: '10px', padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <label className={styles.label} style={{ marginBottom: 0, color: '#7dd3fc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <FaClock />
                                        Schedule Date & Time <span className={styles.required}>*</span>
                                    </label>
                                    {/* Format Toggle */}
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        {(["12h", "24h"] as const).map(fmt => (
                                            <button
                                                key={fmt} type="button"
                                                onClick={() => {
                                                    if (fmt === "12h" && timeFormat === "24h") {
                                                        const h24 = parseInt(schedHour, 10);
                                                        setSchedAmPm(h24 >= 12 ? "PM" : "AM");
                                                        setSchedHour(String(h24 % 12 || 12));
                                                    } else if (fmt === "24h" && timeFormat === "12h") {
                                                        let h = parseInt(schedHour, 10);
                                                        if (schedAmPm === "AM" && h === 12) h = 0;
                                                        if (schedAmPm === "PM" && h !== 12) h += 12;
                                                        setSchedHour(String(h).padStart(2, "0"));
                                                    }
                                                    setTimeFormat(fmt);
                                                }}
                                                style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #0A66C2', background: timeFormat === fmt ? '#0A66C2' : 'transparent', color: '#fff', fontSize: '0.8rem', cursor: 'pointer', fontWeight: timeFormat === fmt ? 700 : 400 }}
                                            >{fmt === "12h" ? "AM/PM" : "24h"}</button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {/* Date */}
                                    <input
                                        type="date"
                                        className={styles.input}
                                        style={{ flex: '2', minWidth: '145px', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', colorScheme: 'dark' }}
                                        value={schedDate}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={e => setSchedDate(e.target.value)}
                                    />
                                    {/* Hour */}
                                    <input
                                        type="number"
                                        className={styles.input}
                                        style={{ flex: '0 0 60px', textAlign: 'center', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', padding: '0.5rem 0.25rem' }}
                                        value={schedHour}
                                        min={timeFormat === "12h" ? 1 : 0}
                                        max={timeFormat === "12h" ? 12 : 23}
                                        onChange={e => setSchedHour(e.target.value)}
                                        placeholder={timeFormat === "12h" ? "12" : "HH"}
                                    />
                                    <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#94a3b8' }}>:</span>
                                    {/* Minute */}
                                    <select
                                        style={{ flex: '0 0 80px', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '6px', padding: '0.5rem 0.4rem', fontSize: '0.95rem', cursor: 'pointer' }}
                                        value={schedMin}
                                        onChange={e => setSchedMin(e.target.value)}
                                    >
                                        {["00","05","10","15","20","25","30","35","40","45","50","55"].map(m => (
                                            <option key={m} value={m} style={{ background: '#1e293b', color: '#e2e8f0' }}>{m}</option>
                                        ))}
                                    </select>
                                    {/* AM/PM toggle (only in 12h mode) */}
                                    {timeFormat === "12h" && (
                                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                                            {(["AM", "PM"] as const).map(p => (
                                                <button
                                                    key={p} type="button"
                                                    onClick={() => setSchedAmPm(p)}
                                                    style={{ padding: '0.45rem 0.8rem', borderRadius: '6px', border: '1px solid #334155', background: schedAmPm === p ? '#0A66C2' : '#1e293b', color: '#e2e8f0', fontWeight: schedAmPm === p ? 700 : 400, cursor: 'pointer', fontSize: '0.9rem' }}
                                                >{p}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Preview */}
                                {schedDate && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(10,102,194,0.15)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FaClock style={{ color: '#7dd3fc', flexShrink: 0 }} />
                                        <small style={{ color: '#7dd3fc', fontWeight: 600 }}>
                                            Will publish at: {new Date(buildScheduledISO(schedDate, schedHour, schedMin, schedAmPm, timeFormat)).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', hour12: timeFormat === '12h' })}
                                        </small>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nomination Link (Awards only)</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formState.nominationLink ?? ""}
                                onChange={handleChange("nominationLink")}
                                placeholder="https://..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>More Info Link (Awards only)</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formState.moreInfoLink ?? ""}
                                onChange={handleChange("moreInfoLink")}
                                placeholder="https://..."
                            />
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
                            <label className={styles.label}>Content <span className={styles.required}>*</span></label>
                            <textarea
                                className={styles.textarea}
                                value={formState.content ?? ""}
                                onChange={handleChange("content")}
                                rows={12}
                                placeholder="Write article content here..."
                            />
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
                        </div>
                    </div>
                    <div className={styles.formActions}>
                        {isEditing ? (
                            <>
                                <button onClick={handleUpdate} className={styles.primaryBtn}>Update Article</button>
                                <button onClick={resetForm} className={styles.secondaryBtn}>Cancel</button>
                            </>
                        ) : (
                            <button
                                onClick={handleAdd}
                                className={styles.primaryBtn}
                                disabled={!canCreate || addLoading}
                            >
                                {addLoading ? "Creating..." : "Create Article"}
                            </button>
                        )}
                    </div>

                    {formState.slug && (
                        <div className={styles.shareSection}>
                            <div className={styles.shareLabel}><FaShareAlt /> Share this article</div>
                            <div className={styles.shareButtons}>
                                <a
                                    href={getShareLink(formState, 'facebook')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${styles.shareBtn} ${styles.facebook}`}
                                ><FaFacebook /> Facebook</a>
                                <a
                                    href={getShareLink(formState, 'whatsapp')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${styles.shareBtn} ${styles.whatsapp}`}
                                ><FaWhatsapp /> WhatsApp</a>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {section === 'previous_news' && (
                <div className={styles.articlesSection}>
                    <div className={styles.articlesSectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            Previous News: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} ({newsData?.length || 0})
                        </h2>
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
                                <select className={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
                                    <option value="all">All Status</option>
                                    <option value="published">Published</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="draft">Draft</option>
                                </select>
                                <select className={styles.filterSelect} value={langFilter} onChange={(e) => setLangFilter(e.target.value as any)}>
                                    <option value="all">🌐 All Languages</option>
                                    <option value="en">🇺🇸 English</option>
                                    <option value="hi">🇮🇳 Hindi</option>
                                </select>
                                <select className={styles.filterSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {fetchLoading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner} />
                            <p>Loading news...</p>
                        </div>
                    ) : filteredAndSortedItems.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📄</div>
                            <h3>No news found</h3>
                        </div>
                    ) : (
                        <>
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
                                                {item.status === 'scheduled' && item.scheduledAt && (
                                                    <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '4px', fontWeight: 'normal' }}>
                                                        : {new Date(item.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <div className={styles.cardContent}>
                                            <h3 className={styles.cardTitle}>{item.title}</h3>
                                            <div className={styles.cardFooter}>
                                                <div className={styles.cardActions}>
                                                    <button
                                                        onClick={() => handleToggleFlag(item.slug, "isHidden", !item.isHidden)}
                                                        className={styles.visibilityBtn}
                                                        disabled={!canUpdate || flagsLoading}
                                                        title={item.isHidden ? "Unhide" : "Hide"}
                                                    >
                                                        {item.isHidden ? "👁️" : "🙈"}
                                                    </button>
                                                    <button onClick={() => startEdit(item)} className={styles.editBtn} disabled={!canUpdate} title="Edit">✏️</button>
                                                    <button onClick={() => handleDelete(item.slug)} className={styles.deleteBtn} disabled={!canDelete} title="Delete">🗑️</button>
                                                    {(item.category?.toLowerCase().includes('award')) && (
                                                        <button 
                                                            onClick={() => openAwardPopup(item)} 
                                                            style={{
                                                                background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                padding: '4px 8px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '800',
                                                                cursor: 'pointer',
                                                                marginLeft: '8px',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                            }}
                                                            title="View Award Popup"
                                                        >
                                                            🏆 Popup
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                                                <button
                                                    onClick={() => handleToggleFlag(item.slug, "isLatest", !item.isLatest)}
                                                    className={`${styles.flagBtn} ${item.isLatest ? styles.flagActive : ""}`}
                                                    disabled={!canUpdate || flagsLoading}
                                                >⭐ {item.isLatest ? "Latest" : "Mark Latest"}</button>
                                                <button
                                                    onClick={() => handleToggleFlag(item.slug, "isTrending", !item.isTrending)}
                                                    className={`${styles.flagBtn} ${item.isTrending ? styles.flagActive : ""}`}
                                                    disabled={!canUpdate || flagsLoading}
                                                >🔥 {item.isTrending ? "Trending" : "Mark Trending"}</button>
                                                <button
                                                    onClick={() => handleToggleFlag(item.slug, "isFiftyWordEdit", !item.isFiftyWordEdit)}
                                                    className={`${styles.flagBtn} ${item.isFiftyWordEdit ? styles.flagActive : ""}`}
                                                    disabled={!canUpdate || flagsLoading}
                                                    title={item.isFiftyWordEdit ? "Remove from 50W Edit" : "Add to 50W Edit"}
                                                >📝 {item.isFiftyWordEdit ? "Remove 50W" : "Mark 50W"}</button>
                                                 {(item.category?.toLowerCase().includes('award')) && (
                                                     <button
                                                         onClick={(e) => {
                                                             e.stopPropagation();
                                                             handleToggleFlag(item.slug, "showInPopup", !item.showInPopup);
                                                         }}
                                                         className={`${styles.flagBtn} ${item.showInPopup ? styles.flagActive : ""}`}
                                                         disabled={!canUpdate || flagsLoading}
                                                         style={{
                                                             marginLeft: '0.5rem',
                                                             background: item.showInPopup ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)' : '',
                                                             color: item.showInPopup ? 'white' : '',
                                                             borderColor: item.showInPopup ? '#b8860b' : '',
                                                             fontWeight: item.showInPopup ? 'bold' : 'normal',
                                                             padding: '2px 8px',
                                                             borderRadius: '4px',
                                                             fontSize: '0.75rem'
                                                         }}
                                                         title={item.showInPopup ? "Remove from Popup Rotation" : "Add to Popup Rotation"}
                                                     >
                                                         🏆 {item.showInPopup ? "In Popup" : "Add to Popup"}
                                                     </button>
                                                 )}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Simple Pagination Controls */}
                            <div className={styles.pagination} style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || fetchLoading}
                                    className={styles.secondaryBtn}
                                    style={{ width: 'auto' }}
                                >Previous</button>
                                <span>Page {page}</span>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={filteredAndSortedItems.length < limit || fetchLoading}
                                    className={styles.secondaryBtn}
                                    style={{ width: 'auto' }}
                                >Next</button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default NewsManager;
