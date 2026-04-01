"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/app/hooks/useLanguage';
import { getLocalizedHref } from '@/Utils/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import logo from "@/assets/Logo/logo.png";
import { HINDI_STATES } from '@/Utils/stateMetadata';
import styles from './HindiNavbar.module.scss';
import TodayIPLMatchWidget from './TodayIPLMatchWidget';

const SECTION_LABELS_HI = {
  home: "होम",
  regional: "राज्य समाचार",
  india: "भारत",
  sports: "खेल",
  entertainment: "मनोरंजन",
  business: "बिज़नेस",
  awards: "अवॉर्ड्स"
};

const HindiNavbar: React.FC = () => {
    const pathname = usePathname();
    const { lang } = useLanguage();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: SECTION_LABELS_HI.home, href: "/" },
        { 
            label: SECTION_LABELS_HI.regional, 
            href: `/Pages/राज्य`,
            hasDropdown: true,
            dropdownItems: HINDI_STATES.map((s: any) => ({
                label: s.name,
                href: `/Pages/${SECTION_LABELS_HI.regional}/${s.name}` 
            }))
        },
        { label: SECTION_LABELS_HI.india, href: `/Pages/${SECTION_LABELS_HI.india}` },
        { label: SECTION_LABELS_HI.sports, href: `/Pages/${SECTION_LABELS_HI.sports}` },
        { label: SECTION_LABELS_HI.entertainment, href: `/Pages/${SECTION_LABELS_HI.entertainment}` },
        { label: SECTION_LABELS_HI.business, href: `/Pages/${SECTION_LABELS_HI.business}` },
        { label: SECTION_LABELS_HI.awards, href: `/Pages/${SECTION_LABELS_HI.awards}` },
    ];

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        const decodedPath = decodeURIComponent(pathname);
        return decodedPath.includes(href);
    };

    return (
        <>
        <div className={`${styles.navbarPlaceholder} ${scrolled ? styles.scrolled : ''}`}></div>
        <header className={`${styles.hindiNavbarWrapper} ${scrolled ? styles.scrolled : ''}`}>
            {/* Top Red Bar */}
            <div className={styles.topBar}>
                <div className={styles.container}>
                    <div className="flex items-center">
                        <span className={styles.breakingLabel}>ताज़ा और तेज़</span>
                        <p className="text-xs font-bold truncate max-w-sm md:max-w-xl">
                            प्राइम टाइम न्यूज़: एशिया का अग्रणी डिजिटल मीडिया हाउस
                        </p>
                    </div>
                    <div className="hidden lg:flex gap-6 items-center">
                        <Link href="/contact" className="text-[10px] uppercase tracking-widest font-black hover:text-white/80">
                            Connect with us
                        </Link>
                    </div>
                </div>
            </div>

            <div className={styles.mainHeader}>
                <div className={styles.logoArea}>
                    <button className={styles.mobileMenuBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <Link href={getLocalizedHref('/', lang)} className="flex items-center gap-3">
                        <Image src={logo} alt="PrimeTime" width={45} height={45} className={styles.logoImg} />
                        <span className={styles.brand}>PRIME TIME</span>
                    </Link>
                </div>

                <nav className={styles.navLinks}>
                    {navItems.map((item) => (
                        <div 
                            key={item.label} 
                            className={styles.navItem}
                            onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <Link 
                                href={getLocalizedHref(item.href, lang)} 
                                className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                            >
                                {item.label}
                                {item.hasDropdown && <ChevronDown size={14} className="ml-1 opacity-60" />}
                            </Link>

                            {item.hasDropdown && activeDropdown === item.label && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownGrid}>
                                        {item.dropdownItems?.map((sub: any) => (
                                            <Link 
                                                key={sub.label} 
                                                href={getLocalizedHref(sub.href, lang)}
                                                className={styles.dropdownItem}
                                                onClick={() => setActiveDropdown(null)}
                                            >
                                                {sub.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <div className={styles.rightActions}>
                    <TodayIPLMatchWidget />
                    <Link href={getLocalizedHref('/news', lang)} className={styles.liveBtn}>
                        <span className={styles.pulse}></span>
                        लाइव न्यूज़
                    </Link>
                    <Link href="https://primetimemedia.in" className={styles.langSwitch}>
                        EN
                    </Link>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
                <div className={styles.mobileContent}>
                     <div className="flex justify-between items-center mb-8 border-bottom pb-4">
                        <span className="text-xl font-black text-red-600">MENU</span>
                        <X size={32} onClick={() => setIsMenuOpen(false)} />
                    </div>
                    {navItems.map((item) => (
                        <div key={item.label} className={styles.mobileNavItem}>
                            <Link 
                                href={getLocalizedHref(item.href, lang)}
                                className={`${styles.mobileLink} ${isActive(item.href) ? styles.active : ''}`}
                                onClick={() => !item.hasDropdown && setIsMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                            
                            {item.hasDropdown && (
                                <div className={styles.mobileSubMenu}>
                                    {item.dropdownItems?.map((sub: any) => (
                                        <Link 
                                            key={sub.label} 
                                            href={getLocalizedHref(sub.href, lang)}
                                            className={styles.mobileSubLink}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {sub.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </header>
        </>
    );
};

export default HindiNavbar;
