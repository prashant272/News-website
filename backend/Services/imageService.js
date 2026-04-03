const sharp = require('sharp');
const axios = require('axios');
const path = require('path');

/**
 * Helper to resolve a Buffer from a URL, Base64 string, or Buffer.
 */
const getImageBuffer = async (input) => {
    if (Buffer.isBuffer(input)) return input;
    if (typeof input !== 'string') throw new Error("Invalid image input type");

    if (input.startsWith('http')) {
        const response = await axios.get(input, { responseType: 'arraybuffer' });
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
        const logoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'logo1.jpeg');

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
        const logoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'logo1.jpeg');
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
                <text x="${width - 20}" y="${stripH / 2 + 6}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="end">PRIME TIME NEWS</text>
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
                            <feMergeNode in="SourceGraphic" />
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
const brandImageWithTitle = async (imageUrl, title, options = { addLogo: true }) => {
    try {
        const addLogo = options?.addLogo !== false;
        console.log(`[Branding-Final] Mastering professional white-card for: ${title}`);
        
        // 1. Resolve image buffer (supports URL or Base64/Local)
        const imageBuffer = await getImageBuffer(imageUrl);
        const logoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'logo1.jpeg');

        const metadata = await sharp(imageBuffer).metadata();
        const { width, height } = metadata;

        // 2. HD IMAGE GRADING (Image Section Only)
        const gradedImage = await sharp(imageBuffer)
            .resize(width, height)
            .modulate({ brightness: 1.05, saturation: 1.25 })
            .linear(1.05, -5)
            .toBuffer();

        // 3. CANVAS EXTENSION (Adding White Space at Bottom)
        // Add ~45% extra height for the text card area
        const cardH = Math.round(height * 0.48);
        const totalH = height + cardH;

        const whiteCard = await sharp({
            create: {
                width: width,
                height: totalH,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        }).png().toBuffer();

        // 4. GENERATE THE TEXT SECTION (SVG) with Smart Headline Wrap
        const words = title.trim().split(' ');
        const firstPart = words.slice(0, 2).join(' ').toUpperCase();
        const secondPart = words.slice(2).join(' ').toUpperCase();

        const maxChars = Math.floor(width / 14);
        let secLines = [];
        let cur = "";
        secondPart.split(' ').forEach(w => {
            if ((cur + w).length > maxChars) {
                secLines.push(cur.trim());
                cur = w + " ";
            } else {
                cur += w + " ";
            }
        });
        secLines.push(cur.trim());
        secLines = secLines.slice(0, 2);

        const textOverlay = Buffer.from(`
            <svg width="${width}" height="${cardH}">
                <defs>
                    <style>
                        .header { font-family: sans-serif; font-weight: 900; font-size: 20px; fill: white; }
                        .title-red { font-family: 'Arial Black', sans-serif; font-weight: 900; font-size: 38px; fill: #CC0000; }
                        .title-black { font-family: 'Arial Black', sans-serif; font-weight: 900; font-size: 38px; fill: #000000; }
                        .url { font-family: sans-serif; font-weight: bold; font-size: 16px; fill: #666; }
                    </style>
                </defs>

                <!-- 1. LIVE HEADER BADGE (Center) -->
                <rect x="${width / 2 - 100}" y="15" width="200" height="40" rx="8" fill="#CC0000" />
                <text x="${width / 2}" y="43" text-anchor="middle" class="header">PRIME TIME LIVE</text>

                <!-- 2. HEADLINE (ABP/InShorts Style) -->
                <text x="${width / 2}" y="115" text-anchor="middle" class="title-red">${firstPart}</text>
                ${secLines.map((line, i) => `
                    <text x="${width / 2}" y="${175 + (i * 55)}" text-anchor="middle" class="title-black">${line}</text>
                `).join('')}

                <!-- 3. URL FOOTER BADGE -->
                <rect x="${width / 2 - 110}" y="${cardH - 60}" width="220" height="34" rx="17" stroke="#EEE" stroke-width="2" fill="#FBFBFB" />
                <text x="${width / 2}" y="${cardH - 37}" text-anchor="middle" class="url">primetimemedia.in</text>
            </svg>
        `);

        // 5. ASSEMBLE ALL PIECES (Logo ONLY at Top-Left)
        const logoSize = Math.min(Math.round(width * 0.16), 250);
        const resizedLogo = await sharp(logoPath)
            .resize({ width: logoSize, height: logoSize, fit: 'contain' })
            .toBuffer();

        const finalBuffer = await sharp(whiteCard)
            .composite([
                { input: gradedImage, top: 0, left: 0 },
                { input: textOverlay, top: height, left: 0 },
                { input: resizedLogo, top: 20, left: 25 } // Fixed Top-Left Logo
            ])
            .toBuffer();

        return finalBuffer;
    } catch (err) {
        console.error(`[Branding-Final] ❌ Error: ${err.message}`);
        return null; 
    }
};

module.exports = { applyWatermark, addLogoToImage, brandImageWithTitle };
