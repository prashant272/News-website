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
    const retryCount = useRef(0);
    const maxRetries = 10;

    useEffect(() => {
        if (pushed.current || !adRef.current) return;

        const attemptAdPush = () => {
            const ins = adRef.current;
            if (!ins) return;

            // CRITICAL: Only push if width > 0 to avoid AdSense TagError
            const currentWidth = ins.parentElement?.offsetWidth || 0;

            if (currentWidth > 0) {
                try {
                    const adsbygoogle = (window as any).adsbygoogle;
                    if (adsbygoogle) {
                        adsbygoogle.push({});
                        pushed.current = true;
                        
                        // Start observer for fulfillment check
                        const observer = new MutationObserver((mutations) => {
                            mutations.forEach((mutation) => {
                                if (mutation.attributeName === 'data-ad-status') {
                                    const status = ins.getAttribute('data-ad-status');
                                    if (status === 'unfilled') {
                                        setIsVisible(false);
                                    }
                                }
                            });
                        });
                        observer.observe(ins, { attributes: true });
                        return true; // Success
                    }
                } catch (e) {
                    // Silently handle push errors
                    return false;
                }
            } else if (retryCount.current < maxRetries) {
                // If width is 0, layout might not be ready. Retry.
                retryCount.current += 1;
                setTimeout(attemptAdPush, 800);
            } else {
                // If we still have no width after max retries, collapse to avoid empty space
                setIsVisible(false);
            }
            return false;
        };

        // Initial delay to let the page settle
        const timer = setTimeout(attemptAdPush, 1000);
        
        // Final fallback: If height is still 0 after 6s and not marked as filled, hide it
        const fallbackTimer = setTimeout(() => {
            if (adRef.current && adRef.current.offsetHeight === 0 && adRef.current.getAttribute('data-ad-status') !== 'filled') {
                setIsVisible(false);
            }
        }, 6000);

        return () => {
            clearTimeout(timer);
            clearTimeout(fallbackTimer);
        };
    }, [slot]);

    if (!isVisible) return null;

    return (
        <div 
            className={className} 
            style={{ 
                width: '100%', 
                textAlign: 'center', 
                overflow: 'hidden', 
                margin: isVisible ? '20px 0' : '0', // No margin if hidden
                display: isVisible ? 'block' : 'none',
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
