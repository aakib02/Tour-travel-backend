import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createHero,
  getHero,
  getActiveHero,
  updateHero,
  deleteHero,
  restoreHero,
} from "../../controllers/hero/index.js";

const router = express.Router();


// ============================================================
// PUBLIC WEBSITE
// ============================================================

// No login required
router.get(
  "/active",
  getActiveHero
);


// ============================================================
// ADMIN ONLY
// GET ACTIVE HERO (PUBLIC — USER FACING)
// ============================================================

router.get(
  "/get",
  getHero
);

// ============================================================
// ADMIN AUTH (PROTECTED MUTATIONS)
// ============================================================

router.use(
  authMiddleware,
  adminMiddleware
);


// Create Hero
router.post(
  "/create",
  createHero
);


// Update Hero
router.put(
  "/:id",
  updateHero
);


// Soft Delete Hero
router.delete(
  "/:id",
  deleteHero
);


// Restore Hero
router.patch(
  "/:id/restore",
  restoreHero
);

export default router;