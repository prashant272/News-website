"use client";
import React from 'react';
import Link from 'next/link';
import { HINDI_STATES } from '@/Utils/stateMetadata';
import { getLocalizedHref } from '@/Utils/navigation';
import { useLanguage } from '@/app/hooks/useLanguage';
import styles from './StateNewsHeader.module.scss';

const StateNewsHeader: React.FC = () => {
    const { lang } = useLanguage();
    
    return (
        <div className={styles.stateHeaderWrapper}>
            <div className={styles.container}>
                <div className={styles.label}>राज्य चुनें:</div>
                <div className={styles.scrollArea}>
                    {HINDI_STATES.map((state) => (
                        <Link 
                            key={state.slug} 
                            href={getLocalizedHref(`/Pages/राज्य समाचार/${state.name}`, lang)}
                            className={styles.stateCapsule}
                        >
                            {state.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StateNewsHeader;
