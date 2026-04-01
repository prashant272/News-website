"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from './Navbar.module.scss';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNewsContext } from '@/app/context/NewsContext';
import { useTheme } from '@/app/context/ThemeContext';
import Image from 'next/image';
import logo from "@/assets/Logo/logo.png"
import { useActiveAds } from '@/app/hooks/useAds';
import { baseURL } from '@/Utils/Utils';
import { useLanguage } from '@/app/hooks/useLanguage';
import TodayIPLMatchWidget from './TodayIPLMatchWidget';

interface SubMenuItem {
  label: string;
  href: string;
  isDivider?: boolean;
  submenu?: SubMenuItem[];
}

interface NavItem {
  label: string;
  href: string;
  key: string;
  submenu?: SubMenuItem[];
  dynamicSubmenu?: boolean;
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
  regional: "Regional"
};

const SECTION_LABELS_HI: Record<string, string> = {
  home: "होम",
  india: "भारत",
  world: "दुनिया",
  sports: "खेल",
  business: "बिजनेस",
  lifestyle: "लाइफस्टाइल",
  entertainment: "मनोरंजन",
  technology: "टेक",
  health: "स्वास्थ्य",
  science: "विज्ञान",
  politics: "राजनीति",
  education: "शिक्षा",
  awards: "अवॉर्ड्स",
  regional: "राज्य समाचार"
};

