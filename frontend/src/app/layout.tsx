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
  title: "Prime Time News - Latest Breaking News & Updates",
  description: "Your trusted source for breaking news, analysis, and in-depth coverage of events shaping India and the world.",
  keywords: [
    "Prime Time News",
    "Breaking News India",
    "Latest News Updates",
    "World News Coverage",
    "Politics News India",
    "Sports News Headlines",
    "Entertainment News Today",
    "Technology Trends",
    "Lifestyle and Health News",
    "Prime Time Media"
  ],
  authors: [{ name: "Prime Time News Team" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Prime Time News - Latest Breaking News & Updates",
    description: "Your trusted source for breaking news, analysis, and in-depth coverage of events shaping India and the world.",
    url: "https://www.primetimemedia.in/",
    siteName: "Prime Time News",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Prime Time News",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prime Time News - Latest Breaking News & Updates",
    description: "Your trusted source for breaking news, analysis, and in-depth coverage of events shaping India and the world.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
