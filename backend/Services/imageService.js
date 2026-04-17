const sharp = require('sharp');
const axios = require('axios');
const path = require('path');

const hasHindiCharacters = (text) => {
    if (!text) return false;
    return /[\u0900-\u097F]/.test(text);
};


/**
 * Helper to resolve a Buffer from a URL, Base64 string, or Buffer.
 */
const getImageBuffer = async (input) => {
    if (Buffer.isBuffer(input)) return input;
    if (typeof input !== 'string') throw new Error("Invalid image input type");

    if (input.startsWith('http')) {
        let domain = "https://www.google.com/";
        try {
            const urlObj = new URL(input);
            domain = `${urlObj.protocol}//${urlObj.hostname}/`;
        } catch (e) {}

        const config = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
                'Referer': domain,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'image',
                'Sec-Fetch-Mode': 'no-cors',
                'Sec-Fetch-Site': 'cross-site'
            },
            responseType: 'arraybuffer',
            timeout: 15000 // Increased timeout for slow news servers
        };
        const response = await axios.get(input, config);
        return Buffer.from(response.data);
    }


    if (input.startsWith('data:image')) {
        const base64Data = input.split(',')[1] || input;
        return Buffer.from(base64Data, 'base64');
    }

    // Assume raw base64 if no prefix but looks like it
    return Buffer.from(input, 'base64');
};

const applyWatermark = async (imageUrl, source = "") => {
    try {
        const src = (source || "").toLowerCase();
        console.log(`[Anti-Copyright] Transforming image for ${src}`);

        const inputBuffer = await getImageBuffer(imageUrl);
        const logoPath = path.join(__dirname, '..', 'Assets', 'logo1.jpeg');

        const imageMetadata = await sharp(inputBuffer).metadata();
        const { width, height } = imageMetadata;

        // 1. CREATE TRANSFORMATIVE BACKGROUND (Blurred & Slightly Darkened)
        const background = await sharp(inputBuffer)
            .resize(width, height)
            .blur(20) // Heavy blur for background
            .modulate({ brightness: 0.7 }) // Slightly darken to make foreground pop
            .toBuffer();

        // 2. CREATE SHARP FOREGROUND (Main Content)
        // We shrink the image slightly to create a frame effect
        const foreground = await sharp(inputBuffer)
            .resize({ width: Math.round(width * 0.95), height: Math.round(height * 0.90), fit: 'contain' })
            .toBuffer();

        // 3. BRANDING ELEMENTS
        const logoBuffer = await sharp(logoPath)
            .resize({ width: Math.round(width * 0.18) })
            .toBuffer();

        // Create a Newsroom-style "BREAKING NEWS" strip if needed
        const headerStrip = await sharp({
            create: {
                width: width,
                height: Math.round(height * 0.05),
                channels: 4,
                background: { r: 180, g: 0, b: 0, alpha: 0.8 } // News Red
            }
        }).png().toBuffer();

        // 4. FINAL COMPOSITE (Transformative Layout)
        const logoSize = Math.min(Math.round(width * 0.15), 180);
        const resizedLogo = await sharp(logoPath)
            .resize({ width: logoSize, height: logoSize, fit: 'contain' })
            .toBuffer();

        const transformedBuffer = await sharp(background)
            .composite([
                { input: foreground, gravity: 'center' }, // Main image centered over blur
                { input: headerStrip, gravity: 'north' }, // Red top strip
                { input: resizedLogo, top: 15, left: 20 }  // Logo at Top-Left
            ])
            .modulate({ saturation: 1.1 }) // Subtle color boost to change signature
            .toBuffer();

        return transformedBuffer;
    } catch (err) {
        console.error(`[Anti-Copyright] ❌ Error: ${err.message}`);
        return null;
    }
};

/**
 * Adds the Prime Time logo with a white background to the TOP-LEFT of an image.
 * Provides a clean branded look for standalone images.
 */
