import axios from "axios"
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8086"
const API = axios.create({ baseURL: baseURL })

/**
 * Compresses an image data URL (base64) using Canvas.
 * @param {string} dataUrl - The original base64 image.
 * @param {number} maxWidth - Maximum width for the image.
 * @param {number} quality - JPEG quality (0 to 1).
 */
const compressImage = (dataUrl, maxWidth = 1200, quality = 0.6) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => resolve(dataUrl); // Fallback to original
    });
};

export { axios, API, baseURL, compressImage }



