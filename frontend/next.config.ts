import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler
  reactCompiler: true,

  // ⚠️ Static export me image optimization server nahi hota
  images: {
    unoptimized: true,

    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "th-i.thgim.com", pathname: "/**" },
      { protocol: "https", hostname: "static.toiimg.com", pathname: "/**" },
      { protocol: "https", hostname: "timesofindia.indiatimes.com", pathname: "/**" },
      { protocol: "https", hostname: "www.thehindu.com", pathname: "/**" },
      { protocol: "https", hostname: "c.ndtvimg.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ndtvimg.com", pathname: "/**" },
      { protocol: "https", hostname: "akm-img-a-in.tosshub.com", pathname: "/**" },
      { protocol: "https", hostname: "images.news18.com", pathname: "/**" },
      { protocol: "https", hostname: "i.gadgets360cdn.com", pathname: "/**" },
      { protocol: "https", hostname: "images.indianexpress.com", pathname: "/**" },
      { protocol: "https", hostname: "img.etimg.com", pathname: "/**" },
      { protocol: "https", hostname: "images.livemint.com", pathname: "/**" },
      { protocol: "https", hostname: "www.livemint.com", pathname: "/**" },
      { protocol: "https", hostname: "images.hindustantimes.com", pathname: "/**" },
      { protocol: "https", hostname: "www.hindustantimes.com", pathname: "/**" },
      { protocol: "https", hostname: "images.firstpost.com", pathname: "/**" },
      { protocol: "https", hostname: "www.bollywoodhungama.com", pathname: "/**" },
      { protocol: "https", hostname: "stat1.bollywoodhungama.in", pathname: "/**" },
      { protocol: "https", hostname: "stat2.bollywoodhungama.in", pathname: "/**" },
      { protocol: "https", hostname: "english.cdn.zeenews.com", pathname: "/**" },
      { protocol: "https", hostname: "zeenews.india.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }
    ],
  },
};

export default nextConfig;