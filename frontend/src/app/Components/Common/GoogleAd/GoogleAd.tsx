"use client";
import { useEffect, useRef } from 'react';

interface GoogleAdProps {
    style?: React.CSSProperties;
    className?: string;
}

const GoogleAd: React.FC<GoogleAdProps> = ({ style, className }) => {
    const adRef = useRef<HTMLModElement>(null);
    const pushed = useRef(false);

    useEffect(() => {
        if (pushed.current) return;
        try {
            const adsbygoogle = (window as any).adsbygoogle;
            if (adsbygoogle) {
                adsbygoogle.push({});
                pushed.current = true;
            }
        } catch (e) {
            // AdSense not ready yet — fine in dev
        }
    }, []);

    return (
        <div className={className} style={{ minHeight: 100, textAlign: 'center', overflow: 'hidden', ...style }}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-5571209076881303"
                data-ad-slot="5006567326"
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
};

export default GoogleAd;
