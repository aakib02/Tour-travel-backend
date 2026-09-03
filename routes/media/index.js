import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  generateUploadSignature,
  createMedia,
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


// ============================================================
// SAVE CLOUDINARY MEDIA
// ============================================================

router.post(
  "/upload",
  createMedia
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