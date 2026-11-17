import upload from "./uploadMiddleware.js";

// Re-export standard upload middleware to prevent crashes from missing multer-storage-cloudinary
export default upload;
