import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import Navbar from "./Components/Common/Navbar/Navbar";
import Footer from "./Components/Common/Footer/Footer";
import WhatsAppButton from "./Components/Common/WhatsAppButton/WhatsAppButton";
import { NewsProvider } from "./context/NewsContext";
import { UserProvider } from "./Dashboard/Context/ManageUserContext";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "./context/ThemeContext";

import ConditionalLayout from "./Components/Common/ConditionalLayout";
import Script from "next/script";
import AwardsPopup from "./Components/Common/AwardsPopup/AwardsPopup";
import GoogleAd from "./Components/Common/GoogleAd/GoogleAd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoHindi = Noto_Sans_Devanagari({
  variable: "--font-hindi",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.primetimemedia.in"),
  title: {
    default: "Prime Time | Asia Leading Media House",
    template: "%s | Prime Time News",
  },
  description: "Prime Time News — Asia Leading Media House for breaking news, politics, sports, entertainment, technology, business and world news. Get live updates 24/7.",
  keywords: [
    "Asia Leading Media House",
    "Prime Time News",
    "प्राइम टाइम न्यूज़",
    "Asia Breaking News",
    "Prime Time Media Asia",
    "Latest India News",
    "Asia News Portal",
    "Hindi news Asia",
    "Breaking news Asia",
    "India news Asia",
    "Politics news Asia",
    "Cricket news Asia",
    "Entertainment news Bollywood Asia",
    "Asia business news today",
    "Stock market news Asia",
    "Prime Time Asia News Portal",
    "Hindi English News Asia",
    "primetimemedia.in",
    "Global News",
    "International Media House Asia",
    "Leading Asia News Network",
    "Worldwide Breaking News"
  ],
  authors: [{ name: "Prime Time News Editorial Team" }],
  publisher: "Prime Time News",
  category: "news",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Prime Time | Asia Leading Media House",
    description: "Asia Leading Media House for breaking news, politics, sports, and world events. Get the most accurate and fastest live updates.",
    url: "https://www.primetimemedia.in/",
    siteName: "Prime Time | Asia Leading Media House",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Prime Time News - Asia Leading Media House",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prime Time News | Asia Leading Media House",
    description: "Asia Leading Media House for breaking news, politics, sports, and world events. Get the most accurate and fastest live updates.",
    images: ["/og-image.jpg"],
    site: "@PrimeTimeNews",
  },
  alternates: {
    canonical: "https://www.primetimemedia.in",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.primetimemedia.in/#website",
        "url": "https://www.primetimemedia.in",
        "name": "Prime Time | Asia Leading Media House",
        "alternateName": ["Prime Time News", "Prime Time Research Media Pvt Ltd", "Prime Time Media", "primetimemedia.in"],
        "description": "Asia Leading Media House for breaking news, politics, sports, entertainment, technology, business and world news.",
        "publisher": {
          "@id": "https://www.primetimemedia.in/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://www.primetimemedia.in/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        },
        "inLanguage": "en-IN"
      },
      {
        "@type": "NewsMediaOrganization",
        "@id": "https://www.primetimemedia.in/#organization",
        "name": "Prime Time | Asia Leading Media House",
        "alternateName": ["Prime Time News", "Prime Time Research Media Pvt Ltd", "Prime Time Media"],
        "url": "https://www.primetimemedia.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.primetimemedia.in/favicon.ico",
          "width": 192,
          "height": 192
        },
        "sameAs": [
          "https://www.facebook.com/primetimemedia",
          "https://twitter.com/PrimeTimeNews"
        ],
        "description": "Prime Time | Asia Leading Media House — Delivering fastest breaking news across politics, sports, entertainment, business, and technology. Stay informed with 24/7 live updates.",
        "foundingDate": "2020",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "C-31, Nawada Housing Complex",
          "addressLocality": "New Delhi",
          "postalCode": "110059",
          "addressCountry": "IN"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "editorial",
          "email": "editor@primetimemedia.in",
          "url": "https://www.primetimemedia.in/Contact"
        }
      },
      {
        "@type": "Organization",
        "name": "Prime Time | Asia Leading Media House",
        "alternateName": ["Prime Time Research Media Pvt Ltd", "Prime Time News ", "Prime Time Media","Asia leading media house"],
        "url": "https://www.primetimemedia.in",
        "logo": "https://www.primetimemedia.in/favicon.ico",
        "description": "Prime Time | Asia's leading media house delivering 24/7 breaking news, in-depth analysis, and latest updates across politics, sports, entertainment, and world events.",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-9810882769",
          "contactType": ""
        },
        "sameAs": [
          "https://www.facebook.com/PrimeTimeResearchMedia",
          "https://www.linkedin.com/company/prime-time-research-media-pvt-ltd"
        ]
      },
      {
        "@type": "WebPage",
        "@id": "https://www.primetimemedia.in/#webpage",
        "url": "https://www.primetimemedia.in",
        "name": "Prime Time | Asia Leading Media House",
        "isPartOf": {
          "@id": "https://www.primetimemedia.in/#website"
        },
        "description": "Prime Time News — Asia Leading Media House for breaking news, politics, sports, entertainment, technology, business and world news. Get live updates 24/7.",
        "breadcrumb": {
          "@id": "https://www.primetimemedia.in/#breadcrumb"
        },
        "inLanguage": "en-IN",
        "potentialAction": [
          {
            "@type": "ReadAction",
            "target": [
              "https://www.primetimemedia.in"
            ]
          }
        ]
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5571209076881303" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${notoHindi.variable} antialiased`}>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5571209076881303"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider>
          <NewsProvider>
            <UserProvider>
              <ToastContainer />
              <AwardsPopup />
              <ConditionalLayout>
                <main>
                  {children}
                </main>
              </ConditionalLayout>
            </UserProvider>
          </NewsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
