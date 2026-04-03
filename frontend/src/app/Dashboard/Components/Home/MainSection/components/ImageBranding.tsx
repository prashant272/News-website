"use client";
import React, { useState, useRef } from "react";
import styles from "./ImageBranding.module.scss";

const ImageBranding: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setPreviewUrl(null);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleProcessImage = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
            // Use relative URL or environment variable
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8086'}/api/images/brand`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to process image. Make sure the server is running.");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
        } catch (err: any) {
            console.error("Branding Error:", err);
            setError(err.message || "Something went wrong while processing the image.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className={styles.brandingContainer}>
            {!selectedFile ? (
                <div className={styles.uploadSection} onClick={handleUploadClick}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        style={{ display: "none" }} 
                    />
                    <span className={styles.uploadIcon}>📁</span>
                    <span className={styles.uploadText}>Drop an image here or click to browse</span>
                    <span className={styles.uploadSubtext}>Supports JPG, PNG, WEBP (Max 10MB)</span>
                </div>
            ) : (
                <div className={styles.fileInfo}>
                    <span>📄 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <button className={styles.removeBtn} onClick={handleRemoveFile}>Remove</button>
                </div>
            )}

            {selectedFile && !previewUrl && (
                <div className={styles.actions}>
                    <button 
                        className={styles.processBtn} 
                        onClick={handleProcessImage} 
                        disabled={isProcessing}
                    >
                        {isProcessing ? "Adding Branding..." : "✨ Add Logo"}
                    </button>
                </div>
            )}

            {isProcessing && (
                <div className={styles.loader}>
                    <div className={styles.spinner} />
                    <span>Processing your image...</span>
                </div>
            )}

            {error && <div className={styles.errorMsg}>❌ {error}</div>}

            {previewUrl && (
                <div className={styles.previewSection}>
                    <h2>Branded Preview</h2>
                    <div className={styles.imageWrapper}>
                        <img src={previewUrl} alt="Branded News" />
                    </div>
                    <div className={styles.actions}>
                        <a 
                            href={previewUrl} 
                            download={`branded-${selectedFile?.name || 'news.png'}`} 
                            className={styles.downloadBtn}
                        >
                            ⬇️ Download Branded Image
                        </a>
                        <button className={styles.processBtn} onClick={handleRemoveFile} style={{background: '#6c757d'}}>
                            Clear & Start Over
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageBranding;
