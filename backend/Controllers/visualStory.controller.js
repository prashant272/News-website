const VisualStory = require("../Models/VisualStory");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: (process.env.CLOUD_NAME || "").trim(),
    api_key: (process.env.API_KEY || "").trim(),
    api_secret: (process.env.API_SECRET || "").trim(),
});

const uploadToCloudinary = async (image, folder = "visual_stories") => {
    if (!image || typeof image !== 'string' || image.startsWith('http')) return image;

    const sizeInMB = (image.length / (1024 * 1024)).toFixed(2);
    console.log(`DEBUG: Cloudinary upload attempt started (Size: ${sizeInMB} MB)...`);

    try {
        const res = await cloudinary.uploader.upload(image, {
            folder,
            timeout: 120000 // Increase timeout to 120 seconds
        });
        return res.secure_url;
    } catch (err) {
        const errorMsg = err.message || (err.error && err.error.message) || "Unknown Cloudinary Error";
        console.error("Cloudinary Upload Error Details:", {
            errorMsg,
            fullError: err
        });
        throw new Error(`Cloudinary Upload Failed: ${errorMsg}`);
    }
};

exports.getVisualStories = async (req, res) => {
    try {
        const { includeInactive } = req.query;
        const query = includeInactive === 'true' ? {} : { isActive: true };
        const stories = await VisualStory.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: stories.length, data: stories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching visual stories", error: error.message });
    }
};

exports.createVisualStory = async (req, res) => {
    try {
        const { title, thumbnail, category, slides } = req.body;

        if (!title || !thumbnail || !category) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: title, thumbnail and category are mandatory."
            });
        }

        if (!slides || slides.length === 0) {
            return res.status(400).json({
                success: false,
                message: "A visual story must have at least one slide."
            });
        }

        const uploadedThumbnail = await uploadToCloudinary(thumbnail);
        const processedSlides = await Promise.all(
            (slides || []).map(async (slide) => {
                const uploadedUrl = await uploadToCloudinary(slide.image);
                return {
                    title: slide.title || "",
                    description: slide.description || "",
                    link: slide.link || "",
                    source: slide.source || "",
                    image: uploadedUrl,
                    videoUrl: slide.videoUrl || ""
                };
            })
        );

        console.log("DEBUG: Saving story with processed slides:", processedSlides.map(s => ({ title: s.title, source: s.source })));

        const story = await VisualStory.create({
            title,
            thumbnail: uploadedThumbnail,
            category,
            slides: processedSlides
        });

        res.status(201).json({ success: true, data: story });
    } catch (error) {
        console.error("DEBUG CREATE STORY ERROR:", error);
        res.status(400).json({ success: false, message: "Error creating visual story", error: error.message });
    }
};

exports.updateVisualStory = async (req, res) => {
    try {
        const { title, thumbnail, category, slides, isActive } = req.body;
        const storyId = req.params.id;

        if (!title || !thumbnail || !category) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: title, thumbnail and category are mandatory."
            });
        }

        const uploadedThumbnail = await uploadToCloudinary(thumbnail);
        const processedSlides = await Promise.all(
            (slides || []).map(async (slide) => {
                const uploadedUrl = await uploadToCloudinary(slide.image);
                return {
                    title: slide.title || "",
                    description: slide.description || "",
                    link: slide.link || "",
                    source: slide.source || "",
                    image: uploadedUrl,
                    videoUrl: slide.videoUrl || ""
                };
            })
        );

        console.log("DEBUG: Updating story with processed slides:", processedSlides.map(s => ({ title: s.title, source: s.source })));

        const updatedStory = await VisualStory.findByIdAndUpdate(
            storyId,
            {
                title,
                thumbnail: uploadedThumbnail,
                category,
                slides: processedSlides,
                isActive
            },
            { new: true }
        );

        if (!updatedStory) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, data: updatedStory });
    } catch (error) {
        console.error("DEBUG UPDATE STORY ERROR:", error);
        res.status(400).json({ success: false, message: "Error updating", error: error.message });
    }
};

exports.deleteVisualStory = async (req, res) => {
    try {
        const story = await VisualStory.findByIdAndDelete(req.params.id);
        if (!story) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getStoryById = async (req, res) => {
    try {
        const story = await VisualStory.findById(req.params.id);
        if (!story) return res.status(404).json({ success: false, message: "Story not found" });
        story.viewCount += 1;
        await story.save();
        res.status(200).json({ success: true, data: story });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching story", error: error.message });
    }
};

exports.getStoryBySlug = async (req, res) => {
    try {
        const story = await VisualStory.findOne({ slug: req.params.slug });
        if (!story) return res.status(404).json({ success: false, message: "Story not found" });
        story.viewCount += 1;
        await story.save();
        res.status(200).json({ success: true, data: story });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching story", error: error.message });
    }
};
