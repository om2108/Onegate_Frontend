// src/hooks/useCloudinaryUpload.js
import { useState } from "react";
import { uploadToCloudinary } from "../api/upload";

export default function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, (p) => setProgress(p));
      return url;
    } catch (err) {
      alert("Image upload failed. Please try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, progress };
}
