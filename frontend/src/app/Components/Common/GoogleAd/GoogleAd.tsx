"use client";
import { useEffect, useRef, useState } from 'react';

interface GoogleAdProps {
    slot?: string;
    format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'fluid';
    responsive?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

const GoogleAd: React.FC<GoogleAdProps> = ({ 
    slot = "5006567326", 
    format = "auto", 
    responsive = true, 
    style, 
    className 
}) => {
    const adRef = useRef<HTMLModElement>(null);
    const [isVisible, setIsVisible] = useState(true);
    const pushed = useRef(false);

    useEffect(() => {
        if (pushed.current || !adRef.current) return;

        const checkAdStatus = () => {
            const ins = adRef.current;
            if (!ins) return;

            // MutationObserver to detect status change (filled/unfilled)
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-ad-status') {
                        const status = ins.getAttribute('data-ad-status');
                        if (status === 'unfilled') {
                            setIsVisible(false);
                            console.log(`Ad slot ${slot} was unfilled, collapsing container.`);
                        }
                    }
                });
            });

            observer.observe(ins, { attributes: true });

            // Push common AdSense logic
            try {
                const adsbygoogle = (window as any).adsbygoogle;
                if (adsbygoogle) {
                    adsbygoogle.push({});
                    pushed.current = true;
                }
            } catch (e) {
                console.error("AdSense push error:", e);
                // On error, we don't necessarily hide, let the status check handle it
            }

            // Fallback: If height is still 0 after a long time (e.g. 5s), hide it
            const timeout = setTimeout(() => {
                if (ins.offsetHeight === 0 && ins.getAttribute('data-ad-status') !== 'filled') {
                    setIsVisible(false);
                }
            }, 5000);

            return () => {
                observer.disconnect();
                clearTimeout(timeout);
            };
        };

        const timer = setTimeout(checkAdStatus, 500);
        return () => clearTimeout(timer);
    }, [slot]);

    if (!isVisible) return null;

    return (
        <div 
            className={className} 
            style={{ 
                width: '100%', 
                textAlign: 'center', 
                overflow: 'hidden', 
                margin: '20px 0',
                ...style 
            }}
        >
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block', minWidth: '100%' }}
                data-ad-client="ca-pub-5571209076881303"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
            />
        </div>
    );
};

export default GoogleAd;
