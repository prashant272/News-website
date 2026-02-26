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

    let uploadedHeaderUrl = (headerImageUrl && !headerImageUrl.startsWith('data:image')) ? headerImageUrl : null;
    let uploadedSidebarUrl = (sidebarImageUrl && !sidebarImageUrl.startsWith('data:image')) ? sidebarImageUrl : null;

    const uploadPromises = [];

    if (headerImageUrl && headerImageUrl.startsWith('data:image')) {
      uploadPromises.push((async () => {
        try {
          const res = await cloudinary.uploader.upload(headerImageUrl, { folder: 'ads', resource_type: 'auto' });
          uploadedHeaderUrl = res.secure_url;
        } catch (err) { console.error("Header Ad Upload Error:", err); }
      })());
    }

    if (sidebarImageUrl && sidebarImageUrl.startsWith('data:image')) {
      uploadPromises.push((async () => {
        try {
          const res = await cloudinary.uploader.upload(sidebarImageUrl, { folder: 'ads', resource_type: 'auto' });
          uploadedSidebarUrl = res.secure_url;
        } catch (err) { console.error("Sidebar Ad Upload Error:", err); }
      })());
    }

    await Promise.all(uploadPromises);

    // Fallback logic for legacy imageUrl
    let finalHeaderUrl = uploadedHeaderUrl;
    let finalSidebarUrl = uploadedSidebarUrl;

    if (!finalHeaderUrl && !finalSidebarUrl && imageUrl) {
      if (imageUrl.startsWith('data:image')) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
            folder: 'ads',
            resource_type: 'auto',
          });
          if (placement === 'sidebar') {
            finalSidebarUrl = uploadResponse.secure_url;
          } else {
            finalHeaderUrl = uploadResponse.secure_url;
          }
        } catch (uploadError) {
          console.error("Legacy Ad Cloudinary Upload Error:", uploadError);
        }
      } else {
        if (placement === 'sidebar') finalSidebarUrl = imageUrl;
        else finalHeaderUrl = imageUrl;
      }
    }

    const newAd = new Ad({
      title,
      link,
      headerImageUrl: finalHeaderUrl,
      sidebarImageUrl: finalSidebarUrl,
      imageUrl: finalHeaderUrl || finalSidebarUrl,
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
    res.status(500).json({ success: false, msg: "Server error adding ad", error: error.message });
  }
};

exports.UpdateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link, headerImageUrl, sidebarImageUrl, imageUrl, isActive, placement } = req.body;

    if (!id) return res.status(400).json({ success: false, msg: "Ad ID is required" });

    const existingAd = await Ad.findById(id);
    if (!existingAd) return res.status(404).json({ success: false, msg: "Ad not found" });

    if (title !== undefined) existingAd.title = title;
    if (link !== undefined) existingAd.link = link;
    if (isActive !== undefined) existingAd.isActive = isActive;
    if (placement !== undefined) existingAd.placement = placement;

    const tasks = [];

    // Handle Header Image
    if (headerImageUrl && headerImageUrl.startsWith('data:image')) {
      tasks.push((async () => {
        if (existingAd.headerImageUrl) {
          try {
            const publicId = existingAd.headerImageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`ads/${publicId}`);
          } catch (err) { }
        }
        try {
          const res = await cloudinary.uploader.upload(headerImageUrl, { folder: 'ads', resource_type: 'auto' });
          existingAd.headerImageUrl = res.secure_url;
        } catch (err) { console.error("Update Header Ad Upload Error:", err); }
      })());
    } else if (headerImageUrl === "") {
      existingAd.headerImageUrl = "";
    } else if (headerImageUrl && !headerImageUrl.startsWith('data:image')) {
      existingAd.headerImageUrl = headerImageUrl;
    }

    // Handle Sidebar Image
    if (sidebarImageUrl && sidebarImageUrl.startsWith('data:image')) {
      tasks.push((async () => {
        if (existingAd.sidebarImageUrl) {
          try {
            const publicId = existingAd.sidebarImageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`ads/${publicId}`);
          } catch (err) { }
        }
        try {
          const res = await cloudinary.uploader.upload(sidebarImageUrl, { folder: 'ads', resource_type: 'auto' });
          existingAd.sidebarImageUrl = res.secure_url;
        } catch (err) { console.error("Update Sidebar Ad Upload Error:", err); }
      })());
    } else if (sidebarImageUrl === "") {
      existingAd.sidebarImageUrl = "";
    } else if (sidebarImageUrl && !sidebarImageUrl.startsWith('data:image')) {
      existingAd.sidebarImageUrl = sidebarImageUrl;
    }

    await Promise.all(tasks);

    existingAd.imageUrl = existingAd.headerImageUrl || existingAd.sidebarImageUrl;
    const updatedAd = await existingAd.save();

    return res.status(200).json({ success: true, ad: updatedAd, msg: "Ad updated successfully" });
  } catch (error) {
    console.error("Update Ad Error:", error);
    res.status(500).json({ success: false, msg: "Server error updating ad", error: error.message });
  }
};

exports.DeleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, msg: "Ad ID is required" });

    const ad = await Ad.findById(id);
    if (!ad) return res.status(404).json({ success: false, msg: "Ad not found" });

    if (ad.imageUrl) {
      const urlParts = ad.imageUrl.split('/');
      const publicId = urlParts[urlParts.length - 1].split('.')[0];
      // Do not await, let it happen in background for faster response if desired, 
      // but here we wait for consistency unless it's a bottleneck.
      try { await cloudinary.uploader.destroy(`ads/${publicId}`); } catch (err) { }
    }

    await Ad.findByIdAndDelete(id);
    return res.status(200).json({ success: true, deleted: true, msg: "Ad deleted successfully" });
  } catch (error) {
    console.error("Delete Ad Error:", error);
    res.status(500).json({ success: false, msg: "Server error deleting ad", error: error.message });
  }
};

exports.GetAllAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, ads, data: ads, total: ads.length });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Server error fetching ads", error: error.message });
  }
};

exports.GetActiveAds = async (req, res) => {
  try {
    const ads = await Ad.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, ads, data: ads, total: ads.length });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Server error fetching active ads", error: error.message });
  }
};
