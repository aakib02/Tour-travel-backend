import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  generateUploadSignature,
  createMedia,
  createMediaBulk,
  getMedia,
  getSingleMedia,
  deleteMedia,
  restoreMedia,
} from "../../controllers/media/index.js";


const router = express.Router();


// ============================================================
// ALL MEDIA ROUTES REQUIRE ADMIN AUTH
// ============================================================

router.use(
  authMiddleware,
  adminMiddleware
);


// ============================================================
// CLOUDINARY SIGNATURE
// ============================================================

router.post(
  "/upload/signature",
  generateUploadSignature
);


import upload from "../../middleware/uploadMiddleware.js";

// ============================================================
// SAVE CLOUDINARY MEDIA (Supports direct file & URL)
// ============================================================

router.post(
  "/upload",
  (req, res, next) => {
    if (req.headers["content-type"]?.includes("multipart/form-data")) {
      return upload.single("file")(req, res, (err) => {
        if (err) {
          return res.status(400).json({
            statusCode: 400,
            success: false,
            message: err.message || "File upload error",
          });
        }
        next();
      });
    }
    next();
  },
  createMedia
);

router.post(
  "/bulk-save",
  createMediaBulk
);


// ============================================================
// GET MEDIA
// ============================================================

router.get(
  "/get",
  getMedia
);


// ============================================================
// GET SINGLE MEDIA
// ============================================================

router.get(
  "/:id",
  getSingleMedia
);


// ============================================================
// DELETE
// ============================================================

router.delete(
  "/:id",
  deleteMedia
);


// ============================================================
// RESTORE
// ============================================================

router.patch(
  "/:id/restore",
  restoreMedia
);


export default router;