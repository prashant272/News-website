const cloudinary = require('cloudinary').v2;
const Ad = require('../Models/advertisement.model');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.AddAd = async (req, res) => {
  try {
    const { title, link, headerImageUrl, sidebarImageUrl, imageUrl, isActive, placement } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        msg: "Missing required field: title",
      });
    }

    let uploadedHeaderUrl;
    if (headerImageUrl && headerImageUrl.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(headerImageUrl, {
        folder: 'ads',
        resource_type: 'auto',
      });
      uploadedHeaderUrl = uploadResponse.secure_url;
    } else if (headerImageUrl) {
      uploadedHeaderUrl = headerImageUrl;
    }

    let uploadedSidebarUrl;
    if (sidebarImageUrl && sidebarImageUrl.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(sidebarImageUrl, {
        folder: 'ads',
        resource_type: 'auto',
      });
      uploadedSidebarUrl = uploadResponse.secure_url;
    } else if (sidebarImageUrl) {
      uploadedSidebarUrl = sidebarImageUrl;
    }

    // Fallback logic for old imageUrl/placement if provided
    let finalHeaderUrl = uploadedHeaderUrl;
    let finalSidebarUrl = uploadedSidebarUrl;

    if (!finalHeaderUrl && !finalSidebarUrl && imageUrl) {
      const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
        folder: 'ads',
        resource_type: 'auto',
      });
      if (placement === 'sidebar') {
        finalSidebarUrl = uploadResponse.secure_url;
      } else {
        finalHeaderUrl = uploadResponse.secure_url;
      }
    }

    const newAd = new Ad({
      title,
      link,
      headerImageUrl: finalHeaderUrl,
      sidebarImageUrl: finalSidebarUrl,
      imageUrl: finalHeaderUrl || finalSidebarUrl, // back compat
      isActive: isActive !== undefined ? isActive : true,
      placement: placement || (finalSidebarUrl && !finalHeaderUrl ? 'sidebar' : 'header'),
    });

    const savedAd = await newAd.save();

    return res.status(201).json({
      success: true,
      ad: savedAd,
      msg: "Ad added successfully",
    });
  } catch (error) {
    console.error("Add Ad Error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error adding ad",
      error: error.message,
    });
  }
};

exports.UpdateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link, headerImageUrl, sidebarImageUrl, imageUrl, isActive, placement } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        msg: "Ad ID is required",
      });
    }

    const existingAd = await Ad.findById(id);

    if (!existingAd) {
      return res.status(404).json({
        success: false,
        msg: "Ad not found",
      });
    }

    if (title !== undefined) existingAd.title = title;
    if (link !== undefined) existingAd.link = link;
    if (isActive !== undefined) existingAd.isActive = isActive;
    if (placement !== undefined) existingAd.placement = placement;

    // Handle Header Image
    if (headerImageUrl && headerImageUrl.startsWith('data:image')) {
      if (existingAd.headerImageUrl) {
        try {
          const publicId = existingAd.headerImageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`ads/${publicId}`);
        } catch (err) { }
      }
      const uploadResponse = await cloudinary.uploader.upload(headerImageUrl, {
        folder: 'ads',
        resource_type: 'auto',
      });
      existingAd.headerImageUrl = uploadResponse.secure_url;
    } else if (headerImageUrl === "") {
      existingAd.headerImageUrl = "";
    }

    // Handle Sidebar Image
    if (sidebarImageUrl && sidebarImageUrl.startsWith('data:image')) {
      if (existingAd.sidebarImageUrl) {
        try {
          const publicId = existingAd.sidebarImageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`ads/${publicId}`);
        } catch (err) { }
      }
      const uploadResponse = await cloudinary.uploader.upload(sidebarImageUrl, {
        folder: 'ads',
        resource_type: 'auto',
      });
      existingAd.sidebarImageUrl = uploadResponse.secure_url;
    } else if (sidebarImageUrl === "") {
      existingAd.sidebarImageUrl = "";
    }

    // Backwards compatibility sync
    existingAd.imageUrl = existingAd.headerImageUrl || existingAd.sidebarImageUrl;

    const updatedAd = await existingAd.save();

    return res.status(200).json({
      success: true,
      ad: updatedAd,
      msg: "Ad updated successfully",
    });
  } catch (error) {
    console.error("Update Ad Error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error updating ad",
      error: error.message,
    });
  }
};

exports.DeleteAd = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        msg: "Ad ID is required",
      });
    }

    const ad = await Ad.findById(id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        msg: "Ad not found",
      });
    }

    if (ad.imageUrl) {
      try {
        const urlParts = ad.imageUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        await cloudinary.uploader.destroy(`ads/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
      }
    }

    await Ad.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      deleted: true,
      msg: "Ad deleted successfully",
    });
  } catch (error) {
    console.error("Delete Ad Error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error deleting ad",
      error: error.message,
    });
  }
};

exports.GetAllAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      ads,
      data: ads,
      total: ads.length,
    });
  } catch (error) {
    console.error("Get Ads Error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error fetching ads",
      error: error.message,
    });
  }
};

exports.GetActiveAds = async (req, res) => {
  try {
    const ads = await Ad.find({ isActive: true }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      ads,
      data: ads,
      total: ads.length,
    });
  } catch (error) {
    console.error("Get Active Ads Error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error fetching active ads",
      error: error.message,
    });
  }
};
