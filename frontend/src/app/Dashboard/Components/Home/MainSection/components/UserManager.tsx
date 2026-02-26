"use client";
import React, { useState, useEffect, useCallback, FC } from "react";
import { API } from "@/Utils/Utils";
import styles from "../Main.module.scss";

interface UserManagerProps {
    isSuperAdmin: boolean;
    showNotification: (message: string, type: "success" | "error") => void;
}

const UserManager: FC<UserManagerProps> = ({ isSuperAdmin, showNotification }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'ADMIN', designation: '', ProfilePicture: '' });
    const [userProfilePreview, setUserProfilePreview] = useState<string | null>(null);

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

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

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

    if (!isSuperAdmin) return null;

    return (
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
                {usersLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Loading users...</p>
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    );
};

export default UserManager;
