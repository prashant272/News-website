"use client"
import React, { useState, useEffect, useMemo } from 'react';
import styles from './Navbar.module.scss';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { useNewsContext } from '@/app/context/NewsContext';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const newsContext = useNewsContext();
  const sections = newsContext?.sections;

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      { label: "Home", href: "/", key: "home" }
    ];

    if (!sections) return items;

    Object.entries(sections).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        items.push({
          label: formatSectionName(key),
          href: `/Pages/${key}`,
          key: key
        });
      }
    });

    return items;
  }, [sections]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <>
      {isSearchOpen && (
        <div 
          className={styles.searchOverlay} 
          onClick={() => setIsSearchOpen(false)}
        />
      )}
      
      <nav className={`${styles.navbarWrapper} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          <div className={styles.topHeader}>
            <div className={styles.leftSection}>
              <button 
                className={styles.menuButton}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            
            <Link href="/" className={styles.logoContainer} onClick={handleNavClick}>
              <img src="/logo.png" alt="PrimeTime Logo" className={styles.logoImg} />
            </Link>
            

          </div>

          {isSearchOpen && (
            <div className={styles.searchBar}>
              <div className={styles.searchInputWrapper}>
                <input 
                  type="text" 
                  placeholder="Search news, articles, videos..." 
                  className={styles.searchInput}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsSearchOpen(false);
                  }}
                />
                <button 
                  className={styles.closeSearch}
                  onClick={() => setIsSearchOpen(false)}
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
                <Search size={20} className={styles.searchIcon} />
              </div>
            </div>
          )}

          <div className={`${styles.mainNav} ${isMobileMenuOpen ? styles.navOpen : ''}`}>
            {newsContext?.loading ? (
              <div className={styles.navLoading}>Loading sections...</div>
            ) : (
              <ul className={styles.navList}>
                {navItems.map((item) => (
                  <li key={item.key} className={styles.navItem}>
                    <Link 
                      href={item.href}
                      className={isActive(item.href) ? styles.active : ''}
                      onClick={handleNavClick}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
