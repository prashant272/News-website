import { Metadata } from 'next';
import CategoryPageClient from './CategoryPageClient';
import { getEnglishCategory, getHindiCategory } from '@/Utils/categoryMapping';
import { headers } from 'next/headers';

interface PageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const sParams = await searchParams;
  const headerList = await headers();
  const host = headerList.get("host") || "";
  
  const isHindi = sParams.lang === 'hi' || host.startsWith('hindi.') || host.includes('.hindi.');
  const lang = isHindi ? 'hi' : 'en';

  const decodedCategory = decodeURIComponent(category || '');
  const urlCategory = getEnglishCategory(decodedCategory).toLowerCase();
  
  // Get Hindi or English title
  let displayTitle = '';
  const siteName = isHindi ? "प्राइम टाइम न्यूज़" : "Prime Time News";

  if (isHindi) {
    displayTitle = getHindiCategory(urlCategory);
  } else {
    displayTitle = urlCategory
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const categoryLabel = lang === 'hi' ? 'समाचार' : 'News';
  const pageTitle = `${displayTitle} ${categoryLabel}`;
  const fullTitle = `${pageTitle} | ${siteName}`;

  const description = lang === 'hi' 
    ? `ताज़ा ${displayTitle} समाचार, ब्रेकिंग न्यूज़, ट्रेंडिंग टॉपिक्स और ${siteName} पर गहन विश्लेषण।`
    : `Stay updated with the latest ${displayTitle} news, breaking stories, trending topics, and in-depth analysis on ${siteName}.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.primetimemedia.in";
  const imageUrl = `${siteUrl}/logo.png`;

  return {
    metadataBase: new URL(siteUrl),
    title: pageTitle, // Layout template will append "| Site Name"
    description: description,
    openGraph: {
      title: fullTitle,
      description: description,
      url: `${siteUrl}${lang === 'hi' ? '/news' : '/Pages'}/${category}`,
      siteName: siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: siteName,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description,
      images: [imageUrl],
    },
  };
}

export default function CategoryPage() {
  return <CategoryPageClient />;
}
