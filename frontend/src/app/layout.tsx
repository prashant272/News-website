import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora, Noto_Sans_Devanagari, Poppins } from "next/font/google";
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

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "devanagari"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const notoHindi = Noto_Sans_Devanagari({
  variable: "--font-hindi",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "800", "900"],
});


import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("host") || "";
  const isHindi = host.startsWith('hindi.') || host.includes('.hindi.');
  
  const siteName = isHindi ? "प्राइम टाइम" : "Time Media";
  const defaultTitle = isHindi 
    ? "प्राइम टाइम | होम - एशिया का अग्रणी डिजिटल मीडिया हाउस" 
    : "Time Media | Asia Leading Media House";

  return {
    metadataBase: new URL("https://www.timemedia.in"),
    title: {
      default: defaultTitle,
      template: `%s | ${siteName}`,
    },
    description: isHindi 
      ? "प्राइम टाइम - राजनीति, खेल, मनोरंजन, व्यापार और विश्व समाचारों के लिए एशिया का अग्रणी डिजिटल मीडिया हाउस।"
      : "Time Media — Asia Leading Media House for breaking news, politics, sports, entertainment, technology, business and world news. Get live updates 24/7.",
    keywords: [
      "Asia Leading Media House",
      "Time Media",
      "प्राइम टाइम",
      "Asia Breaking News",
    "Time Media Asia",
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
    "Time Media Asia News Portal",
    "Hindi English News Asia",
      "timemedia.in",
    "Global News",
    "International Media House Asia",
    "Leading Asia News Network",
    "Worldwide Breaking News"
    ],
    authors: [{ name: "Time Media Editorial Team" }],
  publisher: "Time Media",
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
      title: defaultTitle,
      description: isHindi 
        ? "एशिया का अग्रणी मीडिया हाउस - ताज़ा खबरों के लिए।"
        : "Asia Leading Media House for breaking news, politics, sports, and world events.",
      url: "https://www.timemedia.in/",
      siteName: siteName,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
      locale: isHindi ? "hi_IN" : "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: isHindi 
        ? "एशिया का अग्रणी मीडिया हाउस - ताज़ा खबरों के लिए।"
        : "Asia Leading Media House for breaking news, politics, sports, and world events.",
      images: ["/og-image.jpg"],
      site: "@TimeMediaNews",
    },
    alternates: {
      canonical: "https://www.timemedia.in",
    },
  };
}

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
        "@id": "https://www.timemedia.in/#website",
        "url": "https://www.timemedia.in",
        "name": "Time Media | Asia Leading Media House",
        "alternateName": ["Time Media", "Time Media Research Media Pvt Ltd", "Time Media", "timemedia.in"],
        "description": "Asia Leading Media House for breaking news, politics, sports, entertainment, technology, business and world news.",
        "publisher": {
          "@id": "https://www.timemedia.in/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://www.timemedia.in/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        },
        "inLanguage": "en-IN"
      },
      {
        "@type": "NewsMediaOrganization",
        "@id": "https://www.timemedia.in/#organization",
        "name": "Time Media | Asia Leading Media House",
        "alternateName": ["Time Media", "Time Media Research Media Pvt Ltd", "Time Media"],
        "url": "https://www.timemedia.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.timemedia.in/favicon.ico",
          "width": 192,
          "height": 192
        },
        "sameAs": [
          "https://www.facebook.com/timemedia",
          "https://twitter.com/TimeMediaNews"
        ],
        "description": "Time Media | Asia Leading Media House — Delivering fastest breaking news across politics, sports, entertainment, business, and technology. Stay informed with 24/7 live updates.",
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
          "email": "editor@timemedia.in",
          "url": "https://www.timemedia.in/Contact"
        }
      },
      {
        "@type": "Organization",
        "name": "Time Media | Asia Leading Media House",
        "alternateName": ["Time Media Research Media Pvt Ltd", "Time Media ", "Time Media","Asia leading media house"],
        "url": "https://www.timemedia.in",
        "logo": "https://www.timemedia.in/favicon.ico",
        "description": "Time Media | Asia's leading media house delivering 24/7 breaking news, in-depth analysis, and latest updates across politics, sports, entertainment, and world events.",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-9810882769",
          "contactType": ""
        },
        "sameAs": [
          "https://www.facebook.com/TimeMediaResearchMedia",
          "https://www.linkedin.com/company/prime-time-research-media-pvt-ltd"
        ]
      },
      {
        "@type": "WebPage",
        "@id": "https://www.timemedia.in/#webpage",
        "url": "https://www.timemedia.in",
        "name": "Time Media | Asia Leading Media House",
        "isPartOf": {
          "@id": "https://www.timemedia.in/#website"
        },
        "description": "Time Media — Asia Leading Media House for breaking news, politics, sports, entertainment, technology, business and world news. Get live updates 24/7.",
        "breadcrumb": {
          "@id": "https://www.timemedia.in/#breadcrumb"
        },
        "inLanguage": "en-IN",
        "potentialAction": [
          {
            "@type": "ReadAction",
            "target": [
              "https://www.timemedia.in"
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
      <body className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${notoHindi.variable} ${poppins.variable} antialiased`}>
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
