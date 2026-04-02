import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { headers } from "next/headers";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const sParams = await searchParams;
  const headerList = await headers();
  const host = headerList.get("host") || "";
  
  const isHindi = sParams.lang === 'hi' || host.startsWith('hindi.') || host.includes('.hindi.');
  
  const siteName = isHindi ? "प्राइम टाइम न्यूज़" : "Prime Time News";
  const title = isHindi 
    ? "प्राइम टाइम न्यूज़ | होम - एशिया का अग्रणी डिजिटल मीडिया हाउस" 
    : "Prime Time | Asia Leading Media House - Breaking News, Politics, Sports";
  
  const description = isHindi 
    ? "प्राइम टाइम न्यूज़ - राजनीति, खेल, मनोरंजन, व्यापार और विश्व समाचारों के लिए एशिया का अग्रणी डिजिटल मीडिया हाउस। 24/7 लाइव अपडेट प्राप्त करें।"
    : "Prime Time News - Asia's leading digital media house for breaking news, politics, sports, entertainment, business and world events. Get live updates 24/7.";

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: "https://www.primetimemedia.in/",
      siteName: siteName,
      locale: isHindi ? 'hi_IN' : 'en_IN',
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
    },
  };
}

export default function Home() {
  return <HomeClient />;
}
