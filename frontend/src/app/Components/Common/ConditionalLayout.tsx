"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
import WhatsAppButton from "./WhatsAppButton/WhatsAppButton";
import BreakingNewsTicker from "./BreakingNewsTicker/BreakingNewsTicker";
import GoogleAd from "./GoogleAd/GoogleAd";

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

    if (!mounted) return null; // Wait for hydration

    if (isDashboard || isVisualStory) {
        return <>{children}</>;
    }

    return (
        <div style={{ overflowX: 'hidden', width: '100%', position: 'relative' }}>
            <Navbar />
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
