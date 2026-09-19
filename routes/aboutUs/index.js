import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createAboutUs,
  getAboutUs,
  getActiveAboutUs,
  updateAboutUs,
  deleteAboutUs,
  restoreAboutUs,
} from "../../controllers/aboutUs/index.js";

const router = express.Router();


// ============================================================
// PUBLIC
// ============================================================

router.get(
  "/active",
  getActiveAboutUs
);


// ============================================================
// ADMIN ONLY
// ============================================================

router.use(
  authMiddleware,
  adminMiddleware
);


router.post(
  "/create",
  createAboutUs
);


router.get(
  "/get",
  getAboutUs
);


router.put(
  "/:id",
  updateAboutUs
);


router.delete(
  "/:id",
  deleteAboutUs
);


router.patch(
  "/:id/restore",
  restoreAboutUs
);


export default router;