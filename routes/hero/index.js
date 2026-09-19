import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createHero,
  getHero,
  updateHero,
  deleteHero,
  restoreHero,
} from "../../controllers/hero/index.js";

const router = express.Router();

// ============================================================
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

// ============================================================
// CREATE
// ============================================================

router.post(
  "/create",
  createHero
);



// ============================================================
// UPDATE
// ============================================================

router.put(
  "/:id",
  updateHero
);

// ============================================================
// DELETE
// ============================================================

router.delete(
  "/:id",
  deleteHero
);

// ============================================================
// RESTORE
// ============================================================

router.patch(
  "/:id/restore",
  restoreHero
);

export default router;