"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
import WhatsAppButton from "./WhatsAppButton/WhatsAppButton";
import BreakingNewsTicker from "./BreakingNewsTicker/BreakingNewsTicker";

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
            {children}
            <Footer />
            <WhatsAppButton />
        </>
    );
}
