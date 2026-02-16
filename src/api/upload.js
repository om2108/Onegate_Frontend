// src/api/upload.js
import api from "./api";

export const uploadToCloudinary = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress(percent);
        }
      },
    });

    if (!res.data || !res.data.url) {
      throw new Error("No url field in /upload response");
    }

    return res.data.url;
 } catch (error) {
  const msg =
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Image upload failed";

  alert(msg);
  throw error;
}
};
