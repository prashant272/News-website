import { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    category: string;
    subCategory: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { category, subCategory } = await params;
  const siteUrl = "https://www.timemedia.in";
  
  const decodeAndTitle = (str: string) => 
    decodeURIComponent(str)
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const categoryTitle = decodeAndTitle(category);
  const subCategoryTitle = decodeAndTitle(subCategory);

  const title = `${subCategoryTitle} News - ${categoryTitle} | Time Media News`;
  const description = `Read the latest ${subCategoryTitle} news and updates in the ${categoryTitle} section. Stay informed with Time Media News.`;
  const url = `${siteUrl}/Pages/${category}/${subCategory}`;

  return {
    title,
    description,
    keywords: [
      subCategoryTitle,
      categoryTitle,
      `${subCategoryTitle} ${categoryTitle}`,
      "latest updates",
      "Time Media News"
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Time Media News',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function SubCategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
