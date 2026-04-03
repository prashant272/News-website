"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useNewsBySection } from '@/app/hooks/NewsApi';
import { useLanguage } from '@/app/hooks/useLanguage';
import { formatDateTime } from '@/Utils/Utils';
import { getLocalizedHref } from '@/Utils/navigation';
import styles from './HindiRegionalNews.module.scss';

const STATES = [
    { name: 'उत्तर प्रदेश', value: 'Uttar Pradesh' },
    { name: 'बिहार', value: 'Bihar' },
    { name: 'दिल्ली', value: 'Delhi' },
    { name: 'उत्तराखंड', value: 'Uttarakhand' },
    { name: 'हरियाणा', value: 'Haryana' },
    { name: 'राजस्थान', value: 'Rajasthan' },
    { name: 'मध्य प्रदेश', value: 'Madhya Pradesh' },
    { name: 'झारखंड', value: 'Jharkhand' },
    { name: 'महाराष्ट्र', value: 'Maharashtra' },
    { name: 'छत्तीसगढ़', value: 'Chhattisgarh' }
];

const HindiRegionalNews: React.FC = () => {
    const [selectedState, setSelectedState] = useState('Uttar Pradesh');
    const { lang } = useLanguage();
    
    // Fetch news based on language and state category
    const { data: news, loading } = useNewsBySection('regional', false, 1, 6);

    const filteredNews = useMemo(() => {
        if (!news) return [];
        // If "Uttar Pradesh" is selected, we filter by state field
        return news.filter(n => (n.state || 'Universal').toLowerCase().includes(selectedState.toLowerCase()));
    }, [news, selectedState]);

    const getUrl = (item: any) => {
        const catRaw = Array.isArray(item.category) ? item.category[0] : (item.category || 'news');
        const cat = catRaw.toLowerCase();
        const sub = (item.subCategory || 'general').toLowerCase();
        return getLocalizedHref(`/Pages/${cat}/${sub}/${item.slug}`, lang);
    };

    if (loading && (!news || news.length === 0)) {
        return (
            <div className={styles.container}>
                <div className="animate-pulse bg-gray-100 h-10 w-64 rounded-lg mb-10"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-gray-100 h-64 rounded-xl"></div>)}
                </div>
            </div>
        );
    }

    return (
        <section className={styles.hindiRegional}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerTop}>
                        <span className={styles.dot}></span>
                        <h2>आपके राज्य की खबरें</h2>
                    </div>
                    
                    <div className={styles.stateFilter}>
                        {STATES.map(s => (
                            <button 
                                key={s.value}
                                className={`${styles.filterBtn} ${selectedState === s.value ? styles.active : ''}`}
                                onClick={() => setSelectedState(s.value)}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredNews.length > 0 ? (
                    <div className={styles.grid}>
                        {filteredNews.map((item) => (
                            <Link key={item.slug} href={getUrl(item)} className={styles.card}>
                                <div className={styles.imgBox}>
                                    <span className={styles.stateTag}>{item.state}</span>
                                    <Image src={item.image || '/placeholder.jpg'} alt={item.title} fill />
                                </div>
                                <div className={styles.info}>
                                    <h3>{item.title}</h3>
                                    {item.publishedAt && (
                                        <span className={styles.date}>{formatDateTime(item.publishedAt)}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className={styles.noNews}>
                        इस राज्य के लिए फिलहाल कोई विशेष खबर नहीं है। सभी राज्य समाचार देखने के लिए नीचे क्लिक करें।
                    </div>
                )}

                <div className={styles.footer}>
                    <Link href={getLocalizedHref('/Pages/regional', lang)} className={styles.viewMore}>
                        अधिक राज्य समाचार देखें
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HindiRegionalNews;
