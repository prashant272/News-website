'use client';

import React, { useState, useEffect } from 'react';
import styles from './VisualStoryManagement.module.scss';
import { toast } from 'react-toastify';

interface Slide {
    image: string;
    title: string;
    description: string;
    link: string;
    isUpload: boolean;
}

interface VisualStory {
    _id?: string;
    title: string;
    thumbnail: string;
    category: string;
    isActive: boolean;
    slides: Slide[];
}

export default function VisualStoryForm({
    story,
    onClose
}: {
    story: VisualStory | null;
    onClose: (refresh?: boolean) => void;
}) {
    const normalizeSlides = (slides: any[]) =>
        slides.map(s => ({
            image: s.image || '',
            title: s.title || '',
            description: s.description || '',
            link: s.link || '',
            isUpload: s.isUpload ?? false
        }));

    const [formData, setFormData] = useState<VisualStory>({
        title: story?.title || '',
        thumbnail: story?.thumbnail || '',
        category: story?.category || '',
        isActive: story?.isActive ?? true,
        slides: story?.slides
            ? normalizeSlides(story.slides)
            : [{ image: '', title: '', description: '', link: '', isUpload: false }]
    });
    const [loading, setLoading] = useState(false);

    const compressImage = (base64Str: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 720;
                const MAX_HEIGHT = 1080;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.6)); // 0.6 quality JPEG for extra speed
            };
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            // Compress before setting state
            const compressed = await compressImage(base64);
            
            if (index !== undefined) {
                const newSlides = [...formData.slides];
                newSlides[index].image = compressed;
                setFormData({ ...formData, slides: newSlides });
            } else {
                setFormData({ ...formData, thumbnail: compressed });
            }
        };
        reader.readAsDataURL(file);
    };

    const addSlide = () => {
        if (formData.slides.length >= 20) return;
        setFormData({
            ...formData,
            slides: [...formData.slides, { image: '', title: '', description: '', link: '', isUpload: false }]
        });
    };

    const removeSlide = (index: number) => {
        const newSlides = formData.slides.filter((_, i) => i !== index);
        setFormData({ ...formData, slides: newSlides });
    };

    const updateSlide = (index: number, field: keyof Slide, value: any) => {
        const newSlides = [...formData.slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setFormData({ ...formData, slides: newSlides });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (!formData.title.trim()) return toast.error('Title is required');
        if (!formData.category) return toast.error('Category is required');
        if (!formData.thumbnail) return toast.error('Main thumbnail is required');
        
        const invalidSlide = formData.slides.find(s => !s.image);
        if (invalidSlide) return toast.error('All slides must have an image');

        try {
            const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086';
            const url = story?._id ? `${base}/api/visual-stories/${story._id}` : `${base}/api/visual-stories`;
            const method = story?._id ? 'PUT' : 'POST';

            console.log("DEBUG SENDING STORY:", formData);
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(story?._id ? 'Story updated!' : 'Story created!');
                onClose(true);
            } else {
                toast.error(data.message || 'Submission failed');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.formHeader}>
                <h3>{story?._id ? 'Edit Visual Story' : 'Create New Visual Story'}</h3>
                <button onClick={() => onClose()} className={styles.backBtn}>Cancel</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.grid}>
                    <div className={styles.inputGroup}>
                        <label>Title</label>
                        <input
                            required
                            value={formData.title ?? ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter story title"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Category</label>
                        <select
                            required
                            value={formData.category ?? ''}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            <option value="news">News</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="sports">Sports</option>
                            <option value="lifestyle">Lifestyle</option>
                            <option value="technology">Technology</option>
                            <option value="travel">Travel</option>
                        </select>
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label>Main Thumbnail</label>
                    <div className={styles.mediaInput}>
                        <input
                            key="thumbnail-file"
                            type="file"
                            accept="image/*"
                            onChange={e => handleFileChange(e)}
                            className={styles.fileInput}
                        />
                        <span>OR</span>
                        <input
                            key="thumbnail-url"
                            value={formData.thumbnail ?? ''}
                            onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                            placeholder="Thumbnail URL"
                        />
                    </div>
                    {formData.thumbnail && <img src={formData.thumbnail} alt="" className={styles.preview} />}
                </div>

                <div className={styles.slidesSection}>
                    <div className={styles.slidesHeader}>
                        <h4>Slides ({formData.slides.length})</h4>
                        <button type="button" onClick={addSlide} className={styles.addSlideBtn}>+ Add Slide</button>
                    </div>

                    {formData.slides.map((slide, index) => (
                        <div key={index} className={styles.slideCard}>
                            <div className={styles.slideHeader}>
                                <span>Slide {index + 1}</span>
                                <button type="button" onClick={() => removeSlide(index)} className={styles.removeBtn}>Remove</button>
                            </div>

                            <div className={styles.slideBody}>
                                <div className={styles.slideMedia}>
                                    <div className={styles.toggleGroup}>
                                        <button
                                            type="button"
                                            className={!slide.isUpload ? styles.activeTab : ''}
                                            onClick={() => updateSlide(index, 'isUpload', false)}
                                        >URL</button>
                                        <button
                                            type="button"
                                            className={slide.isUpload ? styles.activeTab : ''}
                                            onClick={() => updateSlide(index, 'isUpload', true)}
                                        >Upload</button>
                                    </div>
                                    {slide.isUpload ? (
                                        <input
                                            key={`slide-file-${index}`}
                                            type="file"
                                            accept="image/*"
                                            onChange={e => handleFileChange(e, index)}
                                        />
                                    ) : (
                                        <input
                                            key={`slide-url-${index}`}
                                            value={slide.image || ''}
                                            onChange={e => updateSlide(index, 'image', e.target.value)}
                                            placeholder="Image URL (e.g. Unsplash/Instagram)"
                                        />
                                    )}
                                    {slide.image && <img src={slide.image} alt="" className={styles.slidePreview} />}
                                </div>

                                <div className={styles.slideText}>
                                    <input
                                        value={slide.title ?? ''}
                                        onChange={e => updateSlide(index, 'title', e.target.value)}
                                        placeholder="Slide Title (optional)"
                                    />
                                    <textarea
                                        value={slide.description ?? ''}
                                        onChange={e => updateSlide(index, 'description', e.target.value)}
                                        placeholder="Story text for this slide..."
                                        rows={3}
                                    />
                                    <input
                                        value={slide.link ?? ''}
                                        onChange={e => updateSlide(index, 'link', e.target.value)}
                                        placeholder="Read More Link (optional)"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.formFooter}>
                    <button type="submit" className={styles.saveBtn} disabled={loading}>
                        {loading ? 'Saving...' : story?._id ? 'Update Story' : 'Create Story'}
                    </button>
                </div>
            </form>
        </div>
    );
}
