'use client';

import React, { useState, useEffect } from 'react';
import VisualStoryForm from './VisualStoryForm';
import styles from './VisualStoryManagement.module.scss';
import { toast } from 'react-toastify';

interface VisualStory {
    _id: string;
    title: string;
    slug: string;
    thumbnail: string;
    category: string;
    isActive: boolean;
    viewCount: number;
    slides: any[];
}

export default function VisualStoryManagement() {
    const [stories, setStories] = useState<VisualStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStory, setEditingStory] = useState<VisualStory | null>(null);

    const fetchStories = async () => {
        setLoading(true);
        try {
            const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086';
            const res = await fetch(`${base}/api/visual-stories?includeInactive=true`);
            const data = await res.json();
            if (data.success) {
                setStories(data.data);
            }
        } catch (error) {
            console.error('Error fetching stories:', error);
            toast.error('Failed to load visual stories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this story?')) return;
        try {
            const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086';
            const res = await fetch(`${base}/api/visual-stories/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Story deleted');
                fetchStories();
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleEdit = (story: VisualStory) => {
        setEditingStory(story);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingStory(null);
        setIsFormOpen(true);
    };

    const closeForm = (refresh = false) => {
        setIsFormOpen(false);
        setEditingStory(null);
        if (refresh) fetchStories();
    };

    if (isFormOpen) {
        return <VisualStoryForm story={editingStory} onClose={closeForm} />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Manage Visual Stories</h2>
                <button onClick={handleCreate} className={styles.addBtn}>
                    + Add New Story
                </button>
            </div>

            {loading ? (
                <div className={styles.loader}>Loading...</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Thumbnail</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Views</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stories.map(story => (
                                <tr key={story._id}>
                                    <td>
                                        <img src={story.thumbnail} alt="" className={styles.thumbMini} />
                                    </td>
                                    <td>{story.title}</td>
                                    <td>{story.category}</td>
                                    <td>{story.viewCount}</td>
                                    <td>
                                        <span className={story.isActive ? styles.active : styles.inactive}>
                                            {story.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button onClick={() => handleEdit(story)} className={styles.editBtn}>Edit</button>
                                            <button onClick={() => handleDelete(story._id)} className={styles.deleteBtn}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {stories.length === 0 && <p className={styles.noData}>No visual stories found.</p>}
                </div>
            )}
        </div>
    );
}
