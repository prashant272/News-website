"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar/Navbar";
import HindiNavbar from "./Navbar/HindiNavbar";
import Footer from "./Footer/Footer";
import WhatsAppButton from "./WhatsAppButton/WhatsAppButton";
import BreakingNewsTicker from "./BreakingNewsTicker/BreakingNewsTicker";
import GoogleAd from "./GoogleAd/GoogleAd";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const normalizedPath = pathname?.toLowerCase() || "";
    const isDashboard = normalizedPath.startsWith("/dashboard");
    const isVisualStory = normalizedPath.startsWith("/visualstories");

    console.log("ConditionalLayout path:", pathname, "isStory:", isVisualStory);

    const { isHindi } = useLanguage();

    if (!mounted) return null; // Wait for hydration

    if (isDashboard || isVisualStory) {
        return <>{children}</>;
    }

    return (
        <div style={{ overflowX: 'clip', width: '100%', position: 'relative' }}>
            {isHindi ? <HindiNavbar /> : <Navbar />}
            <BreakingNewsTicker />
            {/* Top Leaderboard Ad — below ticker, above content */}
            <div style={{ padding: '0 15px', background: '#f8f9fa' }}>
                <GoogleAd style={{ margin: '10px auto', maxWidth: 1200, borderRadius: '8px' }} />
            </div>

            {children}

            {/* Bottom Leaderboard Ad — above footer */}
            <div style={{ padding: '0 15px', borderTop: '1px solid #eee' }}>
                <GoogleAd style={{ margin: '20px auto', maxWidth: 1200 }} />
            </div>
            <Footer />
            <WhatsAppButton />
        </div>
    );
}
