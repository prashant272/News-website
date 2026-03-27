"use client";
import React, { useState, useEffect, useCallback, FC } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaTwitter } from "react-icons/fa";
import { API } from "@/Utils/Utils";
import styles from "../Main.module.scss";

interface TwitterManagerProps {
    showNotification: (message: string, type: "success" | "error") => void;
}

const TwitterManager: FC<TwitterManagerProps> = ({ showNotification }) => {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Fields for manual/system credential entry (Twitter often requires App Key/Secret)
    const [credentials, setCredentials] = useState({
        appKey: '',
        appSecret: '',
        accessToken: '',
        accessSecret: '',
    });

    const fetchStatus = useCallback(async () => {
        try {
            const res = await API.get('/twitter/global-status');
            setStatus(res.data);
            if (res.data.connected) {
                setCredentials({
                    appKey: res.data.twitter.appKey || '',
                    appSecret: res.data.twitter.appSecret || '',
                    accessToken: res.data.twitter.accessToken || '',
                    accessSecret: res.data.twitter.accessSecret || '',
                });
            }
        } catch (err) {
            console.error("Fetch Twitter status error:", err);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/twitter/save-global', credentials);
            showNotification("Twitter credentials saved successfully!", "success");
            fetchStatus();
        } catch (err: any) {
            showNotification("Failed to save credentials", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Disconnect Twitter? Auto-posting will stop.")) return;
        try {
            await API.delete('/twitter/disconnect');
            showNotification("Twitter disconnected", "success");
            setStatus(null);
            setCredentials({ appKey: '', appSecret: '', accessToken: '', accessSecret: '' });
        } catch (err: any) {
            showNotification("Failed to disconnect", "error");
        }
    };

    return (
        <div className={styles.facebookSection}>
            <div className={styles.headerCard} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '2rem' }}>🐦</span>
                    <div>
                        <h2 className={styles.pageTitle}>Twitter (X) Auto-Post Settings</h2>
                        <p className={styles.subtitle}>Configure Twitter API for automatic news sharing</p>
                    </div>
                </div>
            </div>

            <div className={styles.userListCard}>
                <div style={{ padding: '2rem' }}>
                    <form onSubmit={handleSave} className={styles.formGrid}>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label className={styles.label}>Consumer (App) Key</label>
                            <input 
                                type="text"
                                className={styles.input}
                                value={credentials.appKey}
                                onChange={(e) => setCredentials({...credentials, appKey: e.target.value})}
                                placeholder="Twitter App Key"
                                required
                            />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label className={styles.label}>Consumer (App) Secret</label>
                            <input 
                                type="password"
                                className={styles.input}
                                value={credentials.appSecret}
                                onChange={(e) => setCredentials({...credentials, appSecret: e.target.value})}
                                placeholder="Twitter App Secret"
                                required
                            />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label className={styles.label}>Access Token</label>
                            <input 
                                type="text"
                                className={styles.input}
                                value={credentials.accessToken}
                                onChange={(e) => setCredentials({...credentials, accessToken: e.target.value})}
                                placeholder="User Access Token"
                                required
                            />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label className={styles.label}>Access Secret</label>
                            <input 
                                type="password"
                                className={styles.input}
                                value={credentials.accessSecret}
                                onChange={(e) => setCredentials({...credentials, accessSecret: e.target.value})}
                                placeholder="User Access Secret"
                                required
                            />
                        </div>

                        <div className={styles.formActions} style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            {status?.connected && (
                                <button
                                    type="button"
                                    onClick={handleDisconnect}
                                    className={styles.secondaryBtn}
                                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                                >
                                    Disconnect
                                </button>
                            )}
                            <button
                                type="submit"
                                className={styles.primaryBtn}
                                disabled={loading}
                                style={{ backgroundColor: '#1DA1F2', border: 'none' }}
                            >
                                {loading ? 'Saving...' : status?.connected ? 'Update Credentials' : 'Connect Twitter'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className={styles.analyticsCard} style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Twitter API Setup</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    To use Twitter auto-post, you need to create an app in the <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: '#1DA1F2' }}>Twitter Developer Portal</a>.
                    Enable OAuth 1.0a (or use v2 User context) and ensure it has "Read and Write" permissions.
                </p>
            </div>
        </div>
    );
};

export default TwitterManager;