const addLogoToImage = async (imageBuffer) => {
    try {
        const logoPath = path.join(__dirname, '..', 'Assets', 'logo1.jpeg');
        const metadata = await sharp(imageBuffer).metadata();
        const { width, height } = metadata;

        // 1. ADVANCED COLOR GRADING (HD Look)
        const gradedImage = await sharp(imageBuffer)
            .modulate({ brightness: 1.05, saturation: 1.3, lightness: 0 })
            .linear(1.1, -15) // Boost contrast
            .toBuffer();

        // 2. BLURRED BACKGROUND (Cinematic Deep Blur)
        const background = await sharp(gradedImage)
            .resize(width, height)
            .blur(30)
            .modulate({ brightness: 0.55 }) // Darker to make foreground pop
            .toBuffer();

        // 3. SHARP FOREGROUND WITH SILVER FRAME
        const fgW = Math.round(width * 0.94);
        const fgH = Math.round(height * 0.88);

        // Transparent border logic
        const foreground = await sharp(gradedImage)
            .resize({ width: fgW, height: fgH, fit: 'contain' })
            .extend({
                top: 2, bottom: 2, left: 2, right: 2,
                background: { r: 255, g: 255, b: 255, alpha: 0.3 } // Silver/Glass border
            })
            .toBuffer();

        // 4. PREMIUM RED GRADIENT HEADER (SVG)
        const stripH = Math.round(height * 0.065);
        const redGradient = Buffer.from(`
            <svg width="${width}" height="${stripH}">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#b9000a;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ff2e3a;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="${width}" height="${stripH}" fill="url(#grad1)" />
                <text x="${width - 20}" y="${stripH / 2 + 6}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="end">PRIME TIME</text>
            </svg>
        `);

        // 5. LOGO WITH SUBTLE GLOW (No White Box)
        const logoSize = Math.min(Math.round(width * 0.20), 320);

        // Add a subtle dark glow behind logo to ensure visibility on light areas
        const glow = Buffer.from(`
            <svg width="${logoSize + 40}" height="${logoSize + 40}">
                <defs>
                    <filter id="f1" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="15" />
                        <feOffset dx="0" dy="0" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.6" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic6" />
                        </feMerge>
                    </filter>
                </defs>
                <circle cx="${(logoSize + 40) / 2}" cy="${(logoSize + 40) / 2}" r="${logoSize / 2}" fill="black" filter="url(#f1)" opacity="0.3" />
            </svg>
        `);

        const resizedLogo = await sharp(logoPath)
            .resize({ width: logoSize, height: logoSize, fit: 'contain' })
            .toBuffer();

        // 6. FINAL COMPOSITE (MASTERPIECE EDIT)
        const outputBuffer = await sharp(background)
            .composite([
                { input: foreground, gravity: 'center' }, // Glass-framed image
                { input: redGradient, gravity: 'north' }, // Gradient header
                { input: glow, top: 0, left: 10 }, // Subtle logo shadow
                { input: resizedLogo, top: 20, left: 30 } // Logo itself
            ])
            .toBuffer();

        return outputBuffer;
    } catch (err) {
        console.error(`[HD-Master-Edit] ❌ Error: ${err.message}`);
        throw err;
    }
};

/**
 * Full Newsroom Branding with Title Overlay
 * Used for social media posts (Facebook, etc.)
 */
