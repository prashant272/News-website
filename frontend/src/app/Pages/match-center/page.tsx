"use client";

import React from 'react';
import HindiSportsCricketDashboard from '@/app/Components/Home/Hindi/HindiSportsCricketDashboard';
import BreadcrumbSchema from '@/app/Components/Common/JSONLD/BreadcrumbSchema';
import { useLanguage } from '@/app/hooks/NewsApi';

export default function MatchCenterPage() {
    const { lang } = useLanguage();

    return (
        <div style={{ minHeight: '80vh' }}>
            <BreadcrumbSchema
                items={[
                    { name: "Home", item: "/" },
                    { name: "Sports", item: lang === 'hi' ? "/news/sports" : "/Pages/sports" },
                    { name: "Match Center", item: lang === 'hi' ? "/news/match-center" : "/Pages/match-center" }
                ]}
            />
            
            <div className="container mx-auto px-4 py-8">
                <h1 style={{ 
                    textAlign: 'center', 
                    fontSize: '2.5rem', 
                    fontWeight: '900', 
                    marginBottom: '2rem',
                    color: '#1e293b'
                }}>
                    {lang === 'hi' ? 'क्रिकेट मैच सेंटर' : 'Cricket Match Center'}
                </h1>
                
                <HindiSportsCricketDashboard />
            </div>
        </div>
    );
}
