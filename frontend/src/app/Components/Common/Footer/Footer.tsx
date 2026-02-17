'use client'

import React from 'react'
import Link from 'next/link'
import styles from './Footer.module.scss'
import {
  FaFacebookF, FaInstagram, FaYoutube,
  FaLinkedinIn, FaWhatsapp, FaTelegram, FaRss,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaChevronRight
} from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import Image from 'next/image'
import logo from "@/assets/Logo/primetimelogo.gif"

const Footer: React.FC = () => {
  const year = new Date().getFullYear()

  const footerLinks = {
    quickLinks: [
      { name: 'Home', href: '/' },
      { name: 'About Us', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Advertise', href: '/advertise' },
      { name: 'Careers', href: '/careers' }
    ],
    categories: [
      { name: 'India', href: '/Pages/india' },
      { name: 'World', href: '/Pages/world' },
      { name: 'Business', href: '/Pages/business' },
      { name: 'Technology', href: '/Pages/technology' },
      { name: 'Sports', href: '/Pages/sports' },
      { name: 'Entertainment', href: '/Pages/entertainment' },
      { name: 'Lifestyle', href: '/Pages/lifestyle' },
      { name: 'Health', href: '/Pages/health' }
    ],
    resources: [
      { name: 'Press Releases', href: '/press' },
      { name: 'Editorial Policy', href: '/editorial' },
      { name: 'Fact Check', href: '/fact-check' },
      { name: 'Archives', href: '/archives' },
      { name: 'RSS Feed', href: '/rss' }
    ]
  }

  const socialLinks = [
    { icon: FaFacebookF, href: 'https://facebook.com', label: 'Facebook', platform: 'facebook' },
    { icon: FaXTwitter, href: 'https://twitter.com', label: 'X (Twitter)', platform: 'x' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram', platform: 'instagram' },
    { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube', platform: 'youtube' },
    { icon: FaLinkedinIn, href: 'https://linkedin.com', label: 'LinkedIn', platform: 'linkedin' },
    { icon: FaWhatsapp, href: 'https://wa.me/9810882769', label: 'WhatsApp', platform: 'whatsapp' },
    { icon: FaTelegram, href: 'https://t.me/primetimenews', label: 'Telegram', platform: 'telegram' },
    { icon: FaRss, href: '/rss', label: 'RSS', platform: 'rss' }
  ]

  const contactInfo = {
    office: 'Prime Time Research Media Pvt. Ltd, C-31, Nawada Housing Complex, New Delhi-110059',
    phones: [
      { number: '+91 9971 00 2984', label: 'Sponsorship' },
      { number: '+91 9810 91 0686', label: 'Helpline' },
      { number: '+91 11-69268754', label: 'Office' }
    ],
    email: 'contact@primetimemedia.in'
  }

  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.section}>
            <div className={styles.logoSection}>
              <Image
                src={logo}
                alt="Prime Time News"
                className={styles.logoImg}
                width={64}
                height={64}
                priority
              />
              <h3 className={styles.brandName}>Prime Time News</h3>
              <p className={styles.tagline}>Truth in Every Story</p>
            </div>
            <p className={styles.description}>
              Your trusted source for breaking news, analysis, and in-depth coverage
              of events shaping India and the world. Stay informed, stay ahead.
            </p>
            <div className={styles.contact}>
              <a href={`mailto:${contactInfo.email}`} className={styles.contactItem}>
                <FaEnvelope className={styles.contactIcon} />
                <span>{contactInfo.email}</span>
              </a>
              {contactInfo.phones.map((phone, index) => (
                <a
                  key={index}
                  href={`tel:${phone.number.replace(/\s+/g, '')}`}
                  className={styles.contactItem}
                >
                  <FaPhone className={styles.contactIcon} />
                  <span>{phone.number} <small>({phone.label})</small></span>
                </a>
              ))}
              <div className={styles.contactItem}>
                <FaMapMarkerAlt className={styles.contactIcon} />
                <span>{contactInfo.office}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Quick Links</h3>
            <ul className={styles.linkList}>
              {footerLinks.quickLinks.map((link, index) => (
                <li key={index} className={styles.linkItem}>
                  <FaChevronRight className={styles.chevron} />
                  <Link href={link.href} className={styles.link}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Categories</h3>
            <ul className={styles.linkList}>
              {footerLinks.categories.map((link, index) => (
                <li key={index} className={styles.linkItem}>
                  <FaChevronRight className={styles.chevron} />
                  <Link href={link.href} className={styles.link}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Resources</h3>
            <ul className={styles.linkList}>
              {footerLinks.resources.map((link, index) => (
                <li key={index} className={styles.linkItem}>
                  <FaChevronRight className={styles.chevron} />
                  <Link href={link.href} className={styles.link}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.socialSection}>
          <h3 className={styles.socialTitle}>Follow Us</h3>
          <div className={styles.socialLinks}>
            {socialLinks.map((social, index) => {
              const Icon = social.icon
              return (
                <a
                  key={index}
                  href={social.href}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  data-platform={social.platform}
                >
                  <Icon />
                </a>
              )
            })}
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              © {year} Prime Time Research Media Pvt. Ltd. All rights reserved.
            </p>
            <div className={styles.legalLinks}>
              <Link href="/privacy" className={styles.legalLink}>Privacy Policy</Link>
              <span className={styles.separator}>•</span>
              <Link href="/terms" className={styles.legalLink}>Terms of Service</Link>
              <span className={styles.separator}>•</span>
              <Link href="/cookies" className={styles.legalLink}>Cookie Policy</Link>
              <span className={styles.separator}>•</span>
              <Link href="/disclaimer" className={styles.legalLink}>Disclaimer</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer