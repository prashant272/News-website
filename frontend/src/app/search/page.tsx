"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { newsService, NewsItem } from '@/app/services/NewsService';
import { NewsCard } from '@/app/Components/Common/NewsCard/NewsCard';
import styles from './search.module.scss';

export default function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const performSearch = useCallback(async (pageNum: number) => {
        if (!query) return;
        setLoading(true);
        try {
            const res = await newsService.searchNews(query, pageNum, 12);
            if (res.success && res.news) {
                setResults(res.news);
                setTotal(res.pagination?.total || 0);
                setTotalPages(res.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    }, [query]);

    useEffect(() => {
        setPage(1);
        performSearch(1);
    }, [query, performSearch]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        performSearch(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!query) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <h1>Search Results</h1>
                    <p>Enter a keyword to search for news.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Search Results for: <span>"{query}"</span></h1>
                <p>{total} articles found</p>
            </div>

            {loading ? (
                <div className={styles.loading}>Searching...</div>
            ) : results.length > 0 ? (
                <>
                    <div className={styles.grid}>
                        {results.map((item) => (
                            <NewsCard key={item.slug} item={item} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className={styles.pageBtn}
                            >
                                Previous
                            </button>
                            <span>Page {page} of {totalPages}</span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className={styles.pageBtn}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className={styles.noResults}>
                    <p>No results found for your search query.</p>
                    <button onClick={() => router.push('/')} className={styles.backBtn}>
                        Back to Home
                    </button>
                </div>
            )}
        </div>
    );
}
