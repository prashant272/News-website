"use client";
import React, { useState, useCallback, ChangeEvent, FC } from "react";
import Image from "next/image";
import { baseURL } from "@/Utils/Utils";
import { Ad, useAllAds, useAddAd } from "@/app/hooks/useAds";
import styles from "../Main.module.scss";

interface AdManagerProps {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    showNotification: (message: string, type: "success" | "error") => void;
}

const AdManager: FC<AdManagerProps> = ({
    canCreate,
    canUpdate,
    canDelete,
    showNotification
}) => {
    const { data: adsData, loading: adsLoading, refetch: refetchAds } = useAllAds();
    const { mutate: addAd, loading: addAdLoading } = useAddAd();

    const [editingAdId, setEditingAdId] = useState<string | null>(null);
    const [adFormState, setAdFormState] = useState<Partial<Ad>>({
        title: "",
        link: "",
        headerImageUrl: "",
        sidebarImageUrl: "",
        imageUrl: "",
        isActive: true,
    });

    const [adHeaderPreview, setAdHeaderPreview] = useState<string | null>(null);
    const [adSidebarPreview, setAdSidebarPreview] = useState<string | null>(null);

    const resetAdForm = useCallback(() => {
        setAdFormState({
            title: "",
            link: "",
            headerImageUrl: "",
            sidebarImageUrl: "",
            imageUrl: "",
            isActive: true,
        });
        setAdHeaderPreview(null);
        setAdSidebarPreview(null);
        setEditingAdId(null);
    }, []);

    const handleAdChange = useCallback(
        (field: keyof Ad) =>
            (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                const value = field === "isActive" ? e.target.value === "true" : e.target.value;
                setAdFormState((prev) => ({ ...prev, [field]: value }));
            },
        []
    );

    const handleAdImageChange = useCallback(
        (type: 'header' | 'sidebar') => (e: ChangeEvent<HTMLInputElement>) => {
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
                if (type === 'header') {
                    setAdFormState((prev) => ({ ...prev, headerImageUrl: dataUrl }));
                    setAdHeaderPreview(dataUrl);
                } else {
                    setAdFormState((prev) => ({ ...prev, sidebarImageUrl: dataUrl }));
                    setAdSidebarPreview(dataUrl);
                }
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
        if (!adFormState.title || !adFormState.link || (!adFormState.headerImageUrl && !adFormState.sidebarImageUrl)) {
            showNotification("Title, Link, and at least one image (Header or Sidebar) are required", "error");
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
            setAdHeaderPreview(ad.headerImageUrl || ad.imageUrl || null);
            setAdSidebarPreview(ad.sidebarImageUrl || (ad.placement === 'sidebar' ? ad.imageUrl : null));
            window.scrollTo({ top: 120, behavior: "smooth" });
        },
        [canUpdate, showNotification]
    );

    return (
        <div className={styles.adsTabContent}>
            {(canCreate || canUpdate) && (
                <div className={styles.editor}>
                    <div className={styles.editorHeader}>
                        <h2 className={styles.editorTitle}>
                            {editingAdId ? (
                                <>
                                    <span className={styles.editorIcon}>✏️</span> Edit Advertisement
                                </>
                            ) : (
                                <>
                                    <span className={styles.editorIcon}>📢</span> Create Advertisement
                                </>
                            )}
                        </h2>
                        {editingAdId && (
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

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Header / In-Article Image</label>
                            <input
                                id="ad-header-upload"
                                type="file"
                                accept="image/*"
                                className={styles.hidden}
                                onChange={handleAdImageChange('header')}
                            />
                            <div
                                className={styles.imageUploadArea}
                                onClick={() => document.getElementById("ad-header-upload")?.click()}
                            >
                                {adHeaderPreview || adFormState.headerImageUrl ? (
                                    <div className={styles.previewContainer}>
                                        <img
                                            src={adHeaderPreview || adFormState.headerImageUrl || ""}
                                            alt="Preview"
                                            className={styles.imagePreview}
                                        />
                                        <button
                                            type="button"
                                            className={styles.removeImageBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAdFormState((prev) => ({ ...prev, headerImageUrl: "" }));
                                                setAdHeaderPreview(null);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.uploadPlaceholder}>
                                        <span className={styles.uploadIcon}>📸</span>
                                        <p>Upload Header Ad</p>
                                        <small>1200x200 recommended</small>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Sidebar Image</label>
                            <input
                                id="ad-sidebar-upload"
                                type="file"
                                accept="image/*"
                                className={styles.hidden}
                                onChange={handleAdImageChange('sidebar')}
                            />
                            <div
                                className={styles.imageUploadArea}
                                onClick={() => document.getElementById("ad-sidebar-upload")?.click()}
                            >
                                {adSidebarPreview || adFormState.sidebarImageUrl ? (
                                    <div className={styles.previewContainer}>
                                        <img
                                            src={adSidebarPreview || adFormState.sidebarImageUrl || ""}
                                            alt="Preview"
                                            className={styles.imagePreview}
                                        />
                                        <button
                                            type="button"
                                            className={styles.removeImageBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAdFormState((prev) => ({ ...prev, sidebarImageUrl: "" }));
                                                setAdSidebarPreview(null);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.uploadPlaceholder}>
                                        <span className={styles.uploadIcon}>📸</span>
                                        <p>Upload Sidebar Ad</p>
                                        <small>300x600 recommended</small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.formActions}>
                        {editingAdId ? (
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
                    <h2 className={styles.sectionTitle}>Advertisements ({adsData?.length || 0})</h2>
                </div>
                {adsLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Loading ads...</p>
                    </div>
                ) : !adsData || adsData.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📢</div>
                        <h3>No advertisements found</h3>
                        <p>Create your first advertisement to get started</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {adsData.map((ad) => (
                            <article key={ad._id} className={styles.card}>
                                <div className={styles.cardImage}>
                                    {ad.headerImageUrl || ad.imageUrl ? (
                                        <img src={ad.headerImageUrl || ad.imageUrl} alt={ad.title} loading="lazy" />
                                    ) : ad.sidebarImageUrl ? (
                                        <img src={ad.sidebarImageUrl} alt={ad.title} loading="lazy" />
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
                                    <span className={styles.placementBadge}>
                                        {ad.headerImageUrl ? 'Header' : ad.sidebarImageUrl ? 'Sidebar' : (ad.placement || 'header')}
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
    );
};

export default AdManager;
