const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

async function updateSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const User = mongoose.model("User", require("../Models/user.model").schema);

    // 1. Upload logo1.jpeg
    const logoPath = path.join(__dirname, "..", "Assets", "logo1.jpeg");
    console.log("Uploading logo from:", logoPath);
    
    const uploadResult = await cloudinary.uploader.upload(logoPath, {
      folder: "profile_pictures",
      public_id: "super_admin_logo"
    });

    console.log("Upload Success:", uploadResult.secure_url);

    // 2. Find and update Super Admin
    // We try to find by role and original name
    const result = await User.findOneAndUpdate(
      { role: "SUPER_ADMIN", name: "primetime" },
      { 
        name: "News Desk",
        ProfilePicture: uploadResult.secure_url
      },
      { new: true }
    );

    if (result) {
      console.log("Super Admin Updated Successfully!");
      console.log("New Name:", result.name);
      console.log("New Image:", result.ProfilePicture);
    } else {
      console.log("Super Admin with name 'primetime' not found. Checking by ID or Role only...");
      const fallback = await User.findOneAndUpdate(
        { role: "SUPER_ADMIN" },
        { 
          name: "News Desk",
          ProfilePicture: uploadResult.secure_url
        },
        { new: true }
      );
      if (fallback) console.log("Super Admin (first one found) Updated!");
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error("Update Error:", err.message);
  }
}

updateSuperAdmin();
