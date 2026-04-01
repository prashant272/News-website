'use client';

import { useState, useEffect, useMemo } from 'react';

export type LanguageCode = 'en' | 'hi';

export const useLanguage = () => {
    const [lang, setLang] = useState<LanguageCode>(() => {
        if (typeof window !== 'undefined') {
            const host = window.location.host;
            const urlParams = new URLSearchParams(window.location.search);
            const queryLang = urlParams.get('lang');

            if (queryLang === 'hi' || host.startsWith('hindi.') || host.includes('.hindi.')) {
                return 'hi';
            }
        }
        return 'en';
    });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const values = useMemo(() => ({
        lang,
        isHindi: lang === 'hi',
        isEnglish: lang === 'en',
        isMounted
    }), [lang, isMounted]);

    return values;
};
