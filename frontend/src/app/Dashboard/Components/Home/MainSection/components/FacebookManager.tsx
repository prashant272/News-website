"use client";
import React, { useState, useEffect, useCallback, FC } from "react";
import { FaFacebook } from "react-icons/fa";
import { API } from "@/Utils/Utils";
import styles from "../Main.module.scss";

interface FacebookManagerProps {
    showNotification: (message: string, type: "success" | "error") => void;
}

const FacebookManager: FC<FacebookManagerProps> = ({ showNotification }) => {
    const [fbStatus, setFbStatus] = useState<any>(null);
    const [fbPages, setFbPages] = useState<any[]>([]);
    const [fbLoading, setFbLoading] = useState(false);

    const fetchFacebookStatus = useCallback(async () => {
        try {
            const res = await API.get('/fb/global-status');
            setFbStatus(res.data);
        } catch (err) {
            console.error("Fetch FB status error:", err);
        }
    }, []);

    useEffect(() => {
        fetchFacebookStatus();
    }, [fetchFacebookStatus]);

    const handleFacebookConnect = async () => {
        setFbLoading(true);
        try {
            const res = await API.get('/fb/auth');
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (err: any) {
            showNotification("Failed to connect Facebook", "error");
        } finally {
            setFbLoading(false);
        }
    };

    const handleDisconnectFacebook = async () => {
        if (!confirm("Disconnect Facebook? Auto-posting will stop.")) return;
        try {
            await API.delete('/fb/disconnect');
            showNotification("Facebook disconnected", "success");
            fetchFacebookStatus();
        } catch (err: any) {
            showNotification("Failed to disconnect", "error");
        }
    };

    const handleSaveFacebookPage = async (pageId: string, pageName: string, accessToken: string) => {
        try {
            await API.post('/fb/save-global-page', { pageId, pageName, pageAccessToken: accessToken });
            showNotification("Facebook page connected!", "success");
            fetchFacebookStatus();
            setFbPages([]);
        } catch (err) {
            showNotification("Failed to save page", "error");
        }
    };

    const handleFacebookTestPost = async () => {
        setFbLoading(true);
        try {
            const res = await API.post('/fb/test-post');
            if (res.data.success) {
                showNotification("Success! Check your FB page.", "success");
            }
        } catch (err: any) {
            showNotification(err.response?.data?.msg || "Test post failed", "error");
        } finally {
            setFbLoading(false);
        }
    };

    return (
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
    );
};

export default FacebookManager;
