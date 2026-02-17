"use client"
import React, { useState, useEffect, useMemo } from 'react';
import styles from './Navbar.module.scss';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useNewsContext } from '@/app/context/NewsContext';
import { useTheme } from '@/app/context/ThemeContext';
import Image from 'next/image';
import logo from "@/assets/Logo/primetimelogo.gif"
import { useActiveAds } from '@/app/hooks/useAds';

interface NavItem {
  label: string;
  href: string;
  key: string;
}

const SECTION_LABELS: Record<string, string> = {
  india: "India",
  world: "World",
  sports: "Sports",
  business: "Business",
  lifestyle: "Lifestyle",
  entertainment: "Entertainment",
  technology: "Technology",
  health: "Health",
  science: "Science",
  politics: "Politics",
  education: "Education",
};

const formatSectionName = (key: string): string => {
  return SECTION_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const newsContext = useNewsContext();
  const sections = newsContext?.sections;

  const { data: ads, loading: adsLoading } = useActiveAds();

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [{ label: "Home", href: "/", key: "home" }];
    if (sections) {
      Object.entries(sections).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          items.push({
            label: formatSectionName(key),
            href: `/Pages/${key}`,
            key,
          });
        }
      });
    }
    return items;
  }, [sections]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!ads || ads.length <= 1 || adsLoading || isPaused) return;

    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % ads.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [ads, adsLoading, isPaused]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const currentAd = ads && ads.length > 0 ? ads[currentAdIndex] : null;

  return (
    <nav className={`${styles.navbarWrapper} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>

        <div
          className={styles.adBanner}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {adsLoading ? (
            <div className={styles.adLoading}>Loading advertisements...</div>
          ) : currentAd ? (
            <a
              href={currentAd.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.adLink}
            >
              <div className={styles.adImageWrapper}>
                <Image
                  src={currentAd.imageUrl}
                  alt={currentAd.title || "Advertisement"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 970px"
                  className={styles.adImage}
                  priority={currentAdIndex === 0}
                />
              </div>
            </a>
          ) : (
            <div className={styles.adPlaceholder}>
              Advertisement Space – Recommended 970×250 / 728×90
            </div>
          )}

          {ads && ads.length > 1 && (
            <div className={styles.adDots}>
              {ads.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${index === currentAdIndex ? styles.active : ''}`}
                  onClick={() => setCurrentAdIndex(index)}
                  aria-label={`Go to advertisement ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.mainHeader}>
          <div className={styles.leftSection}>
            <button
              className={styles.menuButton}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" className={styles.logoContainer} onClick={closeMobileMenu}>
              <Image
                src={logo}
                alt="PrimeTime Logo"
                className={styles.logoImg}
                width={120}
                height={120}
                priority
              />
              {/* prime time text */}
              <span className={styles.brandName}></span>
            </Link>
          </div>

          <ul className={styles.navListDesktop}>
            {navItems.map(item => (
              <li key={item.key} className={styles.navItem}>
                <Link
                  href={item.href}
                  className={isActive(item.href) ? styles.active : ''}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.rightSection}>
            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
          <ul className={styles.navListMobile}>
            {navItems.map(item => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={isActive(item.href) ? styles.active : ''}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;