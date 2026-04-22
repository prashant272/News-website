const AWS = require('aws-sdk');
const dotenv = require("dotenv");

// Load env if not already loaded
dotenv.config();

/**
 * Cloudflare R2 Configuration using AWS SDK v2
 */
const s3 = new AWS.S3({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'auto', // R2 requires 'auto' or a specific region logic
});

/**
 * Uploads a buffer to Cloudflare R2.
 */
const uploadToR2 = async (buffer, fileName, contentType = "image/png") => {
  try {
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrlBase = process.env.R2_PUBLIC_URL || `https://${bucketName}.${process.env.R2_ACCOUNT_ID}.r2.dev`;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    };

    const data = await s3.upload(params).promise();
    console.log("[R2-Storage] Upload Success:", data.Key);

    const cleanBase = publicUrlBase.endsWith('/') ? publicUrlBase.slice(0, -1) : publicUrlBase;
    return `${cleanBase}/${fileName}`;
  } catch (error) {
    console.error("[R2-Storage] Upload Error:", error);
    throw new Error("Failed to upload image to Cloudflare R2");
  }
};

module.exports = { uploadToR2 };
