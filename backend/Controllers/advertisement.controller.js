const cloudinary = require('cloudinary').v2;
const Ad = require('../Models/advertisement.model'); 

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.AddAd = async (req, res) => {
  try {
    const { title, link, imageUrl, isActive } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({
        success: false,
        msg: "Missing required fields: title, imageUrl",
      });
    }

    let uploadedImageUrl;
    if (imageUrl) {
      const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
        folder: 'ads',
        resource_type: 'auto',
      });
      uploadedImageUrl = uploadResponse.secure_url;
    }

    const newAd = new Ad({
      title,
      link,
      imageUrl: uploadedImageUrl,
      isActive: isActive !== undefined ? isActive : true,
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
    const { title, link, imageUrl, isActive } = req.body;

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

    if (imageUrl && imageUrl.startsWith('data:image')) {
      if (existingAd.imageUrl) {
        try {
          const urlParts = existingAd.imageUrl.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExtension.split('.')[0];
          await cloudinary.uploader.destroy(`ads/${publicId}`);
        } catch (cloudinaryError) {
          console.error("Cloudinary deletion error:", cloudinaryError);
        }
      }

      const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
        folder: 'ads',
        resource_type: 'auto',
      });
      existingAd.imageUrl = uploadResponse.secure_url;
    }

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
