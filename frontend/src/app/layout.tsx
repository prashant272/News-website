import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.primetimemedia.in"),
  title: {
    default: "Prime Time News - Latest Breaking News & Updates",
    template: "%s | Prime Time News",
  },
  description: "Prime Time News — India's trusted source for breaking news, politics, sports, entertainment, technology, business and world news. Get live updates 24/7.",
  keywords: [
    "Prime Time News",
    "प्राइम टाइम न्यूज़",
    "Breaking News India",
    "Latest News Today",
    "India News Live",
    "Hindi News",
    "Indian News Portal",
    "News Headlines India",
    "Politics News India",
    "Modi News Today",
    "Parliament News",
    "Sports News India",
    "IPL Cricket News",
    "Entertainment News Bollywood",
    "Business News India",
    "Stock Market Updates",
    "Technology News India",
    "Health News",
    "Science News",
    "International News",
    "World News Today",
    "State News India",
    "Education News",
    "Prime Time Media News",
    "primetimemedia.in",
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
    title: "Prime Time News - Latest Breaking News & Updates",
    description: "India's trusted news portal for live breaking news, politics, sports, business, entertainment and more.",
    url: "https://www.primetimemedia.in/",
    siteName: "Prime Time News",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Prime Time News - India's Leading News Portal",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prime Time News - Latest Breaking News & Updates",
    description: "India's trusted news portal for live breaking news, politics, sports, business, entertainment and more.",
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
        "name": "Prime Time News",
        "description": "India's trusted source for breaking news, politics, sports, entertainment, technology, business and world news.",
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
        "name": "Prime Time News",
        "alternateName": "Prime Time Media",
        "url": "https://www.primetimemedia.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.primetimemedia.in/primetimelogo.gif",
          "width": 192,
          "height": 192
        },
        "sameAs": [
          "https://www.facebook.com/primetimemedia",
          "https://twitter.com/PrimeTimeNews"
        ],
        "description": "India's trusted source for breaking news, politics, sports, entertainment, technology, business and world news.",
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
        "@type": "WebPage",
        "@id": "https://www.primetimemedia.in/#webpage",
        "url": "https://www.primetimemedia.in",
        "name": "Prime Time News - Latest Breaking News & Updates",
        "isPartOf": {
          "@id": "https://www.primetimemedia.in/#website"
        },
        "description": "Prime Time News — India's trusted source for breaking news, politics, sports, entertainment, technology, business and world news. Get live updates 24/7.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5571209076881303"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <ThemeProvider>
          <NewsProvider>
            <UserProvider>
              <ToastContainer />
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
