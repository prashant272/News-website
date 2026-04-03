const { addLogoToImage, brandImageWithTitle } = require("../Services/imageService");
const sharp = require("sharp");

/**
 * Handles image branding request.
 * Receives an image (file or base64), adds logo at top-left OR full branding with title.
 */
exports.brandImage = async (req, res) => {
    try {
        if (!req.file && !req.body.image) {
            return res.status(400).json({ success: false, msg: "Image is required" });
        }

        let buffer;
        if (req.file) {
            buffer = req.file.buffer;
        } else {
            // Handle base64 — must be a string
            if (typeof req.body.image !== 'string') {
                return res.status(400).json({ success: false, msg: "Image must be a base64 string or URL" });
            }
            const raw = req.body.image;
            if (raw.startsWith('http')) {
                // If it's a URL, pass directly to service (service handles URL fetching)
                buffer = raw;
            } else {
                const base64Data = raw.replace(/^data:image\/\w+;base64,/, "");
                buffer = Buffer.from(base64Data, "base64");
                if (buffer.length === 0) {
                    return res.status(400).json({ success: false, msg: "Invalid or empty image data" });
                }
            }
        }

        // Determine branding type based on whether a title is provided
        const { title } = req.body;
        let brandedBuffer;

        if (title) {
            console.log(`[Branding-API] Applying full title-based branding for preview: ${title}`);
            brandedBuffer = await brandImageWithTitle(buffer, title);
        } else {
            console.log("[Branding-API] Applying standalone logo branding");
            brandedBuffer = await addLogoToImage(buffer);
        }

        if (!brandedBuffer) {
            throw new Error("Branding failed to generate buffer");
        }

        // Return as image/png
        res.setHeader("Content-Type", "image/png");
        res.send(brandedBuffer);
    } catch (error) {
        console.error("[Controller] Image Branding Error:", error);
        res.status(500).json({ success: false, msg: "Internal Server Error during branding" });
    }
};
