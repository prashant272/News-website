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
        
        // Use a small timeout to ensure layout has finished
        const timer = setTimeout(() => {
            if (pushed.current) return;
            
            try {
                const adsbygoogle = (window as any).adsbygoogle;
                // Check if container actually has width to prevent TagError
                const currentWidth = adRef.current?.parentElement?.offsetWidth || 0;
                
                if (adsbygoogle && currentWidth > 0) {
                    adsbygoogle.push({});
                    pushed.current = true;
                }
            } catch (e) {
                // Console error prevention — fine in dev/streaming
            }
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={className} style={{ width: '100%', minWidth: '100%', textAlign: 'center', overflow: 'hidden', ...style }}>
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
