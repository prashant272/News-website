"use client";
import React, { useState, useEffect, useCallback, FC, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaLinkedin, FaTrash, FaToggleOn, FaToggleOff, FaPlus } from "react-icons/fa";
import { API } from "@/Utils/Utils";
import styles from "../Main.module.scss";

interface LinkedInManagerProps {
    showNotification: (message: string, type: "success" | "error") => void;
}

interface LinkedInAccount {
    _id: string;
    accountId: string;
    accountName: string;
    type: string;
    autoPostEnabled: boolean;
    connectedAt: string;
}

const LinkedInManager: FC<LinkedInManagerProps> = ({ showNotification }) => {
    const [accounts, setAccounts] = useState<LinkedInAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const processingRef = useRef(false);

    const fetchAccounts = useCallback(async () => {
        try {
            const res = await API.get('/linkedin/accounts');
            if (res.data.success) setAccounts(res.data.accounts);
        } catch (err) {
            console.error("Fetch LinkedIn accounts error:", err);
        }
    }, []);

    // Handle OAuth callback
    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");
            const state = searchParams.get("state");
            if (code && state === 'linkedin' && !processingRef.current) {
                processingRef.current = true;
                setLoading(true);
                try {
                    const res = await API.get(`/linkedin/callback?code=${code}`);
                    if (res.data.success) {
                        const { accessToken, accountId, accountName, type } = res.data;
                        await API.post('/linkedin/add-account', { accessToken, accountId, accountName, type });
                        showNotification(`✅ ${accountName} connected successfully!`, "success");
                        fetchAccounts();
                    } else {
                        showNotification(res.data.msg || "LinkedIn authentication failed", "error");
                    }
                } catch (err: any) {
                    showNotification("Failed to authenticate with LinkedIn", "error");
                } finally {
                    setLoading(false);
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("code");
                    params.delete("state");
                    router.replace(`${window.location.pathname}?${params.toString()}`);
                }
            }
        };
        handleCallback();
    }, [searchParams, router, showNotification, fetchAccounts]);

    useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const res = await API.get('/linkedin/auth');
            if (res.data.url) window.location.href = res.data.url;
        } catch {
            showNotification("Failed to start LinkedIn connection", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (account: LinkedInAccount) => {
        if (!confirm(`Remove ${account.accountName}?`)) return;
        try {
            await API.delete(`/linkedin/accounts/${encodeURIComponent(account.accountId)}`);
            showNotification(`${account.accountName} removed`, "success");
            fetchAccounts();
        } catch {
            showNotification("Failed to remove account", "error");
        }
    };

    const handleToggle = async (account: LinkedInAccount) => {
        try {
            await API.patch(`/linkedin/accounts/${encodeURIComponent(account.accountId)}/toggle`, {
                enabled: !account.autoPostEnabled
            });
            fetchAccounts();
        } catch {
            showNotification("Failed to toggle", "error");
        }
    };

    const activeCount = accounts.filter(a => a.autoPostEnabled).length;

    return (
        <div className={styles.facebookSection}>
            {/* Header */}
            <div className={styles.headerCard} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '2rem', color: '#0A66C2' }}><FaLinkedin /></span>
                        <div>
                            <h2 className={styles.pageTitle}>LinkedIn Auto-Post</h2>
                            <p className={styles.subtitle}>
                                {accounts.length === 0
                                    ? 'Connect LinkedIn profiles or pages to broadcast news'
                                    : `${activeCount} of ${accounts.length} account${accounts.length > 1 ? 's' : ''} active`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className={styles.primaryBtn}
                        style={{ backgroundColor: '#0A66C2', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FaPlus /> {loading ? 'Connecting...' : 'Add Account'}
                    </button>
                </div>
            </div>

            {/* Accounts List */}
            <div className={styles.userListCard}>
                {accounts.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}><FaLinkedin /></div>
                        <h3 style={{ marginBottom: '1rem' }}>No Accounts Connected</h3>
                        <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                            Add multiple LinkedIn profiles or pages. News will be posted to all enabled accounts simultaneously.
                        </p>
                        <button
                            onClick={handleConnect}
                            disabled={loading}
                            className={styles.primaryBtn}
                            style={{ backgroundColor: '#0A66C2', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
                        >
                            <FaLinkedin /> {loading ? 'Connecting...' : 'Connect LinkedIn Account'}
                        </button>
                    </div>
                ) : (
                    <div style={{ padding: '1.5rem' }}>
                        {accounts.map(account => (
                            <div key={account._id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '1rem 1.5rem', marginBottom: '1rem',
                                borderRadius: '12px', border: '1px solid #e2e8f0',
                                backgroundColor: account.autoPostEnabled ? '#f0f9ff' : '#f8fafc',
                                opacity: account.autoPostEnabled ? 1 : 0.6
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ fontSize: '1.8rem', color: '#0A66C2' }}><FaLinkedin /></div>
                                    <div>
                                        <strong style={{ fontSize: '1rem' }}>{account.accountName}</strong>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                                            {account.type === 'organization' ? '🏢 Company Page' : '👤 Personal Profile'}
                                            {' · '}
                                            {account.autoPostEnabled ? <span style={{ color: '#22c55e' }}>Active</span> : <span style={{ color: '#94a3b8' }}>Paused</span>}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <button
                                        title={account.autoPostEnabled ? "Pause posting" : "Resume posting"}
                                        onClick={() => handleToggle(account)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: account.autoPostEnabled ? '#22c55e' : '#94a3b8' }}
                                    >
                                        {account.autoPostEnabled ? <FaToggleOn /> : <FaToggleOff />}
                                    </button>
                                    <button
                                        title="Remove account"
                                        onClick={() => handleRemove(account)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#ef4444', padding: '0.4rem' }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                Add another profile or page to broadcast to multiple accounts
                            </p>
                            <button
                                onClick={handleConnect}
                                disabled={loading}
                                style={{ background: 'none', border: '1px dashed #0A66C2', color: '#0A66C2', borderRadius: '8px', padding: '0.6rem 1.5rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <FaPlus /> {loading ? 'Connecting...' : 'Add Another Account'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinkedInManager;