const formatSectionName = (key: string): string => {
  return SECTION_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

const LiveScoreButton: React.FC<{ API_BASE: string }> = ({ API_BASE }) => {
  const [hasLiveMatch, setHasLiveMatch] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE}/api/live/live-stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.live) {
          setHasLiveMatch(data.live.length > 0);
        } else if (Array.isArray(data)) {
          setHasLiveMatch(data.length > 0);
        }
      } catch (err) {
        console.error("Live Score SSE Error:", err);
      }
    };

    return () => eventSource.close();
  }, [API_BASE]);

  return (
    <Link href="/sports/live" className={styles.liveButton}>
      {hasLiveMatch && <span className={styles.liveDot}></span>}
      {hasLiveMatch ? 'LIVE' : 'Live Scores'}
    </Link>
  );
};

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleItems, setVisibleItems] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);
  const [pinnedSubDropdown, setPinnedSubDropdown] = useState<string | null>(null);
  const [showPill, setShowPill] = useState(false);
  const [isPillMenuOpen, setIsPillMenuOpen] = useState(false);

  const desktopNavRef = useRef<HTMLDivElement>(null);
  const scrollPillRef = useRef<HTMLDivElement>(null);

  const { theme, toggleTheme } = useTheme();
  const newsContext = useNewsContext();
  const { lang, isHindi } = useLanguage();
  const API_BASE = "http://localhost:8086";

  const [internationalPrograms, setInternationalPrograms] = useState<SubMenuItem[]>([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/international-programs`);
        const data = await response.json();
        if (data.success) {
          const formatted = data.data.map((p: any) => ({
            label: p.title,
            href: p.link
          }));
          setInternationalPrograms(formatted);
        }
      } catch (err) {
        console.error("Fetch Programs Error:", err);
      }
    };
    fetchPrograms();
  }, [API_BASE]);

  const { data: ads, loading: adsLoading } = useActiveAds();

  const navItems = useMemo<NavItem[]>(() => {
    const labels = isHindi ? SECTION_LABELS_HI : SECTION_LABELS;
    
    const items: NavItem[] = [
      { label: labels.home || "Home", href: "/", key: "home" },
      { label: labels.india || "India", href: "/Pages/india", key: "india" },
      { label: labels.world || "World", href: "/Pages/world", key: "world" },
      { label: labels.sports || "Sports", href: "/Pages/sports", key: "sports" },
      { label: labels.business || "Business", href: "/Pages/business", key: "business" },
      { label: labels.technology || "Technology", href: "/Pages/technology", key: "technology" },
      {
        label: labels.awards || "Awards",
        href: "/Pages/awards",
        key: "awards",
        submenu: [
          { label: isHindi ? "हेल्थकेयर अवॉर्ड्स" : "Healthcare Awards", href: "https://healthcareawards.primetimemedia.in/" },
          { label: isHindi ? "शिक्षा अवॉर्ड्स" : "Education Awards", href: "https://education-awards.primetimemedia.in/" },
          { label: isHindi ? "बिजनेस अवॉर्ड्स" : "Business Awards", href: "https://business-leadership.primetimemedia.in/" },
          { label: isHindi ? "अवॉर्ड्स न्यूज़" : "Awards News", href: "/Pages/awards" },
          ...(internationalPrograms.length > 0 ? [{
            label: isHindi ? "इंटरनेशनल प्रोग्राम" : "International Program",
            href: "#",
            submenu: internationalPrograms
          }] : [])
        ]
      },
      { label: labels.entertainment || "Entertainment", href: "/Pages/entertainment", key: "entertainment" },
      { label: labels.lifestyle || "Lifestyle", href: "/Pages/lifestyle", key: "lifestyle" },
      { label: labels.health || "Health", href: "/Pages/health", key: "health" },
    ];

    if (isHindi) {
      // Add Regional/State news specifically for Hindi
      items.splice(1, 0, { label: labels.regional || "States", href: "/Pages/regional", key: "regional" });
    }

    return items;
  }, [internationalPrograms, isHindi]);

  // First 7 items shown (including Awards), rest behind >> more
  const PRIMARY_COUNT = 7;
  const primaryItems = navItems.slice(0, PRIMARY_COUNT);
  const moreItems = navItems.slice(PRIMARY_COUNT);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowPill(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setVisibleItems(1);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideDesktop = desktopNavRef.current?.contains(target);
      const isInsidePill = scrollPillRef.current?.contains(target);

      if (activeDropdown && !isInsideDesktop && !isInsidePill) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  useEffect(() => {
    if (!headerAds || headerAds.length <= visibleItems || adsLoading || isPaused) return;

    const interval = setInterval(() => {
      setCurrentAdIndex(prev => {
        const next = prev + 1;
        return next > headerAds.length - visibleItems ? 0 : next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [ads?.length, adsLoading, isPaused, visibleItems]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const headerAds = useMemo(() => {
    if (!ads) return [];
    return ads.filter(ad => ad.isActive && (ad.headerImageUrl || ad.placement === 'header'));
  }, [ads]);

  return (
    <>
      <nav ref={desktopNavRef} className={`${styles.navbarWrapper} ${scrolled ? styles.scrolled : ''} ${showPill && !isMobileMenuOpen ? styles.hideNavbar : ''}`}>
        <div className={styles.container}>

          <div className={styles.adBannerContainer}>
            <div
              className={styles.adBanner}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {adsLoading ? (
                <div className={styles.adLoading}>Loading advertisements...</div>
              ) : headerAds.length > 0 ? (
                <div className={styles.adCarousel}>
                  <div
                    className={styles.adTrack}
                    style={{
                      transform: `translateX(-${currentAdIndex * (100 / visibleItems)}%)`,
                      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {headerAds.map((ad, index) => (
                      <div key={ad._id || index} className={styles.adItem}>
                        <a
                          href={ad.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.adLink}
                        >
                          <div className={styles.adImageWrapper}>
                            <Image
                              src={ad.headerImageUrl || ad.imageUrl}
                              alt={ad.title || "Advertisement"}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className={styles.adImage}
                              priority={index < 3}
                            />
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.adPlaceholder}>
                  Advertisement Space – Premium Placements
                </div>
              )}

              {headerAds.length > visibleItems && (
                <div className={styles.adDots}>
                  {Array.from({ length: Math.max(0, headerAds.length - visibleItems + 1) }).map((_, index) => (
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

            <div className={styles.adFooter}>
              <div className={styles.sponsoredLabel}>Sponsored By</div>
              <div className={styles.adContactWrapper}>
                <div className={styles.adContactContainer}>
                  <div className={styles.adContact}>
                    Contact for advertisement: +91 9971 00 2984 &nbsp; | &nbsp;
                    Contact for advertisement: +91 9971 00 2984 &nbsp; | &nbsp;
                    Contact for advertisement: +91 9971 00 2984 &nbsp; | &nbsp;
                  </div>
                  <div className={styles.adContact} aria-hidden="true">
                    Contact for advertisement: +91 9971 00 2984 &nbsp; | &nbsp;
                    Contact for advertisement: +91 9971 00 2984 &nbsp; | &nbsp;
                    Contact for advertisement: +91 9971 00 2984 &nbsp; | &nbsp;
                  </div>
                </div>
              </div>
            </div>
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
                  width={160}
                  height={160}
                  priority
                />
                {/* prime time text */}
                <span className={styles.brandName}> </span>
              </Link>
            </div>

            <ul className={styles.navListDesktop}>
              {/* Primary 6 tabs */}
              {primaryItems.map(item => (
                <li
                  key={item.key}
                  className={`${styles.navItem} ${item.submenu ? styles.hasDropdown : ''}`}
                  onMouseEnter={() => item.submenu && setActiveDropdown(item.key)}
                  onMouseLeave={() => item.submenu && setActiveDropdown(null)}
                >
                  {item.submenu ? (
                    <>
                      <button
                        className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''} ${activeDropdown === item.key ? styles.active : ''}`}
                        onClick={(e) => toggleDropdown(item.key, e)}
                      >
                        {item.label}
                        <ChevronDown size={14} className={`${styles.chevron} ${activeDropdown === item.key ? styles.rotate : ''}`} />
                      </button>
                      <div className={`${styles.dropdownMenu} ${activeDropdown === item.key ? styles.show : ''}`}
                        onMouseLeave={() => {
                          setActiveSubDropdown(null);
                          setPinnedSubDropdown(null);
                        }}
                      >
                        <div className={styles.dropdownScrollArea}>
                          {item.submenu.map((sub, idx) => {
                            const subId = `${item.key}-${idx}`;
                            return (
                              <div key={idx}
                                className={`${styles.dropdownItemWrapper} ${sub.submenu ? styles.hasNestedDropdown : ''}`}
                                onMouseEnter={() => {
                                  if (!pinnedSubDropdown) {
                                    setActiveSubDropdown(sub.submenu ? subId : null);
                                  }
                                }}
                                onClick={(e) => {
                                  if (sub.submenu) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPinnedSubDropdown(pinnedSubDropdown === subId ? null : subId);
                                    setActiveSubDropdown(subId);
                                  }
                                }}
                              >
                                {sub.submenu ? (
                                  <div className={`${styles.dropdownItem} ${pinnedSubDropdown === subId ? styles.active : ''}`}>
                                    <ChevronLeft size={12} className={styles.submenuChevron} /> {sub.label}
                                  </div>
                                ) : (
                                  <Link
                                    href={sub.href}
                                    className={styles.dropdownItem}
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      setPinnedSubDropdown(null);
                                    }}
                                    target={sub.href.startsWith('http') ? '_blank' : undefined}
                                    rel={sub.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                  >
                                    {sub.isDivider ? (
                                      <div className={styles.dropdownSectionLabel}>{sub.label}</div>
                                    ) : (
                                      sub.label
                                    )}
                                  </Link>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Render nested menus here, outside scroll area, to prevent clipping */}
                        {item.submenu.map((sub, idx) => {
                          const subId = `${item.key}-${idx}`;
                          return (
                            sub.submenu && (activeSubDropdown === subId || pinnedSubDropdown === subId) && (
                              <div key={`nested-${idx}`} className={styles.nestedDropdownMenu}>
                                {sub.submenu.map((nestedSub, nIdx) => (
                                  <Link
                                    key={nIdx}
                                    href={nestedSub.href}
                                    className={styles.dropdownItem}
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      setPinnedSubDropdown(null);
                                    }}
                                    target={nestedSub.href.startsWith('http') ? '_blank' : undefined}
                                    rel={nestedSub.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                  >
                                    {nestedSub.label}
                                  </Link>
                                ))}
                              </div>
                            )
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <Link href={item.href} className={isActive(item.href) ? styles.active : ''}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}

              {/* >> More dropdown */}
              {moreItems.length > 0 && (
                <li
                  className={`${styles.navItem} ${styles.hasDropdown}`}
                  onMouseEnter={() => setActiveDropdown('__more__')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`${styles.navLink} ${activeDropdown === '__more__' ? styles.active : ''}`}
                    onClick={(e) => toggleDropdown('__more__', e)}
                  >
                    »
                    <ChevronDown size={14} className={`${styles.chevron} ${activeDropdown === '__more__' ? styles.rotate : ''}`} />
                  </button>
                  <div className={`${styles.dropdownMenu} ${activeDropdown === '__more__' ? styles.show : ''}`}>
                    {/* Live T20 World Cup link at top */}
                    <Link href="/sports/live" className={`${styles.dropdownItem} ${styles.liveDropdownItem}`} onClick={() => setActiveDropdown(null)}>
                      🔴 Live T20 World Cup
                    </Link>
                    <div className={styles.dropdownDivider} />
                    {moreItems.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        className={`${styles.dropdownItem} ${isActive(item.href) ? styles.active : ''}`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </li>
              )}
            </ul>

            <div className={styles.rightSection}>

              {/* Language Switcher */}
              <div className={styles.langSwitcher}>
                {isHindi ? (
                  <a href="https://primetimemedia.in" className={styles.langBtn}>EN</a>
                ) : (
                  <a href="https://hindi.primetimemedia.in" className={styles.langBtn}>हिन्दी</a>
                )}
              </div>

              <button
                className={styles.themeToggle}
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {/* Live Button */}
              <LiveScoreButton API_BASE={API_BASE} />
            </div>
          </div>
        </div>
      </nav>

      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
        <ul className={styles.navListMobile}>
          {navItems.map(item => (
            <li key={item.key} className={item.submenu ? styles.hasMobileSubmenu : ''}>
              {item.submenu ? (
                <>
                  <button
                    className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.active : ''}`}
                    onClick={(e) => toggleDropdown(item.key, e)}
                  >
                    {item.label}
                    <ChevronDown size={20} className={`${styles.chevron} ${(activeDropdown === item.key || activeDropdown?.startsWith(`nested-${item.key}`)) ? styles.rotate : ''}`} />
                  </button>
                  <div className={`${styles.mobileSubmenu} ${(activeDropdown === item.key || activeDropdown?.startsWith(`nested-${item.key}`)) ? styles.open : ''}`}>
                    {item.submenu.map((sub, idx) => (
                      <div key={idx} className={styles.mobileSubItemWrapper}>
                        {sub.submenu ? (
                          <>
                            <button
                              className={styles.mobileSubItem}
                              onClick={(e) => {
                                e.stopPropagation();
                                const nestedMenuId = `nested-${item.key}-${idx}`;
                                setActiveDropdown(activeDropdown === nestedMenuId ? item.key : nestedMenuId);
                              }}
                            >
                              {sub.label} <ChevronDown size={14} className={`${styles.chevron} ${activeDropdown?.startsWith(`nested-${item.key}-${idx}`) ? styles.rotate : ''}`} />
                            </button>
                            <div className={`${styles.mobileNestedSubmenu} ${activeDropdown?.startsWith(`nested-${item.key}-${idx}`) ? styles.open : ''}`}>
                              {sub.submenu.map((nestedSub, nIdx) => (
                                <Link
                                  key={nIdx}
                                  href={nestedSub.href}
                                  className={styles.mobileSubItem}
                                  style={{ paddingLeft: '60px' }}
                                  onClick={closeMobileMenu}
                                >
                                  {nestedSub.label}
                                </Link>
                              ))}
                            </div>
                          </>
                        ) : (
                          <Link
                            href={sub.href}
                            className={styles.mobileSubItem}
                            onClick={closeMobileMenu}
                          >
                            {sub.isDivider ? (
                              <div className={styles.dropdownSectionLabel} style={{ borderTop: 'none', marginTop: 0, paddingLeft: '40px' }}>{sub.label}</div>
                            ) : (
                              sub.label
                            )}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  className={isActive(item.href) ? styles.active : ''}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>


      <AnimatePresence>
        {showPill && (
          <motion.div
            ref={scrollPillRef}
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={styles.scrollPill}
          >
            <div className={`${styles.pillContainer} ${isPillMenuOpen ? styles.menuOpen : ''}`}>
              <div className={styles.pillMainRow}>
                <Link href="/" className={styles.pillLogo} onClick={() => setIsPillMenuOpen(false)}>
                  <Image src={logo} alt="Logo" width={32} height={32} />
                </Link>

                <div className={`${styles.pillLinksList} ${isPillMenuOpen ? styles.showMobileLinks : ''}`}>
                  {navItems.map((item) => (
                    <div
                      key={item.key}
                      className={`${styles.pillItemWrapper} ${item.submenu ? styles.hasPillDropdown : ''}`}
                      onMouseEnter={() => item.submenu && !isPillMenuOpen && setActiveDropdown(`pill-${item.key}`)}
                    >
                      {item.submenu ? (
                        <>
                          <button
                            className={`${styles.pillItem} ${isActive(item.href) ? styles.pillActive : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              // Ensure it's open. If it's already open, keep it open.
                              // This prevents the "close on click" issue when already opened by hover.
                              setActiveDropdown(`pill-${item.key}`);
                            }}
                          >
                            {item.label}
                            <ChevronDown size={14} className={`${styles.pillChevron} ${activeDropdown === `pill-${item.key}` ? styles.rotate : ''}`} />
                          </button>

                          <div className={`${styles.pillDropdownMenu} ${activeDropdown === `pill-${item.key}` ? styles.show : ''}`}
                            onMouseLeave={() => {
                              if (!isPillMenuOpen) {
                                setActiveDropdown(null);
                                setActiveSubDropdown(null);
                                setPinnedSubDropdown(null);
                              }
                            }}
                          >
                            <div className={styles.pillDropdownScrollArea}>
                              {item.submenu.map((sub, idx) => {
                                const subId = `pill-${item.key}-${idx}`;
                                return (
                                  <div key={idx}
                                    className={`${styles.dropdownItemWrapper} ${sub.submenu ? styles.hasNestedDropdown : ''}`}
                                    onMouseEnter={() => {
                                      if (!pinnedSubDropdown) {
                                        setActiveSubDropdown(sub.submenu ? subId : null);
                                      }
                                    }}
                                    onClick={(e) => {
                                      if (sub.submenu) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setPinnedSubDropdown(pinnedSubDropdown === subId ? null : subId);
                                        setActiveSubDropdown(subId);
                                      }
                                    }}
                                  >
                                    {sub.submenu ? (
                                      <div className={`${styles.dropdownItem} ${pinnedSubDropdown === subId ? styles.active : ''}`}>
                                        <ChevronLeft size={12} className={styles.submenuChevron} /> {sub.label}
                                      </div>
                                    ) : (
                                      <Link
                                        href={sub.href}
                                        className={styles.dropdownItem}
                                        onClick={() => {
                                          setActiveDropdown(null);
                                          setPinnedSubDropdown(null);
                                          setIsPillMenuOpen(false);
                                        }}
                                        target={sub.href.startsWith('http') ? '_blank' : undefined}
                                        rel={sub.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                      >
                                        {sub.isDivider ? (
                                          <div className={styles.dropdownSectionLabel}>{sub.label}</div>
                                        ) : (
                                          sub.label
                                        )}
                                      </Link>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Render nested menus for pill */}
                            {item.submenu.map((sub, idx) => {
                              const subId = `pill-${item.key}-${idx}`;
                              return (
                                sub.submenu && (activeSubDropdown === subId || pinnedSubDropdown === subId) && (
                                  <div key={`nested-pill-${idx}`} className={styles.pillNestedDropdownMenu}>
                                    {sub.submenu.map((nestedSub, nIdx) => (
                                      <Link
                                        key={nIdx}
                                        href={nestedSub.href}
                                        className={styles.dropdownItem}
                                        onClick={() => {
                                          setActiveDropdown(null);
                                          setPinnedSubDropdown(null);
                                          setIsPillMenuOpen(false);
                                        }}
                                        target={nestedSub.href.startsWith('http') ? '_blank' : undefined}
                                        rel={nestedSub.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                      >
                                        {nestedSub.label}
                                      </Link>
                                    ))}
                                  </div>
                                )
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          className={`${styles.pillItem} ${isActive(item.href) ? styles.pillActive : ''}`}
                          onClick={() => setIsPillMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  className={styles.pillMenuBtn}
                  onClick={() => setIsPillMenuOpen(!isPillMenuOpen)}
                  aria-label="Toggle pill menu"
                >
                  {isPillMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;