const brandImageWithTitle = async (imageUrl, title, options = { addLogo: true, category: null }) => {
    try {
        const addLogo = options?.addLogo !== false;
        const category = options?.category;

        // SKIP BRANDING for specific categories (Awards, Events, etc.)
        const categoriesToSkip = ["awards", "events", "event"];
        const normalizedCats = Array.isArray(category) 
            ? category.map(c => String(c).toLowerCase()) 
            : [String(category).toLowerCase()];
        
        const isExcluded = normalizedCats.some(c => categoriesToSkip.includes(c));
        const titleLower = (title || "").toLowerCase();
        const titleExcludes = categoriesToSkip.some(kw => titleLower.includes(kw));

        if (isExcluded || titleExcludes) {
            console.log(`[Branding-Skip] Exclusion rule triggered (Cat: ${category}, Title: ${title}). Returning original image.`);
            return await getImageBuffer(imageUrl);
        }

        console.log(`[Branding-Final] Mastering professional white-card for: ${title}`);
        
        // 1. Resolve image buffer (supports URL or Base64/Local)
        const imageBuffer = await getImageBuffer(imageUrl);
        const logoPath = path.join(__dirname, '..', 'Assets', 'logo1.jpeg');

        const metadata = await sharp(imageBuffer).metadata();
        let { width, height } = metadata;

        // Safety fallback if metadata is missing (prevents NaN/crash errors)
        if (!width || !height) {
            console.warn('[Branding-Final] ⚠️ Could not determine image dimensions. Using 1080x1080 fallback.');
            width = 1080;
            height = 1080;
        }

        // 2. HD IMAGE GRADING (Image Section Only)
        const gradedImage = await sharp(imageBuffer)
            .resize(width, height)
            .modulate({ brightness: 1.05, saturation: 1.25 })
            .linear(1.05, -5)
            .toBuffer();

        // 3. GENERATE THE TEXT SECTION (SVG) with Smart Headline Wrap
        const escapeXML = (str) => str.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);

        const safeTitle = escapeXML(title.trim());
        const isHindi = hasHindiCharacters(title);
        const words = safeTitle.split(' ');
        
        let splitIdx = isHindi ? 4 : 3; 
        if (words.length <= splitIdx) splitIdx = Math.max(1, words.length - 1);
        
        const firstPartText = words.slice(0, splitIdx).join(' ');
        const restText = words.slice(splitIdx).join(' ');

        // 1. DYNAMIC FONT SCALING
        let fontSize = 42;
        if (title.length > 60) fontSize = 38;
        if (title.length > 100) fontSize = 34;
        if (title.length > 150) fontSize = 30;

        const lineSpacing = fontSize * 1.35;
        const charWidth = isHindi ? (fontSize * 0.72) : (fontSize * 0.58);
        const maxChars = Math.floor((width * 0.92) / charWidth);

        const wrapLines = (text, limit) => {
            const lines = [];
            let current = "";
            text.split(' ').forEach(w => {
                if ((current + w).length > limit) {
                    lines.push(current.trim());
                    current = w + " ";
                } else {
                    current += w + " ";
                }
            });
            if (current) lines.push(current.trim());
            return lines;
        };

        const firstLines = wrapLines(firstPartText, maxChars);
        const restLines = wrapLines(restText, maxChars);
        const totalLines = firstLines.length + restLines.length;

        // 2. CALCULATE DYNAMIC LAYOUT DIMENSIONS
        const titleStartY = 110;
        const titleEndY = titleStartY + (totalLines * lineSpacing);
        const urlPillY = titleEndY + 30; // 30px gap after title
        const cardH = urlPillY + 90; // Padding after URL pill
        const totalH = Math.round(height + cardH);

        // 3. HD CINEMATIC BACKDROP (Full Bleed)
        const bgBlur = await sharp(imageBuffer)
            .resize(width, totalH, { fit: 'cover' })
            .blur(40)
            .modulate({ brightness: 0.6, saturation: 1.2 })
            .toBuffer();

        // 4. MAIN IMAGE (Glass Frame)
        const frameW = Math.round(width * 0.94);
        const frameH = Math.round(height * 0.92);
        const mainImageFrame = await sharp(gradedImage)
            .resize({ width: frameW, height: frameH, fit: 'cover' })
            .extend({
                top: 4, bottom: 4, left: 4, right: 4,
                background: { r: 255, g: 255, b: 255, alpha: 0.2 } // Silver border
            })
            .toBuffer();

        // 5. EXECUTIVE CRIMSON TEXT SECTION OVERLAY
        const glassOverlay = Buffer.from(`
            <svg width="${width}" height="${cardH}">
                <defs>
                    <linearGradient id="crimson" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#4a0000;stop-opacity:0.95" />
                        <stop offset="100%" style="stop-color:#1a0000;stop-opacity:0.90" />
                    </linearGradient>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
                        <feOffset dx="0" dy="3" />
                        <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
                        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                </defs>
                
                <rect width="${width}" height="${cardH}" fill="url(#crimson)" />
                <rect width="${width}" height="2" fill="rgba(255,255,255,0.1)" />

                <!-- Header Ticker Badge -->
                <rect x="${width / 2 - 120}" y="20" width="240" height="42" rx="21" fill="#CC0000" filter="url(#shadow)" />
                <text x="${width / 2}" y="48" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="20px" fill="white" letter-spacing="1.5px">PRIME TIME</text>

                <!-- Headline (Luxury White & Gold) -->
                <g filter="url(#shadow)">
                    ${firstLines.map((line, i) => {
                        const y = titleStartY + (i * lineSpacing);
                        return `<text x="${width / 2}" y="${y}" text-anchor="middle" font-family="Nirmala UI, Arial, sans-serif" font-size="${fontSize + 2}" font-weight="900" fill="#FFFFFF">${line}</text>`;
                    }).join('')}
                    ${restLines.map((line, i) => {
                        const y = titleStartY + ((i + firstLines.length) * lineSpacing);
                        return `<text x="${width / 2}" y="${y}" text-anchor="middle" font-family="Nirmala UI, Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="#FFD700">${line}</text>`;
                    }).join('')}
                </g>

                <!-- URL Sticker (Gold-to-Orange Pill) - DYNAMIC POSITION -->
                <rect x="${width / 2 - 155}" y="${urlPillY}" width="310" height="46" rx="23" fill="#FFD700" filter="url(#shadow)" />
                <text x="${width / 2}" y="${urlPillY + 31}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="20px" fill="#4d0000" letter-spacing="0.05em">primetimemedia.in</text>
            </svg>
        `);

        // 6. PREMIUM GLASS BADGE FOR LOGO
        const logoSize = Math.min(Math.round(width * 0.18), 300);
        const badgeSize = logoSize + 60;
        
        const logoBadge = Buffer.from(`
            <svg width="${badgeSize}" height="${badgeSize}">
                <defs>
                    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
                        <feOffset dx="0" dy="4" />
                        <feComponentTransfer><feFuncA type="linear" slope="0.4"/></feComponentTransfer>
                        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <linearGradient id="silver" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.4" />
                        <stop offset="100%" style="stop-color:#AAAAAA;stop-opacity:0.2" />
                    </linearGradient>
                </defs>
                <circle cx="${badgeSize / 2}" cy="${badgeSize / 2}" r="${badgeSize / 2 - 10}" fill="rgba(255,255,255,0.2)" filter="url(#badgeShadow)" />
                <circle cx="${badgeSize / 2}" cy="${badgeSize / 2}" r="${badgeSize / 2 - 10}" fill="none" stroke="url(#silver)" stroke-width="2" />
                <circle cx="${badgeSize / 2}" cy="${badgeSize / 2}" r="${badgeSize / 2 - 15}" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.3" />
            </svg>
        `);

        const resizedLogo = await sharp(logoPath)
            .resize({ width: logoSize, height: logoSize, fit: 'contain' })
            .toBuffer();

        // 7. FINAL COMPOSITE
        const finalBuffer = await sharp(bgBlur)
            .composite([
                { input: mainImageFrame, top: 40, left: Math.round((width - frameW - 8) / 2) },
                { input: glassOverlay, top: height, left: 0 },
                { input: logoBadge, top: 20, left: 20 },
                { input: resizedLogo, top: 50, left: 50 }
            ])
            .toBuffer();

        return finalBuffer;
    } catch (err) {
        console.error(`[Branding-Final] ❌ Error: ${err.message}`);
        return null; 
    }
};

module.exports = { applyWatermark, addLogoToImage, brandImageWithTitle };
