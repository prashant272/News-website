"use client";

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
    const isDashboard = pathname?.startsWith("/Dashboard");

    if (isDashboard) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <BreakingNewsTicker />
            {/* Top Ad — below ticker, above content */}
            <GoogleAd style={{ margin: '6px auto', maxWidth: 1200 }} />
            {children}
            {/* Bottom Ad — above footer */}
            <GoogleAd style={{ margin: '16px auto', maxWidth: 1200 }} />
            <Footer />
            <WhatsAppButton />
        </>
    );
}
