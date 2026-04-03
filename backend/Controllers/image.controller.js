const { addLogoToImage } = require("../services/imageService");
const sharp = require("sharp");

/**
 * Handles image branding request.
 * Receives an image (file or base64), adds logo at top-left, and returns the buffer.
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
            // Handle base64
            const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
            buffer = Buffer.from(base64Data, 'base64');
        }

        const brandedBuffer = await addLogoToImage(buffer);
        
        // Return as image/png
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename="branded-image.png"');
        res.send(brandedBuffer);

    } catch (error) {
        console.error("[Controller] Image Branding Error:", error);
        res.status(500).json({ success: false, msg: "Internal Server Error during branding" });
    }
};
