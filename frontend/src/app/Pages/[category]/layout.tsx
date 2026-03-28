import { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { category } = await params;
  const siteUrl = "https://www.primetimemedia.in";
  
  const categoryTitle = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const title = `${categoryTitle} News - Latest ${categoryTitle} Headlines Today`;
  const description = `Get the latest ${categoryTitle} news, breaking stories, in-depth analysis and trending updates from India and around the world on Prime Time News.`;
  const url = `${siteUrl}/Pages/${category}`;

  return {
    title,
    description,
    keywords: [
      categoryTitle,
      `Latest ${categoryTitle} news`,
      `${categoryTitle} headlines`,
      `${categoryTitle} updates`,
      "Prime Time News",
      "प्राइम टाइम न्यूज़"
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Prime Time News',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
