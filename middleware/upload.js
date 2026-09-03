import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "application/pdf",
];

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";

    return {
      folder: isPdf ? "travel/pdfs" : "travel/images",

      resource_type: isPdf ? "raw" : "image",

      public_id: `${Date.now()}-${file.originalname
        .split(".")[0]
        .replace(/[^a-zA-Z0-9]/g, "-")}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP images and PDF files are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;